const { Notification } = require('./items');
const { sendEmailEvent } = require('./kafka');

// Email templates
const emailTemplates = {
  course_assigned: (userName, courseTitle) => ({
    subject: `New course assigned: ${courseTitle}`,
    html: `
      <h2>Hi ${userName},</h2>
      <p>You have been assigned a new course: <strong>${courseTitle}</strong>.</p>
      <p>Log in to TrainU+ to get started.</p>
    `
  }),
  course_completed: (userName, courseTitle) => ({
    subject: `Congratulations on completing: ${courseTitle}`,
    html: `
      <h2>Well done, ${userName}!</h2>
      <p>You have successfully completed <strong>${courseTitle}</strong>.</p>
      <p>Keep up the great work on TrainU+.</p>
    `
  }),
  hr_alert: (userName, message) => ({
    subject: `TrainU+ notification`,
    html: `<h2>Hi ${userName},</h2><p>${message}</p>`
  })
};

// Creates in-app notification.
async function createInAppNotification({ userId, type, title, message }) {
  return Notification.create({ user_id: userId, type, title, message });
}

// Send email via Kafka
async function sendEmailNotification({ userEmail, userName, type, courseTitle, message }) {
  const template = courseTitle
    ? emailTemplates[type](userName, courseTitle)
    : emailTemplates.hr_alert(userName, message);

  await sendEmailEvent({ to: userEmail, ...template });
}

// Notifies when assigning course.
async function notifyCourseAssigned({ user, courseTitle }) {
  await createInAppNotification({
    userId: user._id,
    type: 'course_assigned',
    title: 'New course assigned',
    message: `You have been assigned: ${courseTitle}`
  });
  await sendEmailNotification({
    userEmail: user.email,
    userName: user.name,
    type: 'course_assigned',
    courseTitle
  });
}

// Notifies when completing course
async function notifyCourseCompleted({ user, courseTitle }) {
  await createInAppNotification({
    userId: user._id,
    type: 'course_completed',
    title: 'Course completed!',
    message: `You completed: ${courseTitle}`
  });
  await sendEmailNotification({
    userEmail: user.email,
    userName: user.name,
    type: 'course_completed',
    courseTitle
  });
}

module.exports = {
  createInAppNotification,
  sendEmailNotification,
  notifyCourseAssigned,
  notifyCourseCompleted
};