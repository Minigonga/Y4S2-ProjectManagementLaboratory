import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import './Profile.css';

export default function Profile() {
  const { currentUser, mongoUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || !mongoUser) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, currentUser, mongoUser, navigate]);

  useEffect(() => {
    if (authLoading || !currentUser || !mongoUser || !mongoUser._id) return;
    const targetUserId = userId || mongoUser._id;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/api/users/profile/${targetUserId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Network response was not ok');
        return r.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authLoading, currentUser, mongoUser, userId]);

  if (authLoading || !currentUser || !mongoUser) return null;
  if (loading) return <div className="profile-container">Loading profile...</div>;
  if (error) return <div className="profile-container">Error: {error}</div>;
  if (!profile) return null;
  const { user, teams } = profile;

  const teamNames = teams && teams.length ? teams.map(t => t.name).join(', ') : 'No team assigned';
  const interestedCourses = Array.isArray(user.interested_courses)
    ? user.interested_courses.filter((course) => course && typeof course === 'object')
    : [];
  const linkedInRaw = user.linkedIn_url || user.linkedin_url || '';
  const linkedInHref = linkedInRaw
    ? (linkedInRaw.startsWith('http') ? linkedInRaw : `https://${linkedInRaw}`)
    : '';

  return (
    <>
      <Header />

      <div className="profile-page">
        <main className="profile-container">
          <section className="profile-layout">
          <div className="profile-left">
            <div className="profile-avatar-wrap">
              <img className="profile-avatar" src={user.image_url || '/default-avatar.png'} alt={user.name} />
            </div>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            {linkedInHref && (
              <a
                className="profile-inline-linkedin"
                href={linkedInHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="profile-inline-linkedin-text">LinkedIn</span>
              </a>
            )}
          </div>

          <div className="profile-right">
            <div className="profile-meta">
              <div className="profile-meta-item">
                <span className="profile-meta-label">Team</span>
                <span className="profile-meta-value">{teamNames}</span>
              </div>
              {/* Added Job Display */}
              <div className="profile-meta-item">
                <span className="profile-meta-label">Job</span>
                <span className="profile-meta-value">
                  {user.job_id?.title || 'No job assigned'}
                </span>
              </div>
            </div>

            {/* Optional: Job Description Section */}
            {user.job_id?.description && (
              <div className="profile-job-details">
                 <h3>Job Description</h3>
                 <p>
                    {user.job_id?.description}
                 </p>
              </div>
            )}

            <div className="profile-courses">
              <h3>Interested in Courses</h3>
              {interestedCourses.length ? (
                <>
                  <ul>
                    {interestedCourses.slice(0, 3).map((course, idx) => (
                      <li key={idx}>
                        <Link className="course-link" to={`/training/${course._id}`}>
                          <span className="course-title">{course.title || 'Unknown course'}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {interestedCourses.length > 3 && (
                    <div className="profile-courses-footer">
                      <Link to="/course-list" className="view-more-link">View more</Link>
                    </div>
                  )}
                </>
              ) : (
                <p>No interested in courses yet.</p>
              )}
            </div>
          </div>
          </section>
        </main>
      </div>
    </>
  );
}