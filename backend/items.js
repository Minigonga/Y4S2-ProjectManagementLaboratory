const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  firebase_uid: { type: String, unique: true, sparse: true },
  image_url: { type: String, default: 'http://localhost:5000/static/user-images/default-avatar.svg' },
  email: { type: String, required: true, unique: true, trim: true },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  linkedIn_url: { type: String, default: '' },
  interested_courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null }],
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true},
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  team_leader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image_url: { type: String, default: 'http://localhost:5000/static/course-images/default-course.svg' },
  duration_hours: { type: Number, min: 0.5, max: 100, required: true },
  type: { type: String, enum: ["technical", "compliance", "soft_skill"] },
  format: { type: String, enum: ["online", "in_person", "hybrid"] },
  capacity: { type: Number, min: 1, max: 500 },
  skill_tags: [{ type: String }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: true });

const sessionSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  duration_minutes: { type: Number, min: 30, max: 180, required: true },
  location: { type: String },
  description: { type: String },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

const enrollmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ["registered", "ongoing", "completed", "cancelled"], default: "registered" },
  enrolled_at: { type: Date, default: Date.now },
  completed_at: { type: Date },
  session_attendance: [{
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    attended: { type: Boolean, default: false },
    attended_at: { type: Date }
  }]
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

const careerPathSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String }
});

const notificationSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['course_assigned', 'course_completed', 'hr_alert'], required: true },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  read:       { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});


const Company = mongoose.model('Company', companySchema);
const User = mongoose.model('User', userSchema);
const Team = mongoose.model('Team', teamSchema);
const Course = mongoose.model('Course', courseSchema);
const Session = mongoose.model('Session', sessionSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
const Job = mongoose.model('Job', jobSchema);
const Review = mongoose.model('Review', reviewSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const CareerPath = mongoose.model('Career_Path', careerPathSchema);

module.exports = { Company, User, Team, Course, Session, Enrollment, Job, Review, CareerPath, Notification };