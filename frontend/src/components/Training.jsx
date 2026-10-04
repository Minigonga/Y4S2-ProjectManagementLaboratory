import { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import './Training.css';
import clockIcon from '../assets/clock.png';

function Tag({ children }) {
  return <span className="training-tag">{children}</span>;
}

function SideCard({ title, children }) {
  return (
    <div className="training-side-card">
      <h3 className="training-side-card-title">{title}</h3>
      {children}
    </div>
  );
}

function StaticStars({ rating }) {
  return (
    <div className="static-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="star">
          {star <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

function ReviewItem({ review }) {
  const initials = (review.user_name || 'AU')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString(undefined, {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : 'Recent';

  return (
    <div className="review-card">
      <div className="review-top">
        <div className="avatar">{initials}</div>
        <div className="review-meta">
          <p className="review-name">{review.user_name || 'Anonymous User'}</p>
          <p className="review-date-line">{formattedDate}</p>
        </div>
        <div className="rating-pill">
          <span className="star-filled">★</span>
          <span>{review.rating}.0</span>
        </div>
      </div>
      <p className="review-comment">{review.comment}</p>
    </div>
  );
}

function ModuleRow({ session, index, isAttended, onMarkAttendance, enrollment }) {
  const [expanded, setExpanded] = useState(false);
  
  const sessionDate = new Date(session.date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return (
    <div className="training-module-row">
      <div className="training-module-header" onClick={() => setExpanded(!expanded)}>
        <div className="training-module-left">
          <div className="training-module-icon">{expanded ? '▼' : '▶'}</div>
          <div className="training-session-info">
            <span className='training-module-title'>Session {index + 1}</span>
          </div>
        </div>
        <div className={`training-module-check ${isAttended ? 'completed' : ''}`}>
          {isAttended ? '✓' : ''}
        </div>
      </div>

      {expanded && (
        <div className="training-module-content">
          <div className="session-details-grid">
            <div className="detail-item"><strong>Date:</strong> {sessionDate}</div>
            <div className="detail-item"><strong>Location:</strong> {session.location || 'Online'}</div>
            <div className="detail-item"><strong>Duration:</strong> {session.duration_minutes} mins</div>
          </div>

          {!isAttended && enrollment && (
            <button 
              className="mark-attendance-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onMarkAttendance(session._id);
              }}
            >
              Mark as Attended
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Stars({ rating, hoverRating, onRate, onHover, onLeave }) {
  return (
    <div className="training-stars" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            className="training-star-button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
          >
            {isFilled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
}

// --- Main Component ---

function Training() {
  const { courseId } = useParams();
  const { currentUser, mongoUser, loading: authLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isInterested, setIsInterested] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function fetchCourseData() {
      if (authLoading) return;
      if (!currentUser || !mongoUser?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}?user=${mongoUser._id}`);
        if (!response.ok) throw new Error('Error fetching course data');
        const data = await response.json();
        
        setCourse(data.course);
        const sortedSessions = (data.sessions || []).sort((a, b) => new Date(a.date) - new Date(b.date));
        setSessions(sortedSessions);
        setEnrollment(data.enrollment);
        setReviews(data.reviews);
        
        if (mongoUser?.interested_courses?.includes(courseId)) {
          setIsInterested(true);
        }

        const userAlreadyReviewed = data.reviews.some((rev) => rev.user_id === mongoUser._id);
        setHasReviewed(userAlreadyReviewed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCourseData();
  }, [courseId, currentUser, mongoUser, authLoading]);

  const toggleInterested = async () => {
    const endpoint = isInterested ? '/api/users/interested-courses/remove' : '/api/users/interested-courses/add';
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({ userId: mongoUser._id, courseId })
      });
      if (!response.ok) throw new Error("Failed to update interests");
      setIsInterested(!isInterested);
    } catch (err) {
      alert(err.message);
    }
  };

  const { progress, attendedCount, totalDurationMinutes } = useMemo(() => {
    if (!sessions.length) return { progress: 0, attendedCount: 0, totalDurationMinutes: 0 };
    const attended = enrollment?.session_attendance?.filter(s => s.attended).length || 0;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    return {
      progress: Math.round((attended / sessions.length) * 100),
      attendedCount: attended,
      totalDurationMinutes: totalMinutes
    };
  }, [sessions, enrollment]);

  const handleMarkAttendance = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/addAttendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ sessionId, 'userId': mongoUser._id, attended: true })
      });
      if (!response.ok) throw new Error("Failed to update attendance");
      const updatedData = await response.json();
      setEnrollment(updatedData.enrollment);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteTraining = async () => {
    try {
      setCompleting(true);
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'UserID': mongoUser._id }
      });
      if (!response.ok) throw new Error("Failed to finalize completion");
      
      const updatedData = await response.json();
      setEnrollment(updatedData.enrollment);
      alert("Congratulations! Training completed.");
    } catch (err) {
      alert(err.message);
    } finally {
      setCompleting(false);
      window.location.reload();
    }
  };

  const handleReviewSubmit = async () => {
    if (userRating === 0) return alert("Please select a star rating.");
    try {
      setSubmittingReview(true);
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'UserID': mongoUser._id },
        body: JSON.stringify({ rating: userRating, comment })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to submit review");
      }
      const updatedData = await response.json();
      setReviews(prev => [...prev, updatedData.review]);
      setHasReviewed(true);   
      setComment('');
      setUserRating(0);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!authLoading && !currentUser) return <Navigate to="/login" replace />;
  if (authLoading || loading) return <><Header /><div className="training-page">Loading...</div></>;
  if (error || !course) return <><Header /><div className="training-page">{error || "No course found."}</div></>;

  const dbStatusCompleted = enrollment?.status?.toLowerCase() === 'completed';
  const readyToComplete = progress === 100 && !dbStatusCompleted;
  
  return (
    <div className="training-wrapper">
      <Header />
      <div className="training-page">
        <div className="training-container">
          <div className="training-top">
            <h1 className="training-title">{course.title}</h1>
            <div className="training-tag-space">
              <div className="training-type"><span>{course.type}</span></div>
              <div className="training-tags">
                {course.skill_tags?.map((tag, i) => <Tag key={i}>{tag}</Tag>)}
              </div>
              <div className="training-location"><span>{course.format}</span></div>
            </div>
          </div>

          <div className="training-layout">
            <div className="training-main-card">
              <div className="training-main-header">
                <h2 className="training-main-about">About this training:</h2>
                <div className="training-duration">
                  <img src={clockIcon} alt="Duration" className="clock-icon" />
                  <span>
                    {totalDurationMinutes >= 60
                      ? `${Math.floor(totalDurationMinutes / 60)}h${totalDurationMinutes % 60 > 0 ? ` ${totalDurationMinutes % 60}m` : ''}`
                      : `${totalDurationMinutes}m`}
                  </span>
                </div>
              </div>
              <div className="training-description">{course.description}</div>

              <h3 className="schedule-heading">Training Schedule</h3>
              <div className="sessions-list">
                {sessions.map((session, idx) => {
                  const isAttended = enrollment?.session_attendance?.find(
                    s => s.session_id === session._id || s._id === session._id
                  )?.attended;
                  return (
                    <ModuleRow 
                      key={session._id} 
                      session={session} 
                      index={idx} 
                      isAttended={isAttended} 
                      onMarkAttendance={handleMarkAttendance}
                      enrollment={enrollment}
                    />
                  );
                })}
              </div>
              
              {!enrollment && (
                <div className="interest-action-wrapper" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                  <button 
                    onClick={toggleInterested} 
                    className={`training-button ${isInterested ? 'interested' : ''}`}
                  >
                    {isInterested ? '✓ Added to Interested in Courses' : 'Add to Interested in Courses'}
                  </button>
                </div>
              )}

              <div className="training-reviews-section">
                <h3 className="schedule-heading">User Reviews</h3>
                {reviews?.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map((rev, idx) => <ReviewItem key={idx} review={rev} />)}
                  </div>
                ) : (
                  <p className="no-reviews-message">No reviews yet.</p>
                )}
              </div>
            </div>

            <div className="training-sidebar">
              {enrollment && (
                <div className="training-side-card">
                  <h3 className="training-side-card-title">Progress</h3>
                  <div className={`training-status status-${enrollment.status?.toLowerCase()}`}>
                    {enrollment.status}
                  </div>
                  <div className="training-progress-text">
                    <strong>{progress}%</strong> Complete
                  </div>
                  <div className="training-progress-bar">
                    <div className="training-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  
                  {readyToComplete && (
                    <button 
                      className="training-button completion-btn" 
                      onClick={handleCompleteTraining}
                      disabled={completing}
                    >
                      {completing ? 'Completing...' : 'Finish & Complete Course'}
                    </button>
                  )}
                </div>
              )}

              {dbStatusCompleted && (
                <SideCard title="Leave Feedback">
                  {hasReviewed ? (
                    <div className="review-submitted-msg">
                      <p>Thank you for reviewing this course!</p>
                    </div>
                  ) : (
                    <div className="review-form-container">
                      <div className="rating-input-section" style={{ marginBottom: '1rem' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Rate this training:</p>
                        <Stars 
                          rating={userRating}
                          hoverRating={hoverRating}
                          onRate={setUserRating}
                          onHover={setHoverRating}
                          onLeave={() => setHoverRating(0)}
                        />
                      </div>
                      
                      <div className="comment-input-section" style={{ marginBottom: '1rem' }}>
                        <textarea
                          placeholder="Share your experience..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows="4"
                          style={{ width: '90%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', color: '#333', resize: 'none' }}
                        />
                      </div>
                      
                      <button 
                        className="training-button" 
                        onClick={handleReviewSubmit}
                        disabled={submittingReview || userRating === 0}
                        style={{ width: '100%', opacity: (submittingReview || userRating === 0) ? 1 : 1 }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  )}
                </SideCard>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Training;