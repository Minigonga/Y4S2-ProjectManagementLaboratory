# Architecture

This file briefly describes TrainU+ project state.

## Implemented work

The current work consist of the project MVP, it supports 3 types of users, regular employees, managers and admins (HR people)

Employees can:
- browse avaiable trainings
- complete assignments
- leave reviews
- Show interest in a course
- Check completed trainings

Managers can:
- Do anything employees can
- Assign (manually or through AI) trainings to theit team
- Track their team performance

Admins can:
- Do anything managers can
- Manage every team
- Track every team performance
- Alter team/accounnt information
- Create new courses
- Create new accounts/teams

## Backend

The backend is divided into 5 main files:

- "items" responsible for defining database objects structure
- "kafka" responsible for the email service
- "permissions" responsible for access control
- "server" responsible for the remaining functions

## Database

The database uses the following structure

### Users:
* **Name:** (user name)
* **Firabase ID:** (ID for Firebase auth)
* **email:** (user email)
* **job_id:** (Id for the user job)
* **linkedIn_url:** (URL to user LinkedIn)
* **interested_courses:** (corses the user shown interest in)
* **role:** (employee, manager or admin)

### Team
* **Name:** Unique name of the team.
* **Company ID:** Reference to the parent `Company`.
* **Team Leader ID:** Reference to the `User` designated as the leader.
* **Member IDs:** Array of references to `User` objects belonging to the team.

### Course
* **Title:** Name of the course.
* **Description:** Detailed information about the course content.
* **Image URL:** Path to the course cover image (defaults to a local placeholder).
* **Duration Hours:** Course length (constrained between 0.5 and 100 hours).
* **Type:** Categorized as `technical`, `compliance`, or `soft_skill`.
* **Format:** Delivery method: `online`, `in_person`, or `hybrid`.
* **Capacity:** Maximum number of participants (1 to 500).
* **Skill Tags:** Array of strings representing associated skills.
* **Created By:** Reference to the `User` who created the course.
* **Timestamps:** Tracks `created_at` and `updated_at`.

### Session
* **Course ID:** Reference to the parent `Course`.
* **Date:** Scheduled date/time of the session.
* **Duration Minutes:** Session length (30 to 180 minutes).
* **Location:** Physical or virtual meeting location.
* **Description:** Specific details for the session.

### Enrollment
* **User ID:** Reference to the enrolled `User`.
* **Course ID:** Reference to the `Course`.
* **Status:** Progress state (`registered`, `ongoing`, `completed`, `cancelled`).
* **Timestamps:** Tracks enrollment date and completion date.
* **Session Attendance:** Array of objects containing `session_id`, `attended` (boolean), and `attended_at` timestamp.

### Job
* **Title:** Job role title.
* **Description:** Description of job responsibilities.

### Review
* **Course ID:** Reference to the `Course` being reviewed.
* **User ID:** Reference to the `User` submitting the review.
* **Rating:** Score from 1 to 5.
* **Comment:** Textual feedback from the user.

### Career Path
* **Title:** Name of the career trajectory.
* **Description:** Summary of the career path.

### Notification
* **User ID:** Reference to the recipient `User`.
* **Type:** Category of notification (`course_assigned`, `course_completed`, or `hr_alert`).
* **Title:** Short subject line of the notification.
* **Message:** Detailed notification body.
* **Read:** Boolean flag to track if the notification has been viewed (defaults to `false`).