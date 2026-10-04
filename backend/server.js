require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { MongoClient, GridFSBucket } = require("mongodb");
const { initKafka, sendEmailEvent } = require('./kafka');
const  {Company, User, Team, Course, Session, Enrollment, CareerPath, Review, Job, Notification} = require('./items'); 
const { verifyToken, checkAdmin, checkManager, checkManagerOrAdmin, can_manage_course } = require('./permissions').default;
const { createInAppNotification, sendEmailNotification, notifyCourseAssigned, notifyCourseCompleted } = require('./notifications');
const { Readable } = require('stream');

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
const PORT = 5000;
const FIREBASE_SEED_DEFAULT_PASSWORD = process.env.FIREBASE_SEED_DEFAULT_PASSWORD || 'TrainU+123!';
const AUTO_SYNC_FIREBASE_USERS = process.env.AUTO_SYNC_FIREBASE_USERS !== 'false';

const serviceAccount = require("./trainu.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));


const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/database';

/* To sync the users in MongoDB with Firebase Auth, we will create a function that checks each user in MongoDB and ensures they have a corresponding Firebase Auth user. If a MongoDB user does not have a firebase_uid or if the firebase_uid does not match any user in Firebase Auth, we will create a new Firebase Auth user and update the MongoDB user with the new firebase_uid. This function can be called on server startup or via an API endpoint for manual syncing. */
async function syncMongoUsersToFirebase({ defaultPassword = FIREBASE_SEED_DEFAULT_PASSWORD, dryRun = false } = {}) {
  if (!defaultPassword || defaultPassword.length < 6) {
    throw new Error('defaultPassword must have at least 6 characters.');
  }

  const mongoUsers = await User.find({ email: { $exists: true, $ne: null } });

  const created = [];
  const alreadyExisting = [];
  const failed = [];

  for (const mongoUser of mongoUsers) {
    try {
      const firebaseUser = await admin.auth().getUserByEmail(mongoUser.email);

      if (!mongoUser.firebase_uid || mongoUser.firebase_uid !== firebaseUser.uid) {
        mongoUser.firebase_uid = firebaseUser.uid;
        if (!dryRun) {
          await mongoUser.save();
        }
      }

      alreadyExisting.push(mongoUser.email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        if (dryRun) {
          created.push({ email: mongoUser.email, uid: 'dry-run' });
          continue;
        }

        const firebaseUser = await admin.auth().createUser({
          email: mongoUser.email,
          password: defaultPassword,
          displayName: mongoUser.name || mongoUser.email
        });

        mongoUser.firebase_uid = firebaseUser.uid;
        await mongoUser.save();
        created.push({ email: mongoUser.email, uid: firebaseUser.uid });
      } else {
        failed.push({ email: mongoUser.email, error: error.message });
      }
    }
  }

  return {
    message: 'Firebase user sync finished',
    defaultPasswordUsed: dryRun ? 'dry-run' : defaultPassword,
    totalMongoUsers: mongoUsers.length,
    createdCount: created.length,
    existingCount: alreadyExisting.length,
    failedCount: failed.length,
    created,
    alreadyExisting,
    failed
  };
}

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to MongoDB successfully!');

    const db = mongoose.connection.db;

    const bucket = new GridFSBucket(db, {
      bucketName: "images"
    });

    app.set("imageBucket", bucket);

    if (AUTO_SYNC_FIREBASE_USERS) {
      try {
        const result = await syncMongoUsersToFirebase({ defaultPassword: FIREBASE_SEED_DEFAULT_PASSWORD });
        console.log(`[Firebase Sync] created=${result.createdCount}, existing=${result.existingCount}, failed=${result.failedCount}`);
      } catch (syncError) {
        console.error('[Firebase Sync] Startup sync failed:', syncError.message);
      }
    } else {
      console.log('[Firebase Sync] Skipped on startup (AUTO_SYNC_FIREBASE_USERS=false)');
    }

    try {
      await initKafka();
      console.log('[Kafka] Producer and consumer ready');
    } catch (err) {
      console.error('[Kafka] Init failed:', err.message);
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));


/**
 * User Creation Route
 * This creates a user in Firebase Auth AND MongoDB.
 * Requires admin authentication.
 */

