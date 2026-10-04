const admin = require('firebase-admin');
const { User, Team } = require('./items');

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('[Auth] verifyIdToken failed:', {
      code: error?.code,
      message: error?.message,
    });
    res.status(401).json({
      error: 'Invalid token',
      details: error?.message,
      code: error?.code,
    });
  }
};

// Check if user is admin
const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const checkManager = async (req,res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user || user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied. Manager role required.'});
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const checkManagerOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied. Manager or Admin role required.'});
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


/**
 * Checks if the user is authorized to manage the course.
 * @param {User} user - The user performing the action.
 * @param {User} employee - The employee being managed.
 * @returns {boolean}
 */
const can_manage_course = (user, employee) => {
    // Admin call always manage non admin employees
    if (user.role === 'admin' && employee.role !== 'admin' ){
        return true;
    }
    // If not an admin ot between admins only team managers may manage courses 
    const team = Team.findOne({ member_ids: employee._id });
    if (team.team_leader_id.equals(user._id)) {
        return true;
    }
    return false;
}

  module.exports.default = { verifyToken, checkAdmin, checkManager, checkManagerOrAdmin, can_manage_course };