app.post('/api/admin/create-user', verifyToken, checkAdmin,async (req, res) => {
  const { email, password, name, role, company_id, image_url, teamId } = req.body;
  const fullName = name.trim() || email;

  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  if (teamId) {
    const selectedTeam = await Team.findOne({ _id: teamId, company_id });
    if (!selectedTeam) {
      return res.status(400).json({ error: 'Selected team is not available for this company.' });
    }
  }

  try {
    const firebaseUser = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: fullName || email,
    });
    const normalizedJobDescription = typeof jobDescription === 'string' && jobDescription.trim() !== ''
      ? jobDescription.trim()
      : null;

    // 2. Normalize linkedin URL string input safely
    const normalizedLinkedin = typeof linkedin === 'string' ? linkedin.trim() : '';

    const newUser = new User({
      name: fullName || email,
      firebase_uid: firebaseUser.uid,
      email: email,
      role: role || 'employee',
      company_id: company_id,
      career_path_id: normalizedJobDescription,
      linkedin: normalizedLinkedin, // 3. Persisted field data to user payload
      image_url: typeof image_url === 'string' && image_url.trim()
        ? image_url.trim()
        : undefined
    });

    await newUser.save();

    if (teamId) {
      await Team.updateOne(
        { _id: teamId },
        { $addToSet: { member_ids: newUser._id } }
      );
    }

    res.status(201).json({ 
      message: 'User created successfully',
      uid: firebaseUser.uid,
      userId: newUser._id,
      image_url: newUser.image_url
    });

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'This email is already registered in Firebase.' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Enroll a person in a course
 */
app.post('/api/enroll', verifyToken, checkManagerOrAdmin, async (req, res) => {
  const manager_or_admin = await User.findById(req.user.uid);
  const employee = await User.findById(req.body.employee_id);
  const course = await Course.findById(req.body.course_id);

  if (!manager_or_admin || !employee || !course) {
    return res.status(404).json({ error: 'Manager/Admin, Employee, or Course not found' });
  }

  if (!can_manage_course(manager_or_admin, employee)) {
    return res.status(403).json({ error: 'Access denied. You do not have permission to manage this person courses.' });
  }
  if (Enrollment.findOne({ user_id: employee._id, course_id: course._id })) {
    return res.status(400).json({ error: 'Employee is already enrolled in this course' });
  }

  try {
    const newEnrollment = new Enrollment({
      user_id: employee._id,
      course_id: course._id,
      status: 'registered',
      enrolled_at: new Date(),
      session_attendance: [],
      completed_at: null
    });
    await newEnrollment.save();
    // Trigger notification for course assignment
    await notifyCourseAssigned({ user: employee, courseTitle: course.title });
    return res.status(201).json({ message: 'Employee enrolled successfully', enrollment: newEnrollment });
  } catch (error) {
    console.error('Error enrolling employee:', error);
    return res.status(500).json({ error: 'Failed to enroll employee in course' });
  }
});

/**
 * Remove a person from a course
 */
app.post('/api/removeFromCourse', verifyToken, checkManagerOrAdmin, async (req, res) => {
  const manager_or_admin = await User.findById(req.user.uid);
  const employee = await User.findById(req.body.employee_id);
  const course = await Course.findById(req.body.course_id);

  if (!manager_or_admin || !employee || !course) {
    return res.status(404).json({ error: 'Manager/Admin, Employee, or Course not found' });
  }

  if (!can_manage_course(manager_or_admin, employee)) {
    return res.status(403).json({ error: 'Access denied. You do not have permission to manage this person courses.' });
  }

  if (Enrollment.findOne({ user_id: employee._id, course_id: course._id })) {
    try {
      await Enrollment.findOneAndDelete({ user_id: employee._id, course_id: course._id });
      return res.status(200).json({ message: 'Employee removed from course successfully' });
    } catch (error) {
      console.error('Error removing employee from course:', error);
      return res.status(500).json({ error: 'Failed to remove employee from course' });
    }
  }else {
    return res.status(404).json({ error: 'Enrollment not found for this employee and course' });
  }
});



app.post('/api/admin/sync-firebase-users', async (req, res) => {
  const { defaultPassword, dryRun } = req.body || {};
  const passwordToUse = defaultPassword || FIREBASE_SEED_DEFAULT_PASSWORD;

  try {
    const result = await syncMongoUsersToFirebase({ defaultPassword: passwordToUse, dryRun: !!dryRun });
    return res.json(result);
  } catch (error) {
    console.error('Error syncing Firebase users:', error.message);
    if (error.message && error.message.includes('at least 6 characters')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to sync users with Firebase Auth.' });
  }
});


app.get('/api/status', (req, res) => {
  res.json({ message: "Hello from your Node.js Backend inside Docker!" });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); 
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch data from the database' });
  }
});
// GET /api/usersP - Fetch users with pagination, search, and optional detailed data
app.get('/api/usersP', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const skip = (page - 1) * limit;
    const detailed = req.query.detailed === 'true';

    let searchQuery = {};
    if (search && search.trim()) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [total, users] = await Promise.all([
      User.countDocuments(searchQuery),
      User.find(searchQuery)
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);
    
    // Only fetch additional data if detailed=true
    if (detailed) {
      // Get all user IDs
      const userIds = users.map(u => u._id.toString());
      
      // Fetch all jobs for these users
      const jobIds = users.filter(u => u.job_id).map(u => u.job_id);
      let jobMap = new Map();
      if (jobIds.length > 0) {
        const jobs = await Job.find({ _id: { $in: jobIds } }).lean();
        jobMap = new Map(jobs.map(j => [j._id.toString(), j]));
      }
      
      // Fetch all teams for these users
      const allTeams = await Team.find({ 
        member_ids: { $in: userIds }
      }).lean();
      
      // Map teams to users
      const userTeamMap = new Map();
      userIds.forEach(id => userTeamMap.set(id, []));
      
      allTeams.forEach(team => {
        if (team.member_ids && Array.isArray(team.member_ids)) {
          team.member_ids.forEach(memberId => {
            const memberIdStr = memberId.toString();
            if (userTeamMap.has(memberIdStr)) {
              userTeamMap.get(memberIdStr).push(team.name);
            }
          });
        }
      });
      
      // Enrich users with detailed data
      const enrichedUsers = users.map(user => ({
        ...user,
        job_id: user.job_id && jobMap.has(user.job_id.toString()) 
          ? jobMap.get(user.job_id.toString()) 
          : user.job_id,
        teams: userTeamMap.get(user._id.toString()) || []
      }));
      
      res.json({
        users: enrichedUsers,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        limit,
        detailed: true
      });
    } else {
      // Original response for existing calls (backward compatible)
      res.json({
        users,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        limit
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from the database',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, name, role, password, image_url, teamId } = req.body;

    if (typeof password === 'string' && password.trim().length > 0 && password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (teamId !== undefined && teamId !== '') {
      const selectedTeam = await Team.findOne({ _id: teamId, company_id: user.company_id });
      if (!selectedTeam) {
        return res.status(400).json({ error: 'Selected team is not available for this company.' });
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const fullName = name.trim() || email;
    const normalizedRole = role || user.role || 'employee';

    const duplicateUser = await User.findOne({ email, _id: { $ne: userId } }).lean();
    if (duplicateUser) {
      return res.status(400).json({ error: 'Another user already uses this email.' });
    }

    if (user.firebase_uid) {
      try {
        const firebaseUpdate = {
          email,
          displayName: fullName,
        };

        if (typeof password === 'string' && password.trim().length > 0) {
          firebaseUpdate.password = password;
        }

        await admin.auth().updateUser(user.firebase_uid, firebaseUpdate);
      } catch (firebaseError) {
        console.error('Error updating Firebase user:', firebaseError);
        return res.status(500).json({ error: 'Failed to update user in Firebase.' });
      }
    }

    user.name = fullName;
    user.email = email;
    user.role = normalizedRole;
    if (typeof image_url === 'string') {
      user.image_url = image_url.trim();
    }
    await user.save();

    if (teamId === '') {
      await Team.updateMany(
        { member_ids: user._id },
        { $pull: { member_ids: user._id } }
      );
    } else if (teamId) {
      await Team.updateMany(
        { member_ids: user._id, _id: { $ne: teamId } },
        { $pull: { member_ids: user._id } }
      );

      await Team.updateOne(
        { _id: teamId },
        { $addToSet: { member_ids: user._id } }
      );
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the user from team member lists and manager assignments.
    await Team.updateMany(
      { member_ids: userId },
      { $pull: { member_ids: userId } }
    );

    await Team.updateMany(
      { team_leader_id: userId },
      { $set: { team_leader_id: null } }
    );

    // Remove enrollments tied to this user.
    await Enrollment.deleteMany({ user_id: userId });

    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/users/check', async (req, res) => {
    const { email } = req.query; // Changed from params to query to match your Frontend fetch
    
    try {
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email: email });
        
        if (user) {
            // Send back 'exists' and the user object so the context knows the Role
            res.status(200).json({ 
                exists: true, 
                user: user 
            });
        } else {
            res.status(404).json({ 
                exists: false, 
                message: "Access denied. Email not registered." 
            });
        }
    } catch (error) {
        console.error("Check error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get('/api/users/:userId/courses', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const enrollments = await Enrollment.find({ user_id: userId });

    const courseIds = enrollments.map(enrollment => enrollment.course_id);

    const courses = await Course.find({
      _id: { $in: courseIds }
    });

    res.json({
      userId,
      totalCourses: courses.length,
      courses
    });

  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({
      message: 'Error fetching user courses',
      error
    });
  }
});

app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.query.user;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required in query parameters' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const course = await Course.findById(courseObjectId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      user_id: userObjectId,
      course_id: courseObjectId
    });

    const sessions = await Session.find({ course_id: courseObjectId });

    // Fetch reviews for this course and populate reviewer name
    const Review = mongoose.connection.db.collection('reviews');
    const rawReviews = await Review.find({ course_id: courseObjectId }).toArray();

    const reviewerIds = rawReviews.map(r => r.user_id);
    const reviewers = await User.find({ _id: { $in: reviewerIds } }, { name: 1 });
    const reviewerMap = Object.fromEntries(reviewers.map(u => [u._id.toString(), u.name]));

    const reviews = rawReviews.map(r => ({
      user_name: reviewerMap[r.user_id.toString()] || 'Anonymous',
      user_id: r.user_id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at
    }));


    // 6. Return everything in the response
    return res.status(200).json({
      course,
      enrollment: enrollment || null,
      sessions: sessions || [],
      reviews: reviews || []
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
});

app.post('/api/courses/:courseId/review', async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.headers['userid']; 
    const { rating, comment } = req.body;

    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Only completed enrollments can review
    const enrollment = await Enrollment.findOne({
      user_id: userObjectId,
      course_id: courseObjectId,
      status: 'completed'
    });
    if (!enrollment) return res.status(403).json({ message: 'You must complete the course before reviewing.' });

    // One review per user per course
    const reviewsCollection = mongoose.connection.db.collection('reviews');
    const existing = await reviewsCollection.findOne({
      course_id: courseObjectId,
      user_id: userObjectId
    });
    if (existing) return res.status(409).json({ message: 'You have already reviewed this course.' });

    // Insert the review
    const newReview = {
      course_id: courseObjectId,
      user_id: userObjectId,
      rating,
      comment: comment || '',
      created_at: new Date()
    };
    const result = await reviewsCollection.insertOne(newReview);

    // Fetch user name to return the shaped review to the frontend
    const user = await User.findById(userObjectId, { name: 1 });
    const shapedReview = {
      _id: result.insertedId,
      user_name: user?.name || 'Anonymous',
      rating,
      comment: comment || '',
      createdAt: newReview.created_at
    };

    return res.status(201).json({ review: shapedReview });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
});

app.get('/api/teams/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('role company_id').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let teamQuery = { team_leader_id: userId };

    // Admins should see all teams from their company on My Teams page.
    if (user.role === 'admin') {
      if (user.company_id) {
        teamQuery = { company_id: user.company_id };
      } else {
        teamQuery = {};
      }
    }

    const teams = await Team.find(teamQuery)
      .populate('company_id')
      .populate('team_leader_id')
      .populate('member_ids')
      .exec();
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

/*
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('team_leader_id')
      .populate('member_ids')
      .exec();
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});
*/

// Enhanced endpoint with pagination and search for teams
app.get('/api/teams', async (req, res) => {
  try {
    const returnAll = req.query.all === 'true';
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const companyId = req.query.companyId || '';
    const skip = (page - 1) * limit;

    let searchQuery = {};
    if (search) {
      searchQuery.name = { $regex: search, $options: 'i' };
    }
    if (companyId) {
      searchQuery.company_id = companyId;
    }

    let query = Team.find(searchQuery)
      .populate('team_leader_id', 'name email')
      .populate('member_ids', 'name email role')
      .sort({ createdAt: -1 });

    if (!returnAll) {
      query = query.skip(skip).limit(limit);
    }

    const teams = await query.exec();
    
    const total = await Team.countDocuments(searchQuery);
    
    res.json({
      teams,
      currentPage: returnAll ? 1 : page,
      totalPages: returnAll ? 1 : Math.ceil(total / limit),
      totalTeams: total,
      limit: returnAll ? total : limit
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch data from the database' });
  }
});


app.post('/api/teams/create', async (req, res) => {
  try {
    const { name, team_leader_id, company_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const existingTeam = await Team.findOne({ name: name.trim() });
    if (existingTeam) {
      return res.status(400).json({ error: 'A team with this name already exists.' });
    }

    const newTeam = new Team({
      name: name,
      company_id: company_id || null,
      team_leader_id: team_leader_id || null,
      member_ids: []
    });

    await newTeam.save();
    
    const populatedTeam = await Team.findById(newTeam._id)
      .populate('team_leader_id')
      .populate('member_ids');

    res.status(201).json({ 
      message: 'Team created successfully',
      team: populatedTeam 
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.post('/api/teams/add-manager', async (req, res) => {
  try {
    const { teamId, managerId } = req.body;

    if (!teamId || !managerId) {
      return res.status(400).json({ error: 'Team ID and Manager ID are required' });
    }

    const managerUser = await User.findById(managerId).select('role');
    if (!managerUser) {
      return res.status(404).json({ error: 'Manager user not found' });
    }

    if (managerUser.role !== 'manager') {
      return res.status(400).json({ error: 'Only users with manager role can be assigned to a team' });
    }

    const team = await Team.findByIdAndUpdate(
      teamId,
      { team_leader_id: managerId },
      { new: true }
    ).populate('company_id').populate('team_leader_id').populate('member_ids');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: 'Manager added successfully', team });
  } catch (error) {
    console.error('Error adding manager to team:', error);
    res.status(500).json({ error: 'Failed to add manager to team' });
  }
});



/* Route to fetch courses according to filters 
app.get('/api/courses', async (req, res) => {
  const { filters, search } = req.body;
  const { include, type, format, duration, date } = filters || {};
});
*/

app.post('/api/courses', async (req, res) => {
  const { userId, filters, search } = req.body;
  const { status, type, format, duration, date, order } = filters;

  // Extract pagination parameters with secure minimum bounds and caps
  const page = Math.max(1, parseInt(req.body.page || req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.body.limit || req.query.limit) || 10));
  const skip = (page - 1) * limit;

  let user;
  try {
    user = await User.findOne({ firebase_uid: userId }).select('_id');
    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user for courses:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }

  try {
    let pipeline = [];
    let matchQuery = {};

    // Build the type query based on the provided type filters
    if (type) {
      const types = Object.keys(type).filter(key => type[key]);
      if (types.length > 0) {
        matchQuery.type = { $in: types };
      }
    }

    // Build the format query based on the provided format filter
    switch (format) {
      case 'online':
        matchQuery.format = 'online';
        break;
      case 'in_person':
        matchQuery.format = 'in_person';
        break;
      case 'hybrid':
        matchQuery.format = 'hybrid';
        break;
    }

    // Build the search query for title and description
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      matchQuery.$and = matchQuery.$and || [];
      matchQuery.$and.push({
        $or: [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } }
        ]
      });
    }

    if (duration && (duration.min || duration.max)) {
      const minHrs = duration.min ? Number(duration.min) : null;
      const maxHrs = duration.max ? Number(duration.max) : null;

      // Build the course-based filter
      let courseCriteria = {};
      if (minHrs) courseCriteria.$gte = minHrs;
      if (maxHrs) courseCriteria.$lte = maxHrs;

      matchQuery.$and = matchQuery.$and || [];
      matchQuery.$and.push({ "duration_hours": courseCriteria });
    }

    if (Object.keys(matchQuery).length > 0) {
      pipeline.push({ $match: matchQuery });
    }

    // Lookup enrollments for the current user to filter by status
    pipeline.push({
      $lookup: {
        from: 'enrollments',
        let: { currentCourseId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$course_id", "$$currentCourseId"] },
                  { $eq: ["$user_id", user._id] }
                ]
              }
            }
          }
        ],
        as: 'userEnrollment'
      }
    });

    // Handle Status Filtering Logic
    const statuses = status ? Object.keys(status).filter(key => status[key]) : [];

    if (statuses.length > 0) {
      pipeline.push({
        $match: {
          'userEnrollment.status': { $in: statuses }
        }
      });
    }

    pipeline.push({
      $lookup: {
        from: 'reviews',
        let: { currentCourseId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ["$course_id", "$$currentCourseId"] } } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
              reviewCount: { $sum: 1 }
            }
          }
        ],
        as: 'reviewStats'
      }
    });

    pipeline.push({
      $lookup: {
        from: 'sessions',
        let: { currentCourseId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ["$course_id", "$$currentCourseId"] } } },
          { $sort: { date: 1 } },
          { $limit: 1 }
        ],
        as: 'earliestSession'
      }
    });

    pipeline.push({
      $addFields: {
        rating: { 
          $round: [
            { $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0] }, 
            1
          ]
        },
        reviews: { 
          $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0] 
        },
        start_date: { 
          $ifNull: [{ $arrayElemAt: ["$earliestSession.date", 0] }, null] 
        }
      }
    });

    // Clean up temporary aggregation fields from the final response pipeline
    pipeline.push({
      $project: { reviewStats: 0, earliestSession: 0 }
    });

    if (date && (date.from || date.to)) {
      let dateQuery = {};
      if (date.from) dateQuery.$gte = new Date(date.from);
      if (date.to) dateQuery.$lte = new Date(date.to);

      pipeline.push({
        $match: {
          start_date: dateQuery
        }
      });
    }

    // Handle Sorting Logic
    if (order && Object.keys(order).length > 0) {
      pipeline.push({ $sort: order });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } }); // Fallback sort
    }

    // ── PAGINATION USING FACETS ──
    // Facets execute multiple pipelines in parallel over the filtered query stream.
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    });

    const aggregationResult = await Course.aggregate(pipeline);

    // Unpack structural facet metrics cleanly
    const totalCourses = aggregationResult[0]?.metadata[0]?.total || 0;
    const courses = aggregationResult[0]?.data || [];

    res.json({
      courses,
      currentPage: page,
      totalPages: Math.ceil(totalCourses / limit),
      totalCourses,
      limit
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// ── DASHBOARD ROUTES - Real MongoDB Data ──────────────────────────────────────

// ── GET /api/dashboard/team-stats ──────────────────────────────────────
app.get('/api/dashboard/team-stats', async (req, res) => {
  try {
    const { teamId, managerId } = req.query;

    if (!teamId || !managerId) {
      return res.status(400).json({ error: 'teamId and managerId are required' });
    }

    // Find the team and populate members
    const team = await Team.findById(teamId).populate('member_ids');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify the manager is the team leader
    if (team.team_leader_id.toString() !== managerId) {
      return res.status(403).json({ error: 'Unauthorized: You are not the team leader' });
    }

    // Get all enrollments for team members
    const enrollments = await Enrollment.find({
      user_id: { $in: team.member_ids.map(m => m._id) }
    }).populate('course_id');

    // Calculate stats from REAL data
    let totalHoursDone = 0;
    let totalHoursAssigned = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;
    const missedTrainings = [];

    for (const enrollment of enrollments) {
      const course = await Course.find({ _id: enrollment.course_id });
      if (!course) return;

      // Calculate satisfaction from attendance rate (0-5 scale)
      if (enrollment.session_attendance && enrollment.session_attendance.length > 0) {
        const attended = enrollment.session_attendance.filter(s => s.attended).length;
        const attendanceRate = (attended / enrollment.session_attendance.length) * 5;
        totalSatisfaction += attendanceRate;
        satisfactionCount++;

        const sessionIds = enrollment.session_attendance.map(s => s.session_id);
        const sessions = await Session.find({
          _id: { $in: sessionIds },
          course_id: enrollment.course_id,
        });

        const hoursProgress = sessions.reduce((sum, session) => {
          const attendance = enrollment.session_attendance.find(s => s.session_id.toString() == session._id.toString());
          return sum + (attendance ? attendance.duration : 0);
        }, 0) / 60;

        totalHoursDone += hoursProgress;
      }

      totalHoursAssigned += course.duration_hours || 0;

      // Check for missed trainings (0% progress and status is registered or not_started)
      if (enrollment.status === 'registered' || enrollment.status === 'not_started') {
        const member = team.member_ids.find(m => m._id.toString() === enrollment.user_id.toString());
        if (member && course) {
          missedTrainings.push({
            course: course.title,
            userId: enrollment.user_id,
            status: 'not_started'
          });
        }
      }
    };

    const avgSatisfaction = satisfactionCount > 0 ? (totalSatisfaction / satisfactionCount).toFixed(1) : 3.5;
    const completionRate = totalHoursAssigned > 0 ? Math.round((totalHoursDone / totalHoursAssigned) * 100) : 0;

    res.json({
      totalHoursDone: Math.round(totalHoursDone * 10) / 10,
      totalHoursAssigned: Math.round(totalHoursAssigned),
      avgSatisfaction: parseFloat(avgSatisfaction),
      missedCount: missedTrainings.length,
      completionRate,
      teamSize: team.member_ids.length,
      missedTrainings
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ error: 'Failed to fetch team stats' });
  }
});

// ── GET /api/dashboard/team-members ───────────────────────────────────
app.get('/api/dashboard/team-members', async (req, res) => {
  try {
    const { teamId, managerId } = req.query;

    if (!teamId || !managerId) {
      return res.status(400).json({ error: 'teamId and managerId are required' });
    }

    // Find the team and populate members
    const team = await Team.findById(teamId).populate('member_ids');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify the manager is the team leader
    if (team.team_leader_id.toString() !== managerId) {
      return res.status(403).json({ error: 'Unauthorized: You are not the team leader' });
    }

    // Get enrollments for all members
    const enrollments = await Enrollment.find({
      user_id: { $in: team.member_ids.map(m => m._id) }
    }).populate('course_id');

    // Build member data from REAL enrollments
    const memberData = team.member_ids.map(member => async () => {
      const memberEnrollments = enrollments.filter(
        e => e.user_id.toString() === member._id.toString()
      );

      let totalHoursDone = 0;
      let totalHoursAssigned = 0;
      let totalSatisfaction = 0;
      let satisfactionCount = 0;
      let completedCourses = 0;

      for (const enrollment of memberEnrollments) {
        const course = enrollment.course_id;
        if (!course) return;

        totalHoursAssigned += course.duration_hours || 0;
        let hoursProgress = 0;
        // Satisfaction based on attendance rate
        if (enrollment.session_attendance && enrollment.session_attendance.length > 0) {
          const attended = enrollment.session_attendance.filter(s => s.attended).length;
          const attendanceRate = (attended / enrollment.session_attendance.length) * 5;
          totalSatisfaction += attendanceRate;
          satisfactionCount++;

          const sessionIds = enrollment.session_attendance.map(s => s.session_id);
          const sessions = await Session.find({
              _id: { $in: sessionIds },
              course_id: enrollment.course_id._id,
          });

          hoursProgress = sessions.reduce((sum, session) => {
            const attendance = enrollment.session_attendance.find(s => s.session_id.toString() == session._id.toString());
            return sum + (attendance ? attendance.duration : 0);
          }, 0) / 60;

          totalHoursDone += hoursProgress;
        }

        if (hoursProgress === course.duration_hours) {
          completedCourses++;
        }
      };

      const progress = totalHoursAssigned > 0 
        ? Math.round((totalHoursDone / totalHoursAssigned) * 100)
        : 0;

      const satisfaction = satisfactionCount > 0
        ? (totalSatisfaction / satisfactionCount).toFixed(1)
        : 3.0;

      return {
        id: member._id,
        name: member.name,
        email: member.email,
        hoursDone: Math.round(totalHoursDone * 10) / 10,
        hoursAssigned: Math.round(totalHoursAssigned),
        progress,
        satisfaction: parseFloat(satisfaction) || 3.0,
        completedCourses,
        totalEnrollments: memberEnrollments.length
      };
    });

    res.json(memberData);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// ── GET /api/dashboard/team-metrics ───────────────────────────────────
app.get('/api/dashboard/team-metrics', async (req, res) => {
  try {
    const { teamId, managerId, months = 12 } = req.query;

    if (!teamId || !managerId) {
      return res.status(400).json({ error: 'teamId and managerId are required' });
    }

    // Find the team and populate members
    const team = await Team.findById(teamId).populate('member_ids');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify the manager is the team leader
    if (team.team_leader_id.toString() !== managerId) {
      return res.status(403).json({ error: 'Unauthorized: You are not the team leader' });
    }

    // Get enrollments for team members
    const enrollments = await Enrollment.find({
      user_id: { $in: team.member_ids.map(m => m._id) }
    }).populate('course_id');

    // Generate monthly data
    const monthlyData = [];
    const numMonths = parseInt(months) || 12;

    for (let i = numMonths - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      let hoursDone = 0;
      let hoursAssigned = 0;
      let totalSatisfaction = 0;
      let satisfactionCount = 0;

      for (const enrollment of enrollments) {
        const course = enrollment.course_id;
        if (!course) return;

        // Only count enrollments that were active/completed by this month
        if (new Date(enrollment.enrolled_at) <= date) {
          hoursAssigned += course.duration_hours || 0;

          if (enrollment.session_attendance && enrollment.session_attendance.length > 0) {
            const attended = enrollment.session_attendance.filter(s => s.attended).length;
            const attendanceRate = (attended / enrollment.session_attendance.length) * 5;
            totalSatisfaction += attendanceRate;
            satisfactionCount++;

            const sessionIds = enrollment.session_attendance.map(s => s.session_id);
            const sessions = await Session.find({
              _id: { $in: sessionIds },
              course_id: enrollment.course_id._id,
            });

            const hoursProgress = sessions.reduce((sum, session) => {
            const attendance = enrollment.session_attendance.find(s => s.session_id.toString() == session._id.toString());
              return sum + (attendance ? attendance.duration : 0);
            }, 0) / 60;

            hoursDone += hoursProgress;
          }
        }
      };

      const satisfaction = satisfactionCount > 0 ? (totalSatisfaction / satisfactionCount).toFixed(1) : 3.5;

      monthlyData.push({
        month: date.toLocaleString('en-US', { month: 'short' }),
        hoursDone: Math.round(hoursDone * 10) / 10,
        hoursAssigned: Math.round(hoursAssigned),
        satisfaction: parseFloat(satisfaction) || 3.5
      });
    }

    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching team metrics:', error);
    res.status(500).json({ error: 'Failed to fetch team metrics' });
  }
});

// ── GET /api/dashboard/team-deadlines ─────────────────────────────────
app.get('/api/dashboard/team-deadlines', async (req, res) => {
  try {
    const { teamId, managerId } = req.query;

    if (!teamId || !managerId) {
      return res.status(400).json({ error: 'teamId and managerId are required' });
    }

    // Find the team and populate members
    const team = await Team.findById(teamId).populate('member_ids');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify the manager is the team leader
    if (team.team_leader_id.toString() !== managerId) {
      return res.status(403).json({ error: 'Unauthorized: You are not the team leader' });
    }

    // Get enrollments that are not completed
    const enrollments = await Enrollment.find({
      user_id: { $in: team.member_ids.map(m => m._id) },
      status: { $ne: 'completed' }
    })
      .populate('course_id')
      .populate('user_id', 'name email');

    // Group by course
    const deadlineMap = {};

    enrollments.forEach(enrollment => {
      if (enrollment.course_id && enrollment.status !== 'completed') {
        const courseId = enrollment.course_id._id.toString();
        
        if (!deadlineMap[courseId]) {
          // Calculate due date: 30 days from 
          const dueDate = new Date(enrollment.enrolled_at);
          dueDate.setDate(dueDate.getDate() + 30);

          deadlineMap[courseId] = {
            course: enrollment.course_id.title,
            courseId: courseId,
            teamMembers: [],
            dueDate
          };
        }
        
        deadlineMap[courseId].teamMembers.push({
          name: enrollment.user_id.name,
          email: enrollment.user_id.email,
        });
      }
    });

    const deadlines = Object.values(deadlineMap)
      .map(deadline => {
        const daysLeft = Math.ceil(
          (deadline.dueDate - new Date()) / (1000 * 60 * 60 * 24)
        );
        return {
          ...deadline,
          daysLeft,
          urgent: daysLeft < 14
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    res.json(deadlines);
  } catch (error) {
    console.error('Error fetching team deadlines:', error);
    res.status(500).json({ error: 'Failed to fetch team deadlines' });
  }
});

// Enhanced endpoint with pagination and search for basic course listing
app.get('/api/courses', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10)); // Cap at 100 max
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build standard search query
    let searchQuery = {};
    if (search && search.trim()) {
      searchQuery = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Run parallel count and query executions
    const [total, courses] = await Promise.all([
      Course.countDocuments(searchQuery),
      Course.find(searchQuery)
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);
    
    res.json({
      courses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCourses: total,
      limit
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});

app.post("/upload", upload.single("image"), (req, res) => {
    console.log("Upload route hit");

  console.log("Bucket at request time:", req.app.get("imageBucket"));

    if (!req.file) {
        console.log("No file received");
        return res.status(400).send("No file uploaded.");
    }

    const bucket = req.app.get("imageBucket");

    if (!bucket) {
        console.log("Bucket not initialized");
        return res.status(500).send("Storage not ready");
    }

    try {
      const safeOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueName = `${Date.now()}-${safeOriginalName}`;

      const uploadStream = bucket.openUploadStream(uniqueName, {
        contentType: req.file.mimetype,
      });

        uploadStream.on("finish", () => {
            console.log("Upload finished");
            res.json({
              message: "Image uploaded successfully",
              filename: uniqueName
            });
        });

        uploadStream.on("error", (err) => {
            console.error("Stream error:", err);
            if (!res.headersSent) {
                res.status(500).send(err.message);
            }
        });

        uploadStream.end(req.file.buffer);

    } catch (error) {
        console.error("Catch error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/image/:filename", async (req, res) => {
  const bucket = req.app.get("imageBucket");

  const files = await bucket.find({ filename: req.params.filename })
    .sort({ uploadDate: -1 })
    .limit(1)
    .toArray();

  if (!files.length) {
    return res.status(404).send("No file found");
  }

  res.set("Content-Type", files[0].contentType);

  const downloadStream = bucket.openDownloadStreamByName(req.params.filename, { revision: -1 });
  downloadStream.pipe(res);
});

// GET /api/managers - Fetch all managers (users with role 'admin' or 'manager')
app.get('/api/managers', async (req, res) => {
  try {
    const managers = await User.find({ 
      role: { $in: ['admin', 'manager'] } 
    })
    .populate('company_id')
    .select('-__v') // Exclude version field
    .lean();
    
    // Fetch teams for each manager to show their managed teams
    const managersWithTeams = await Promise.all(
      managers.map(async (manager) => {
        const teamsManaged = await Team.find({ 
          team_leader_id: manager._id 
        })
        .select('name _id')
        .lean();
        
        return {
          ...manager,
          teams_managed: teamsManaged
        };
      })
    );
    
    res.json(managersWithTeams);
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ error: 'Failed to fetch managers' });
  }
});

app.get('/api/managersP', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const companyId = req.query.companyId || '';
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {
      role: { $in: ['manager', 'admin'] }
    };
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (companyId) {
      searchQuery.company_id = companyId;
    }

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);
    
    // Get paginated managers with populated references
    const managers = await User.find(searchQuery)
      .populate('teams_managed', 'name')
      .populate('company_id', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json({
      managers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalManagers: total,
      limit
    });
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ error: 'Failed to fetch data from the database' });
  }
});


// DELETE /api/managers/:userId - Delete a manager (admin only)
app.delete('/api/managers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }
    
    // Remove manager from any team leadership positions
    await Team.updateMany(
      { team_leader_id: userId },
      { $set: { team_leader_id: null } }
    );
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Manager deleted successfully' });
  } catch (error) {
    console.error('Error deleting manager:', error);
    res.status(500).json({ error: 'Failed to delete manager' });
  }
});

// PUT /api/managers/:userId - Update manager role
app.put('/api/managers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, name, email, company_id } = req.body;
    
    const updateData = {};
    if (role) updateData.role = role;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (company_id) updateData.company_id = company_id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('company_id');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating manager:', error);
    res.status(500).json({ error: 'Failed to update manager' });
  }
});

// POST /api/managers - Create a new manager
app.post('/api/managers', async (req, res) => {
  try {
    const { name, email, role, company_id, firebase_uid } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    const newUser = new User({
      name,
      email,
      role: role || 'manager',
      company_id: company_id || null,
      firebase_uid: firebase_uid || null
    });
    
    await newUser.save();
    
    const populatedUser = await User.findById(newUser._id).populate('company_id');
    
    res.status(201).json(populatedUser);
  } catch (error) {
    console.error('Error creating manager:', error);
    res.status(500).json({ error: 'Failed to create manager' });
  }
});

// Enhanced dashboard statistics with aggregation
app.get('/api/admin/stats', async (req, res) => {
  try {
    const companyId = req.query.companyId;
    
    // Build match conditions for company filtering
    let userMatch = {};
    let teamMatch = {};
    let courseMatch = {};
    
    if (companyId) {
      userMatch.company_id = new mongoose.Types.ObjectId(companyId);
      teamMatch.company_id = new mongoose.Types.ObjectId(companyId);
      courseMatch.company_id = new mongoose.Types.ObjectId(companyId);
    }

    // Get all counts in parallel for better performance
    const [
      totalUsers,
      totalManagers,
      totalTeams,
      totalCourses,
      completionStats
    ] = await Promise.all([
      // Total employees
      User.countDocuments({ ...userMatch, role: 'employee' }),
      
      // Total managers
      User.countDocuments({ ...userMatch, role: 'manager' }),
      
      // Total teams
      Team.countDocuments(teamMatch),
      
      // Total courses
      Course.countDocuments(courseMatch),
      
      // Completion rate aggregation
      Enrollment.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: companyId ? { 'user.company_id': new mongoose.Types.ObjectId(companyId) } : {}
        },
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
            completedEnrollments: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
          }
        }
      ])
    ]);

    const totalEnrollments = completionStats[0]?.totalEnrollments || 0;
    const completedEnrollments = completionStats[0]?.completedEnrollments || 0;
    
    const completionRate = totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100) 
      : 0;

    // Calculate active users (users with at least one enrollment)
    const activeUsersAgg = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: companyId ? { 'user.company_id': new mongoose.Types.ObjectId(companyId) } : {}
      },
      {
        $group: {
          _id: '$user_id'
        }
      },
      {
        $count: 'activeUsers'
      }
    ]);
    
    const activeUsers = activeUsersAgg[0]?.activeUsers || 0;

    // Pending requests (if you have a requests collection)
    let pendingRequests = 0;
    if (mongoose.models.Request) {
      const Request = mongoose.model('Request');
      const requestQuery = companyId ? { company_id: companyId } : {};
      pendingRequests = await Request.countDocuments({ ...requestQuery, status: 'pending' });
    }

    res.json({
      totalUsers,
      totalManagers,
      totalTeams,
      totalCourses,
      completionRate,
      pendingRequests,
      activeUsers,
      totalEnrollments,
      completedEnrollments
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get inactive users (users with low or no training completion)
app.get('/api/admin/inactive-users', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const companyId = req.query.companyId;
    
    // Build query for users
    let userQuery = { };
    if (companyId) {
      userQuery.company_id = new mongoose.Types.ObjectId(companyId);
    }
    
    // Get all employees in the company
    const users = await User.find(userQuery).select('_id name email department');
    
    // For each user, get their training completion stats for the year
    const inactiveUsersData = await Promise.all(users.map(async (user) => {
      // Get start and end dates for the year
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
      
      // Count completed trainings for this user in the specified year
      const trainingsCompleted = await Enrollment.countDocuments({
        user_id: user._id,
        status: 'completed',
        completed_at: {
          $gte: startOfYear,
          $lte: endOfYear
        }
      });
      
      // Get the last training completion date
      const lastTraining = await Enrollment.findOne({
        user_id: user._id,
        status: 'completed'
      })
      .sort({ completed_at: -1 })
      .select('completed_at');
      
      // Format last training date
      let lastTrainingDate = 'Never';
      if (lastTraining && lastTraining.completed_at) {
        const date = new Date(lastTraining.completed_at);
        lastTrainingDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      // Get user's department (if not in user schema, derive from team or return default)
      let department = user.department || 'Not Assigned';
      
      // If department doesn't exist on user, try to get from their team
      if (!user.department) {
        const userTeam = await Team.findOne({
          $or: [
            { team_leader_id: user._id },
            { member_ids: user._id }
          ]
        }).select('name');
        
        if (userTeam) {
          department = userTeam.name;
        }
      }
      
      return {
        id: user._id,
        name: user.name || 'Unnamed User',
        email: user.email || 'No Email',
        department: department,
        lastTraining: lastTrainingDate,
        trainingsCompleted: trainingsCompleted
      };
    }));
    
    // Filter users who have completed less than 3 trainings in the year (adjust threshold as needed)
    const threshold = 2; // Users with 2 or fewer trainings are considered inactive
    const inactiveUsers = inactiveUsersData.filter(user => user.trainingsCompleted <= threshold);
    
    // Sort by trainings completed (lowest first)
    inactiveUsers.sort((a, b) => a.trainingsCompleted - b.trainingsCompleted);
    
    res.json(inactiveUsers);
  } catch (error) {
    console.error('Error fetching inactive users:', error);
    res.status(500).json({ error: 'Failed to fetch inactive users' });
  }
});
// Add to your server.js

// GET /api/users/:userId/enrollments - Get user's enrollments
app.get('/api/users/:userId/enrollments', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const enrollments = await Enrollment.find({ user_id: userId })
      .populate('course_id')
      .populate('session_attendance.session_id')
      .sort({ enrolled_at: -1 });
    
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

/*
// GET /api/courses/:courseId - Get single course
app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .populate('created_by');
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});
*/


//given an userreturns courses he is enroled in
app.get('/api/enrollments/user/:userId/courses', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim();
    const skip = (page - 1) * limit;

    const searchQuery = { user_id: userObjectId, ...(status ? { status } : {}) };

    const courseFilter = search
      ? { title: { $regex: search, $options: 'i' } }
      : {};

    const enrollments = await Enrollment.find(searchQuery)
      .populate({
        path: 'course_id',
        match: courseFilter,
        select: 'title description duration_hours type format'
      })
      .populate('user_id', 'name email')
      .populate('session_attendance.session_id', 'title date')
      .skip(skip)
      .limit(limit)
      .sort({ enrolled_at: -1 });

    const filteredEnrollments = enrollments.filter(e => e.course_id !== null);
    for (const enrollment of filteredEnrollments) {
      // Calculate progress from session_attendance array
      if (enrollment.session_attendance && enrollment.session_attendance.length > 0) {
        const attendedSessions = enrollment.session_attendance.filter(s => s.attended).length;
        enrollment.progress = Math.round((attendedSessions / enrollment.session_attendance.length) * 100);
      } else {
        enrollment.progress = 0;
      }
    }

    const total = await Enrollment.countDocuments(searchQuery);

    res.json({
      enrollments: filteredEnrollments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEnrollments: total,
      limit
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ error: 'Failed to fetch enrolled courses from the database' });
  }
});
app.get('/api/teams/:teamId/with-missed-sessions', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Get team with populated members
    const team = await Team.findById(teamId)
      .populate('team_leader_id')
      .populate('member_ids')
      .lean();
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const memberIds = team.member_ids.map(member => member._id);
    
    // Get all enrollments for team members
    const enrollments = await Enrollment.find({ 
      user_id: { $in: memberIds } 
    })
    .populate('course_id')
    .populate({
      path: 'session_attendance.session_id',
      model: 'Session'
    })
    .lean();
    
    // Process missed sessions and recent completions
    const missedSessions = [];
    const recentCompletions = [];
    const memberStats = {};
    
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (const enrollment of enrollments) {
      const userId = enrollment.user_id.toString();
      
      // Initialize member stats
      if (!memberStats[userId]) {
        const member = team.member_ids.find(m => m._id.toString() === userId);
        memberStats[userId] = {
          memberId: userId,
          memberName: member?.name || 'Unknown',
          memberEmail: member?.email || '',
          memberRole: member?.role || 'employee',
          memberImage: member?.image_url || null,
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          notStartedCourses: 0,
          totalHoursCompleted: 0,
          averageProgress: 0,
          recentCompletions: [],
          missedSessions: []
        };
      }
      
      memberStats[userId].totalCourses++;
      
      // Determine course status
      const isCompleted = enrollment.status === 'completed' || enrollment.progress === 100;
      const isInProgress = enrollment.status === 'ongoing' || (enrollment.status === 'registered' && enrollment.progress > 0 && enrollment.progress < 100);
      const isNotStarted = enrollment.status === 'registered' && enrollment.progress === 0;
      
      // Calculate hours based on attended sessions
      let earnedHours = 0;
      let totalSessionMinutes = 0;
      let attendedMinutes = 0;
      
      if (enrollment.session_attendance && enrollment.session_attendance.length > 0) {
        for (const sessionAttendance of enrollment.session_attendance) {
          const session = sessionAttendance.session_id;
          if (session && session.duration_minutes) {
            totalSessionMinutes += session.duration_minutes;
            if (sessionAttendance.attended) {
              attendedMinutes += session.duration_minutes;
            }
          }
        }
        
        // Calculate earned hours based on attended session proportion
        if (totalSessionMinutes > 0) {
          const courseHours = enrollment.course_id?.duration_hours || 0;
          earnedHours = (attendedMinutes / totalSessionMinutes) * courseHours;
        }
      }
      
      if (isCompleted) {
        memberStats[userId].completedCourses++;
        
        // Check if completed within last 30 days
        const completedAt = enrollment.completed_at || enrollment.updated_at;
        if (completedAt && new Date(completedAt) > thirtyDaysAgo) {
          const completion = {
            courseTitle: enrollment.course_id?.title || 'Unknown Course',
            courseHours: enrollment.course_id?.duration_hours || 0,
            completedAt: completedAt,
            completedDateFormatted: new Date(completedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            memberId: userId,
            memberName: memberStats[userId].memberName,
            memberEmail: memberStats[userId].memberEmail
          };
          
          memberStats[userId].recentCompletions.push(completion);
          recentCompletions.push(completion);
        }
      } else if (isInProgress) {
        memberStats[userId].inProgressCourses++;
      } else if (isNotStarted) {
        memberStats[userId].notStartedCourses++;
      }
      
      memberStats[userId].totalHoursCompleted += earnedHours;
      
      // Store progress sum for average calculation
      if (!memberStats[userId].progressSum) {
        memberStats[userId].progressSum = 0;
      }
      memberStats[userId].progressSum += enrollment.progress || 0;
      
      // Check for missed sessions
      if (enrollment.session_attendance) {
        for (const sessionAttendance of enrollment.session_attendance) {
          if (!sessionAttendance.attended && sessionAttendance.session_id) {
            const session = sessionAttendance.session_id;
            const missedSession = {
              memberId: userId,
              memberName: memberStats[userId].memberName,
              memberEmail: memberStats[userId].memberEmail,
              courseTitle: enrollment.course_id?.title || 'Unknown Course',
              sessionDate: session.date,
              sessionDateFormatted: session.date 
                ? new Date(session.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Date not available'
            };
            
            missedSessions.push(missedSession);
            memberStats[userId].missedSessions.push(missedSession);
          }
        }
      }
    }
    
    // Calculate average progress for each member
    for (const userId in memberStats) {
      if (memberStats[userId].totalCourses > 0) {
        memberStats[userId].averageProgress = Math.round(memberStats[userId].progressSum / memberStats[userId].totalCourses);
      }
      // Round hours to 1 decimal place for display
      memberStats[userId].totalHoursCompleted = Math.round(memberStats[userId].totalHoursCompleted * 10) / 10;
      // Clean up temporary property
      delete memberStats[userId].progressSum;
    }
    
    // Sort missed sessions by date (most recent first)
    missedSessions.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));
    
    // Sort recent completions by date (most recent first)
    recentCompletions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    res.json({
      team,
      members: Object.values(memberStats),
      missedSessions,
      recentCompletions: recentCompletions.slice(0, 10),
      totalMissedSessions: missedSessions.length
    });
    
  } catch (error) {
    console.error('Error fetching team with missed sessions:', error);
    res.status(500).json({ error: 'Failed to fetch team data' });
  }
});

app.post('/api/ai/suggestions/:memberId', async (req, res) => {
  try {
    const member = await User.findById(req.params.memberId);
    const enrollments = await Enrollment.find({ user_id: member._id }).populate('course_id');
    const allCourses = await Course.find({});

    const completedCourses = enrollments.map(e => e.course_id?.title).filter(Boolean);
    const availableCourses = allCourses.map(c => `${c.title} (${c.type}, ${c.duration_hours}h)`).join('\n');
    let linkedInAnalysis = '';

    if (member.linkedIn_url) {
      if (member.email === 'ana.silva@trainuplus.com') {
        linkedInAnalysis = 'Senior engineering leader with a strong cloud architecture background, hands-on AI experimentation, and a clear focus on scalable software delivery.';
      } else if (member.email === 'duarte.costa@trainuplus.com') {
        linkedInAnalysis = 'Security-focused profile with strong compliance instincts, threat monitoring habits, and a bias toward defensive engineering and governance.';
      } else if (member.email === 'marta.gomes@trainuplus.com') {
        linkedInAnalysis = 'Product manager profile centered on agile planning, cross-functional coordination, and using AI to improve team workflows and prioritization.';
      } else if (member.email === 'sergio.nunes@trainuplus.com') {
        linkedInAnalysis = 'DevOps-oriented leader who works comfortably across cloud infrastructure, release automation, containers, and reliability engineering.';
      } else if (member.email === 'ines.afonso@trainuplus.com') {
        linkedInAnalysis = 'Strategy-heavy product leader with change management experience, good stakeholder alignment, and interest in scalable team execution.';
      } else if (member.email === 'paulo.neves@trainuplus.com') {
        linkedInAnalysis = 'Technical manager profile combining engineering depth with people management, communication, and conflict resolution strengths.';
      } else if (member.email === 'mario.vidal@partnercolabs.com') {
        linkedInAnalysis = 'Technical manager profile with strong engineering fundamentals and a collaborative leadership style suited for cross-team delivery.';
      } else if (member.email === 'joao.almeida@trainuplus.com') {
        linkedInAnalysis = 'Senior software engineer profile with a strong frontend and API focus, showing interest in modern React patterns and GraphQL design.';
      } else if (member.email === 'rita.ribeiro@trainuplus.com') {
        linkedInAnalysis = 'QA automation profile that blends testing discipline with process awareness, making her a good fit for agile and security-adjacent training.';
      } else if (member.email === 'luis.matos@trainuplus.com') {
        linkedInAnalysis = 'Systems-minded engineer with a backend and infrastructure bias, suited to low-level programming, services, and platform scalability topics.';
      } else if (member.email === 'sofia.pires@trainuplus.com') {
        linkedInAnalysis = 'Data analyst profile with strong analytics habits, comfortable with SQL and Python, and likely to benefit from deeper experimentation and reporting workflows.';
      }
    }
    
    const prompt = `
      Employee: ${member.name}
      Role: ${member.role}
      Job description: ${member.jobDescription || 'N/A'}
      LinkedIn analysis: ${linkedInAnalysis || 'N/A'}
      Completed courses: ${completedCourses.join(', ') || 'None'}
      
      Available courses:
      ${availableCourses}
      
      Suggest 3 courses from the list above that best fit this employee. Reply with only the course titles, one per line.
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    });

    const text = completion.choices[0].message.content;

    const suggestedTitles = text.split('\n').map(t => t.trim()).filter(Boolean);
    const suggested = allCourses.filter(c => suggestedTitles.some(t => t.includes(c.title)));

    res.json({ suggestions: suggested });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.delete('/api/admin/delete-user/:uid', verifyToken, checkAdmin, async (req, res) => {
    const { uid } = req.params;

    try {
        // 1. Delete from Firebase Authentication
        await admin.auth().deleteUser(uid);

        // 2. Delete from MongoDB
        const deletedUser = await User.findOneAndDelete({ firebaseUid: uid });

        if (!deletedUser) {
            return res.status(404).json({ error: "User found in Firebase but not in MongoDB." });
        }

        res.status(200).json({ message: "User deleted successfully from both systems." });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Profile endpoint: returns user (including interested courses), teams, and career path
app.get('/api/users/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('interested_courses job_id');
    
    // Find teams where this user is in the member_ids array
    const teams = await Team.find({ member_ids: req.params.id });

    res.json({ user, teams});
  } catch (error) {
    console.log("Failed to fetch: ", error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/addAttendance', async (req, res) => {
  try {
    console.log("Request body: ", req.body);
    const { userId, sessionId, attended } = req.body;
    if (!userId || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const session = await Session.findById(sessionId);
    console.log('Session fields:', session);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const enrollment = await Enrollment.findOne({ user_id: userId, 'course_id': session.course_id });
    if (!enrollment) {
      console.log('Enrollment not found for user:', userId, 'and session:', session.course_id);

      return res.status(404).json({ error: 'Enrollment not found for this session' });
    }
    const attendanceIndex = enrollment.session_attendance.findIndex(s => s.session_id.toString() === sessionId);
    if (attendanceIndex === -1) {
      enrollment.session_attendance.push({ session_id: sessionId, attended });
    } else {
      enrollment.session_attendance[attendanceIndex].attended = attended;
    }
    await enrollment.save();
    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

app.post('/api/courses/:courseId/complete', async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.headers['userid']; 

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const enrollment = await Enrollment.findOne({ 
      user_id: userId, 
      course_id: courseId 
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment record not found' });
    }

    enrollment.status = 'completed';
    enrollment.completed_at = new Date();

    await enrollment.save();
    // trigger notification to manager about course completion
    const employee = await User.findById(userId);
    const course = await Course.findById(courseId);
    await notifyCourseCompleted({ user: employee, courseTitle: course.title });

    res.json({ 
      message: 'Course marked as completed', 
      enrollment 
    });

  } catch (error) {
    console.error('Error completing course:', error);
    res.status(500).json({ error: 'Failed to finalize completion' });
  }
});

app.post('/api/enrollments/bulk', async (req, res) => {
  try {
    const { managerId, teamId, enrollments } = req.body;

    if (!managerId || !enrollments || !Array.isArray(enrollments)) {
      return res.status(400).json({ error: 'Missing required enrollment data.' });
    }

    const enrollmentPromises = [];

    enrollments.forEach(({ memberId, courses }) => {
      if (!courses || !Array.isArray(courses)) return;

      courses.forEach(courseId => {
        const op = Enrollment.findOneAndUpdate(
          { 
            user_id: memberId, 
            course_id: courseId 
          },
          { 
            $setOnInsert: { 
              user_id: memberId,
              course_id: courseId,
              status: 'registered',
              enrolled_at: new Date(),
              session_attendance: []
            } 
          },
          { upsert: true, new: true }
        );
        enrollmentPromises.push(op);
      });
    });

    await Promise.all(enrollmentPromises);

    res.status(201).json({ 
      message: 'Bulk enrollment successful', 
      count: enrollmentPromises.length 
    });
  } catch (error) {
    console.error('Error in bulk enrollment:', error);
    res.status(500).json({ error: 'Internal server error during bulk enrollment' });
  }
});


// GET: Fetch all career paths
app.get('/api/career-paths', async (req, res) => {
  try {
    const paths = await CareerPath.find();
    res.json(paths);
  } catch (error) {
    console.error('Error fetching career paths:', error);
    res.status(500).json({ error: 'Failed to fetch career paths' });
  }
});

//Create a new career path
app.post('/api/career-paths', async (req, res) => {
  try {
    const { title, description} = req.body;

    // Basic validation
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const newPath = new CareerPath({
      title,
      description,
    });

    await newPath.save();
    res.status(201).json(newPath);
  } catch (error) {
    console.error('Error creating career path:', error);
    res.status(500).json({ error: 'Failed to create career path' });
  }
});

app.put('/api/career-paths/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedPath = await CareerPath.findByIdAndUpdate(
      id,
      { title, description },
      { new: true, runValidators: true }
    );
    if (!updatedPath) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(updatedPath);
  } catch (error) {
    console.error('Error updating Job Description:', error);
    res.status(500).json({ error: 'Failed to update Job Description' });
  }
});

// DELETE: Remove a career path
app.delete('/api/career-paths/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Unset the career path for any users currently assigned to it
    // await User.updateMany({ career_path_id: id }, { $set: { career_path_id: null } });
    await CareerPath.findByIdAndDelete(id);
    res.json({ message: 'Career path deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

app.get('/api/job-descriptions', async (req, res) => {
  try {
    const descriptions = await CareerPath.find();
    res.json(descriptions);
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    res.status(500).json({ error: 'Failed to fetch job descriptions' });
  }
});

// GET /api/teams/edit/:teamId - Fetch a single team's details for editing
app.get('/api/teams/edit/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId)
      .populate('team_leader_id', 'name email role')
      .populate('member_ids', 'name email role');
      
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team for edit:', error);
    res.status(500).json({ error: 'Failed to fetch team details' });
  }
});

// PUT /api/teams/:teamId - Update a team
app.put('/api/teams/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, team_leader_id, member_ids } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if the new name is already taken by another team
    const existingTeam = await Team.findOne({ name: name.trim(), _id: { $ne: teamId } });
    if (existingTeam) {
      return res.status(400).json({ error: 'Another team with this name already exists' });
    }

    // Update the team details
    team.name = name.trim();
    team.team_leader_id = team_leader_id || null;
    team.member_ids = member_ids || [];

    await team.save();

    res.json({ message: 'Team updated successfully', team });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

app.put('/api/teams/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, team_leader_id, member_ids } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const existingTeam = await Team.findOne({ name: name.trim(), _id: { $ne: teamId } });
    if (existingTeam) {
      return res.status(400).json({ error: 'Another team with this name already exists' });
    }

    if (team_leader_id && member_ids && member_ids.length > 0) {
      const otherManagedTeams = await Team.find({
        _id: { $ne: teamId },
        team_leader_id: { $exists: true, $ne: null }
      }).populate('member_ids', 'name email');

      const targetMemberIds = member_ids.map(id => id.toString());

      for (const otherTeam of otherManagedTeams) {
        for (const member of otherTeam.member_ids) {
          const memberIdStr = member._id.toString();
          
          if (targetMemberIds.includes(memberIdStr)) {
            const userName = member.name || member.email;
            return res.status(400).json({
              error: `Validation Failed: ${userName} is already a member of team "${otherTeam.name}" which has a manager assigned. A user cannot end up with 2 managers.`
            });
          }
        }
      }
    }

    team.name = name.trim();
    team.team_leader_id = team_leader_id || null;
    team.member_ids = member_ids || [];

    await team.save();

    const updatedTeam = await Team.findById(teamId)
      .populate('team_leader_id', 'name email role')
      .populate('member_ids', 'name email role');

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team with manager validation:', error);
    res.status(500).json({ error: 'Failed to update team details due to a server error' });
  }
});

// 1. Fetch a specific course AND its sessions (For the Edit Form)
app.get('/api/admin/courses/:id/full', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    const sessions = await Session.find({ course_id: course._id }).sort({ date: 1 });
    res.json({ course, sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

app.get('/api/images/:filename', (req, res) => {
  try {
    const bucket = app.get("imageBucket");
    if (!bucket) return res.status(500).json({ error: "Image store not ready" });

    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);

    downloadStream.on('data', (chunk) => res.write(chunk));
    downloadStream.on('error', () => res.status(404).json({ error: "Image not found" }));
    downloadStream.on('end', () => res.end());
  } catch (err) {
    res.status(500).json({ error: "Error retrieving file from GridFS" });
  }
});

app.post('/api/admin/courses/create', upload.single('image'), async (req, res) => {
  try {
    const parsedCourse = JSON.parse(req.body.course);
    const parsedSessions = JSON.parse(req.body.sessions);

    let image_url = 'http://localhost:5000/static/course-images/default-course.png';

    if (req.file) {
      const bucket = app.get("imageBucket");
      const filename = `course-${Date.now()}-${req.file.originalname}`;
      
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
      });

      const readableStream = new Readable();
      readableStream.push(req.file.buffer);
      readableStream.push(null); // Signals end of stream

      await new Promise((resolve, reject) => {
        readableStream.pipe(uploadStream)
          .on('error', reject)
          .on('finish', resolve);
      });

      image_url = `http://localhost:5000/api/images/${filename}`;
    }

    const newCourse = new Course({
      ...parsedCourse,
      image_url,
      created_at: new Date(),
      updated_at: new Date()
    });
    await newCourse.save();

    const sessionPromises = parsedSessions.map(s => {
      return new Session({
        course_id: newCourse._id,
        date: new Date(s.date),
        duration_minutes: Number(s.duration_minutes),
        location: s.location || '',
        description: s.description || ''
      }).save();
    });

    await Promise.all(sessionPromises);
    res.status(201).json({ message: 'Course created and saved into database' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to construct new course entry' });
  }
});

app.put('/api/admin/courses/:id', upload.single('image'), async (req, res) => {
  try {
    const parsedCourse = JSON.parse(req.body.course);
    const parsedSessions = JSON.parse(req.body.sessions);

    const targetCourse = await Course.findById(req.params.id);
    if (!targetCourse) return res.status(404).json({ error: 'Course not found' });

    let updatedImageUrl = targetCourse.image_url;

    if (req.file) {
      const bucket = app.get("imageBucket");
      const filename = `course-${Date.now()}-${req.file.originalname}`;
      
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
      });

      const readableStream = new Readable();
      readableStream.push(req.file.buffer);
      readableStream.push(null);

      await new Promise((resolve, reject) => {
        readableStream.pipe(uploadStream)
          .on('error', reject)
          .on('finish', resolve);
      });

      updatedImageUrl = `http://localhost:5000/api/images/${filename}`;
    }

    await Course.findByIdAndUpdate(req.params.id, {
      ...parsedCourse,
      image_url: updatedImageUrl,
      updated_at: new Date()
    });

    const sessionPromises = parsedSessions.map(s => {
      return Session.findByIdAndUpdate(s._id, {
        date: new Date(s.date),
        duration_minutes: Number(s.duration_minutes),
        location: s.location || '',
        description: s.description || ''
      });
    });

    await Promise.all(sessionPromises);
    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error saving changes' });
  }
});

// 2. Create a new Course and its tied Sessions
app.post('/api/admin/courses/create', async (req, res) => {
  try {
    const { course, sessions } = req.body;
    
    // Create the Course
    const newCourse = new Course({
      ...course,
      created_at: new Date(),
      updated_at: new Date()
    });
    await newCourse.save();

    // Create the Sessions
    const sessionPromises = sessions.map(s => {
      const newSession = new Session({
        course_id: newCourse._id,
        date: new Date(s.date),
        duration_minutes: s.duration_minutes,
        location: s.location,
        description: s.description
      });
      return newSession.save();
    });
    
    await Promise.all(sessionPromises);
    res.status(201).json({ message: 'Course created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Add a course to interested_courses
app.post('/api/users/interested-courses/add', async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { interested_courses: courseId }
    });
    res.status(200).json({ message: 'Course added to interested list' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Remove a course from interested_courses
app.post('/api/users/interested-courses/remove', async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { interested_courses: courseId }
    });
    res.status(200).json({ message: 'Course removed from interested list' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// GET - fetch user notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const notifications = await Notification.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(50);

    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH - mark as read
app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    await Notification.updateMany({ user_id: userId, read: false }, { $set: { read: true } });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - HR notify endpoint
app.post('/api/notifications/hr-notify', async (req, res) => {
  try {
    const { targetUserId, managerId, notifyType, channel, message } = req.body;
    // notifyType: 'user' | 'manager' | 'both'
    // channel: 'in_app' | 'email' | 'both' 

    const targets = [];
    if (targetUserId && (notifyType === 'user' || notifyType === 'both')) {
      const u = await User.findById(targetUserId);
      if (u) targets.push(u);
    }
    if (managerId && (notifyType === 'manager' || notifyType === 'both')) {
      const m = await User.findById(managerId);
      if (m) targets.push(m);
    }

    for (const target of targets) {
      if (channel === 'in_app' || channel === 'both') {
        await createInAppNotification({
          userId: target._id,
          type: 'hr_alert',
          title: 'HR Alert',
          message
        });
      }
      if (channel === 'email' || channel === 'both') {
        await sendEmailNotification({
          userEmail: target.email,
          userName: target.name,
          type: 'hr_alert',
          message
        });
      }
    }

    res.json({ message: `Notified ${targets.length} recipient(s)` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete('/api/teams/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findByIdAndDelete(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});
