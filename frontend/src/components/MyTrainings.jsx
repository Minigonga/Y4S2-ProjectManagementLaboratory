import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

function getId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
}

function MyTrainings() {
  const navigate = useNavigate();
  const { currentUser, mongoUser, loading: authLoading } = useAuth();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [stats, setStats] = useState({
    inProgress: 0,
    completed: 0,
    completionRate: 0
  });

  // Redirect in useEffect instead of during render
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [authLoading, currentUser, navigate]);

  // Fetch user's enrolled courses with progress - wrapped in useCallback
  const fetchUserEnrollments = useCallback(async () => {
    try {
      const userId = getId(mongoUser?._id);
      if (!userId) return;

      const response = await fetch(`${API_BASE}/api/users/${userId}/enrollments`);
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      const data = await response.json();
      
      // Get full course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        data.map(async (enrollment) => {
          const courseId = getId(enrollment.course_id);
          const courseRes = await fetch(`${API_BASE}/api/courses/${courseId}?user=${userId}`);

          if (courseRes.ok) {
            const course = await courseRes.json();
            return {
              ...enrollment,
              course: course,
              course_id: courseId
            };
          }
          return enrollment;
        })
      );
      
      setEnrolledCourses(enrollmentsWithCourses);

      // Calculate stats from enrolled courses only
      const inProgressCount = enrollmentsWithCourses.filter(e => e.status === 'ongoing' || e.status === 'registered').length;
      const completedCount = enrollmentsWithCourses.filter(e => e.status === 'completed').length;
      
      // Calculate progress for each enrollment from session_attendance
      const enrollmentProgress = (e) => {
        if (!e.session_attendance?.length) return 0;
        const attended = e.session_attendance.filter(s => s.attended).length;
        return Math.round((attended / e.session_attendance.length) * 100);
      };
      const totalProgress = enrollmentsWithCourses.reduce((sum, e) => sum + enrollmentProgress(e), 0);
      const avgCompletionRate = enrollmentsWithCourses.length > 0 ? Math.round(totalProgress / enrollmentsWithCourses.length) : 0;
      
      setStats({
        inProgress: inProgressCount,
        completed: completedCount,
        completionRate: avgCompletionRate
      });
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Failed to load your training data');
    }
  }, [mongoUser]); 

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!currentUser || !mongoUser) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError('');
      await fetchUserEnrollments();
      if (!isMounted) return;
      setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [authLoading, currentUser, mongoUser, fetchUserEnrollments]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
  });
  }, []);

  // Get upcoming trainings from enrolled courses only
  const upcomingTrainings = useMemo(() => {
    const now = new Date();
    const monthFromNow = new Date();
    monthFromNow.setMonth(now.getMonth() + 1);

    const upcomingSessions = [];
    enrolledCourses.forEach((enrollment) => {
      const attendances = enrollment.session_attendance || [];
      attendances.forEach((sa) => {
        const session = sa.session_id;
        const date = new Date(session?.date);
        if (isNaN(date)) return;
        if (date >= now && date <= monthFromNow) {
          upcomingSessions.push({
            courseId: enrollment.course_id.id,
            name: enrollment.course.course.title,
            description: session.description || '',
            location: session.location || '',
            dateISO: date.toISOString(),
            duration_minutes: session.duration_minutes,
            formattedDate: formatDate(date.toISOString())
          });
        }
      });
    });

    upcomingSessions.sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));

    return upcomingSessions;
  }, [enrolledCourses]);

  const handleAddToGoogleCalendar = useCallback(async (index) => {
    const toGCalDate = (d) => {  
      const dt = new Date(d);
      const pad = (n) => String(n).padStart(2, '0');
      return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
    }; 
    
    const t = upcomingTrainings[index];

    const start = new Date(t.dateISO);
    const durationMinutes = t.duration_minutes || 60; 
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const dates = `${toGCalDate(start)}/${toGCalDate(end)}`;
  
    const calParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: t.name,
      dates,
      details: t.description,
    });
    const finalDestination = `https://calendar.google.com/calendar/render?${calParams.toString()}`;

    const authParams = new URLSearchParams({
      prompt: 'select_account', 
      continue: finalDestination 
    });
    
    window.open(`https://accounts.google.com/AccountChooser?${authParams.toString()}`, '_blank');
  
  }, [upcomingTrainings]);

  // Filter active trainings (not completed)
  const activeTrainings = useMemo(() => {
    const calculateProgress = (enrollment) => {
      if (!enrollment.session_attendance?.length) return 0;
      const attended = enrollment.session_attendance.filter(s => s.attended).length;
      return Math.round((attended / enrollment.session_attendance.length) * 100);
    };
    return enrolledCourses.filter(enrollment => 
      enrollment.status !== 'completed' && calculateProgress(enrollment) < 100
    );
  }, [enrolledCourses]);

  // Filter completed trainings
  const completedTrainings = useMemo(() => {
    const calculateProgress = (enrollment) => {
      if (!enrollment.session_attendance?.length) return 0;
      const attended = enrollment.session_attendance.filter(s => s.attended).length;
      return Math.round((attended / enrollment.session_attendance.length) * 100);
    };
    return enrolledCourses.filter(enrollment => 
      enrollment.status === 'completed' || calculateProgress(enrollment) === 100
    );
  }, [enrolledCourses]);

  // Filter and paginate active trainings
  const filteredAndPaginatedActiveTrainings = useMemo(() => {
    let filtered = activeTrainings;
    
    // Apply search filter to active trainings
    if (searchTerm.trim()) {
      filtered = filtered.filter(enrollment =>
        enrollment.course.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.course.course?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Pagination for active trainings
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    return {
      items: paginatedItems,
      totalPages,
      totalItems: filtered.length,
      currentPage: activePage
    };
  }, [activeTrainings, searchTerm, activePage, itemsPerPage]);

  // Filter and paginate completed trainings
  const filteredAndPaginatedCompletedTrainings = useMemo(() => {
    let filtered = completedTrainings;
    
    // Apply search filter to completed trainings
    if (searchTerm.trim()) {
      filtered = filtered.filter(enrollment =>
        enrollment.course.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.course.course?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Pagination for completed trainings
    const startIndex = (completedPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    return {
      items: paginatedItems,
      totalPages,
      totalItems: filtered.length,
      currentPage: completedPage
    };
  }, [completedTrainings, searchTerm, completedPage, itemsPerPage]);

  const handleActivePageChange = useCallback((page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCompletedPageChange = useCallback((page) => {
    setCompletedPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setActivePage(1);
    setCompletedPage(1);
  }, []);

  const getProgressColor = useCallback((progress) => {
    if (progress >= 75) return '#10b981';
    if (progress >= 50) return '#f59e0b';
    if (progress >= 25) return '#f58220';
    return '#ef4444';
  }, []);

  // Navigation handlers to prevent event bubbling
  const handleNavigateToCourse = useCallback((courseId, event) => {
    if (event) {
      event.stopPropagation();
    }
    const id = getId(courseId);
    if (id) {
      navigate(`/training/${id}`);
    }
  }, [navigate]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <>
        <Header />
        <div style={styles.page}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading your trainings...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Don't render if no user (redirect will happen in useEffect)
  if (!currentUser) {
    return null;
  }

  const userName = mongoUser?.name?.split(' ')[0] || 'User';
  const activePagination = filteredAndPaginatedActiveTrainings;
  const completedPagination = filteredAndPaginatedCompletedTrainings;
  const hasNoEnrollments = enrolledCourses.length === 0;
  const hasNoActiveTrainings = activePagination.totalItems === 0 && enrolledCourses.length > 0;

  return (
    <>
      <Header />

      <div style={styles.page}>
        {/* Top Section */}
        <div style={styles.topSection}>
          <div style={styles.welcomeSection}>
            <h1 style={styles.title}>Welcome Back, {userName}!</h1>

            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div>
                  <p style={styles.statTitle}>{stats.inProgress}</p>
                  <p style={styles.statSubtitle}>IN PROGRESS</p>
                </div>
              </div>
              <div style={styles.statCard}>
                {/*stats.completionRate > 0 && (
                  <div style={styles.badge}>{stats.completionRate}%</div>
                )*/}
                <div>
                  <p style={styles.statTitle}>{stats.completed}</p>
                  <p style={styles.statSubtitle}>COMPLETED</p>
                </div>
              </div>
              <div style={styles.statCard}>
                <div>
                  <p style={styles.statTitle}>{enrolledCourses.length}</p>
                  <p style={styles.statSubtitle}>TOTAL ENROLLED</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Trainings - Only from enrolled courses */}
          <div style={styles.nextCard}>
            <h2 style={styles.nextTitle}>Upcoming Trainings</h2>
            {upcomingTrainings.length > 0 ? (
            <>
              {upcomingTrainings.map((training, index) => (
                <div 
                  key={index} 
                  style={styles.nextItem}
                  onClick={(e) => handleNavigateToCourse(training.courseId, e)}
                  role="button"
                  tabIndex={0}
                >
                  <span>{training.name}</span>
                  <span style={styles.nextDate}>{training.formattedDate}</span>
                  <button style={styles.gCalender} onClick={() => handleAddToGoogleCalendar(index)} title='Click here to add this event to your Google Calendar!'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256"><path fill="#FFF" d="M195.368 60.632H60.632v134.736h134.736z"/><path fill="#EA4335" d="M195.368 256 256 195.368l-30.316-5.172-30.316 5.172-5.533 27.73z"/><path fill="#188038" d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316-6.225-30.316-33.033-5.172z"/><path fill="#1967D2" d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422q-5.532 22.554-5.533 33.196 0 10.641 5.533 27.436 20.115 5.76 30.316 5.76T256 60.631"/><path fill="#FBBC04" d="M256 60.632h-60.632v134.736H256z"/><path fill="#34A853" d="M195.368 195.368H60.632V256h134.736z"/><path fill="#4285F4" d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736z"/><path fill="#4285F4" d="M88.27 165.154c-5.036-3.402-8.523-8.37-10.426-14.94l11.689-4.816q1.59 6.063 5.558 9.398c2.627 2.223 5.827 3.318 9.566 3.318q5.734 0 9.852-3.487c2.746-2.324 4.127-5.288 4.127-8.875q0-5.508-4.345-8.994c-2.897-2.324-6.535-3.486-10.88-3.486h-6.754v-11.57h6.063q5.608 0 9.448-3.033c2.56-2.02 3.84-4.783 3.84-8.303 0-3.132-1.145-5.625-3.435-7.494-2.29-1.87-5.188-2.813-8.708-2.813-3.436 0-6.164.91-8.185 2.745a16.1 16.1 0 0 0-4.413 6.754l-11.57-4.817c1.532-4.345 4.345-8.185 8.471-11.503s9.398-4.985 15.798-4.985c4.733 0 8.994.91 12.767 2.745 3.772 1.836 6.736 4.379 8.875 7.613 2.14 3.25 3.2 6.888 3.2 10.93 0 4.126-.993 7.613-2.98 10.476s-4.43 5.052-7.327 6.585v.69a22.25 22.25 0 0 1 9.398 7.327c2.442 3.284 3.672 7.208 3.672 11.79 0 4.58-1.163 8.673-3.487 12.26-2.324 3.588-5.54 6.417-9.617 8.472-4.092 2.055-8.69 3.1-13.793 3.1-5.912.016-11.369-1.685-16.405-5.087m71.797-58.005-12.833 9.28-6.417-9.734 23.023-16.607h8.825v78.333h-12.598z"/></svg>
                  </button>
                </div>
              ))}
            </>
            ) : (
              <div style={styles.noDataText}>
                {hasNoEnrollments 
                  ? "You haven't enrolled in any courses yet" 
                  : "No upcoming trainings scheduled"}
              </div>
            )}
          </div>
        </div>

        {/* Active Trainings Section */}
        <div style={styles.bottomSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Assigned Trainings 
              {activePagination.totalItems > 0 && (
                <span style={styles.countBadge}>{activePagination.totalItems}</span>
              )}
            </h2>
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          {hasNoEnrollments ? (
            <div style={styles.noTrainingsCard}>
              <p style={styles.noTrainingsText}>
                You haven't enrolled in any courses yet.
              </p>
              <button 
                style={styles.browseButton}
                onClick={() => navigate('/course-list')}
              >
                Browse Available Courses
              </button>
            </div>
          ) : hasNoActiveTrainings ? (
            <div style={styles.noTrainingsCard}>
              <p style={styles.noTrainingsText}>
                {searchTerm 
                  ? 'No assigned trainings match your search.' 
                  : "Great job! You've completed all your assigned trainings."}
              </p>
              {completedTrainings.length === 0 && (
                <button 
                  style={styles.browseButton}
                  onClick={() => navigate('/course-list')}
                >
                  Enroll in New Courses
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={styles.grid}>
                {activePagination.items.map((enrollment) => (
                  <div 
                    key={getId(enrollment._id)} 
                    style={styles.card}
                    onClick={(e) => handleNavigateToCourse(enrollment.course_id, e)}
                    role="button"
                    tabIndex={0}
                  >
                    <div style={styles.imageContainer}>
                      <img 
                        src={enrollment.course.course?.image_url || 'https://picsum.photos/200/300'} 
                        alt={enrollment.course.course?.title}
                        style={styles.image}
                        onError={(e) => {
                          e.target.src = 'https://picsum.photos/200/300';
                        }}
                      />
                      <div style={styles.statusBadge}>
                        {(() => {
                          const attended = enrollment.session_attendance?.filter(s => s.attended).length || 0;
                          const total = enrollment.session_attendance?.length || 0;
                          const progress = total > 0 ? Math.round((attended / total) * 100) : 0;
                          return progress === 100 ? 'Completed' : `${progress}% Complete`;
                        })()}
                      </div>
                    </div>

                    <div style={styles.cardBody}>
                      <h3 style={styles.courseTitle}>{enrollment.course?.course?.title || 'Untitled Course'}</h3>
                      <p style={styles.courseDescription}>
                        {enrollment.course.course?.description?.substring(0, 100) || 'No description available'}
                        {enrollment.course.course?.description?.length > 100 ? '...' : ''}
                      </p>
                      
                      <div style={styles.progressSection}>
                        <div style={styles.progressHeader}>
                          <span>Progress</span>
                          <span style={{ color: getProgressColor((() => {
                            const attended = enrollment.session_attendance?.filter(s => s.attended).length || 0;
                            const total = enrollment.session_attendance?.length || 0;
                            return total > 0 ? Math.round((attended / total) * 100) : 0;
                          })()) }}>
                            {(() => {
                              const attended = enrollment.session_attendance?.filter(s => s.attended).length || 0;
                              const total = enrollment.session_attendance?.length || 0;
                              return total > 0 ? Math.round((attended / total) * 100) : 0;
                            })()}%
                          </span>
                        </div>
                        <div style={styles.progressBarBg}>
                          <div
                            style={{
                              ...styles.progressBar,
                              width: `${(() => {
                                const attended = enrollment.session_attendance?.filter(s => s.attended).length || 0;
                                const total = enrollment.session_attendance?.length || 0;
                                return total > 0 ? Math.round((attended / total) * 100) : 0;
                              })()}%`,
                              backgroundColor: getProgressColor((() => {
                                const attended = enrollment.session_attendance?.filter(s => s.attended).length || 0;
                                const total = enrollment.session_attendance?.length || 0;
                                return total > 0 ? Math.round((attended / total) * 100) : 0;
                              })())
                            }}
                          />
                        </div>
                      </div>

                      <div style={styles.courseDetails}>
                        <div style={styles.detailItem}>
                          <span style={styles.detailLabel}>Enrolled:</span>
                          <span style={styles.detailValue}>
                            {formatDate(enrollment.enrolled_at)}
                          </span>
                        </div>
                        {enrollment.course.course?.duration_hours && (
                          <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Duration:</span>
                            <span style={styles.detailValue}>
                              {enrollment.course.course.duration_hours} hours
                            </span>
                          </div>
                        )}
                      </div>

                      {enrollment.session_attendance && enrollment.session_attendance.length > 0 && (
                        <div style={styles.attendanceInfo}>
                          <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Sessions Attended:</span>
                            <span style={styles.detailValue}>
                              {enrollment.session_attendance.filter(s => s.attended).length} / {enrollment.session_attendance.length}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Trainings Pagination */}
              {activePagination.totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => handleActivePageChange(activePage - 1)}
                    disabled={activePage === 1}
                    style={styles.pageButton}
                  >
                    Previous
                  </button>
                  
                  <div style={styles.pageNumbers}>
                    {Array.from({ length: activePagination.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handleActivePageChange(page)}
                        style={{
                          ...styles.pageNumber,
                          ...(page === activePage ? styles.activePage : {})
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleActivePageChange(activePage + 1)}
                    disabled={activePage === activePagination.totalPages}
                    style={styles.pageButton}
                  >
                    Next
                  </button>
                </div>
              )}

              <div style={styles.summaryInfo}>
                Showing {activePagination.items.length} of {activePagination.totalItems} assigned trainings
              </div>
            </>
          )}
        </div>

        {/* Completed Trainings Section */}
        {completedTrainings.length > 0 && (
          <div style={styles.completedSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Completed Trainings 
                <span style={styles.countBadge}>{completedPagination.totalItems}</span>
              </h2>
            </div>

            <div style={styles.completedGrid}>
              {completedPagination.items.map((enrollment) => (
                <div 
                  key={getId(enrollment._id)} 
                  style={styles.completedCard}
                  onClick={(e) => handleNavigateToCourse(enrollment.course_id, e)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={styles.completedCardContent}>
                    <div style={styles.completedIcon}>✓</div>
                    <div style={styles.completedCardDetails}>
                      <h4 style={styles.completedTitle}>{enrollment.course.course?.title}</h4>
                      <p style={styles.completedDate}>
                        Completed: {formatDate(enrollment.completed_at || enrollment.updated_at)}
                      </p>
                      {enrollment.course.course?.duration_hours && (
                        <p style={styles.completedMeta}>
                          Duration: {enrollment.course.course.duration_hours} hours • 
                          Format: {enrollment.course.course.format?.replace('_', ' ').toUpperCase() || 'N/A'}
                        </p>
                      )}
                      {enrollment.session_attendance && enrollment.session_attendance.length > 0 && (
                        <p style={styles.completedMeta}>
                          Attendance: {enrollment.session_attendance.filter(s => s.attended).length}/{enrollment.session_attendance.length} sessions
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={styles.completedBadge}>Completed</div>
                </div>
              ))}
            </div>

            {/* Completed Trainings Pagination */}
            {completedPagination.totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => handleCompletedPageChange(completedPage - 1)}
                  disabled={completedPage === 1}
                  style={styles.pageButton}
                >
                  Previous
                </button>
                
                <div style={styles.pageNumbers}>
                  {Array.from({ length: completedPagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handleCompletedPageChange(page)}
                      style={{
                        ...styles.pageNumber,
                        ...(page === completedPage ? styles.activePage : {})
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handleCompletedPageChange(completedPage + 1)}
                  disabled={completedPage === completedPagination.totalPages}
                  style={styles.pageButton}
                >
                  Next
                </button>
              </div>
            )}

            <div style={styles.summaryInfo}>
              Showing {completedPagination.items.length} of {completedPagination.totalItems} completed trainings
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  page: {
    backgroundColor: '#f5f7fb',
    minHeight: '100vh',
    padding: '30px 40px'
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },

  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #f58220',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },

  topSection: {
    backgroundColor: '#eef2f7',
    borderRadius: '16px',
    padding: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '20px'
  },

  welcomeSection: {
    flex: 1,
  },

  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '30px',
    textAlign: 'left'
  },

  statsRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },

  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#fff',
    padding: '15px 20px',
    borderRadius: '10px',
    border: '1px solid #eee',
    position: 'relative',
    minWidth: '140px'
  },

  badge: {
    backgroundColor: '#f58220',
    color: '#fff',
    fontSize: '12px',
    padding: '4px 6px',
    borderRadius: '4px',
    fontWeight: '600'
  },

  statTitle: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
    color: '#1a2c3e'
  },

  statSubtitle: {
    fontSize: '11px',
    color: '#9aa0a6',
    margin: 0,
    fontWeight: '600',
    letterSpacing: '0.5px'
  },

  nextCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    width: '280px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },

  nextTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#1a2c3e'
  },

  nextItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    padding: '8px 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: '6px'
  },

  nextDate: {
    color: '#9aa0a6',
    fontSize: '11px',
    fontWeight: '500'
  },

  searchBarContainer: {
    marginTop: '20px',
    marginBottom: '30px'
  },

  searchInputFull: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#fff'
  },

  bottomSection: {
    marginTop: '20px'
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },

  sectionTitle: {
    fontSize: '22px',
    fontWeight: '600',
    margin: 0,
    color: '#1a2c3e',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  countBadge: {
    backgroundColor: '#e2e8f0',
    color: '#475569',
    fontSize: '14px',
    padding: '2px 8px',
    borderRadius: '20px',
    fontWeight: '500'
  },

  errorText: {
    color: '#b91c1c',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px'
  },

  noTrainingsCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center',
    border: '1px solid #e2e8f0'
  },

  noTrainingsText: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '20px'
  },

  browseButton: {
    backgroundColor: '#f58220',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },

  gCalender: {
    padding: '0px',
    border: '0px',
    cursor: 'pointer',
    background: '#ffffff',
    color: '#0f4e8b',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px',
    marginBottom: '30px'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },

  imageContainer: {
    position: 'relative'
  },

  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },

  statusBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#f58220',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },

  cardBody: {
    padding: '20px'
  },

  courseTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a2c3e',
    margin: '0 0 10px 0',
    lineHeight: '1.3'
  },

  courseDescription: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '16px'
  },

  progressSection: {
    marginBottom: '16px'
  },

  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: '8px'
  },

  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden'
  },

  progressBar: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '3px'
  },

  courseDetails: {
    marginBottom: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9'
  },

  attendanceInfo: {
    paddingTop: '8px'
  },

  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '6px'
  },

  detailLabel: {
    color: '#94a3b8',
    fontWeight: '500'
  },

  detailValue: {
    color: '#334155',
    fontWeight: '500'
  },

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
    marginBottom: '16px'
  },

  pageButton: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  pageNumbers: {
    display: 'flex',
    gap: '8px'
  },

  pageNumber: {
    padding: '8px 12px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  activePage: {
    backgroundColor: '#f58220',
    color: '#fff',
    borderColor: '#f58220'
  },

  summaryInfo: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '16px'
  },

  noDataText: {
    color: '#94a3b8',
    fontSize: '13px',
    textAlign: 'center',
    padding: '20px'
  },

  completedSection: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  },

  completedGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  completedCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  completedCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  },

  completedCardDetails: {
    flex: 1
  },

  completedIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#10b981',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold'
  },

  completedTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a2c3e',
    margin: '0 0 4px 0'
  },

  completedDate: {
    fontSize: '12px',
    color: '#64748b',
    margin: '0 0 4px 0'
  },

  completedMeta: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: 0
  },

  completedBadge: {
    backgroundColor: '#e5f5e5',
    color: '#10b981',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  }
};

// Add animation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .next-item:hover {
    background-color: #f7f9fc;
    padding-left: 8px;
  }
  
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  
  .completed-card:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .search-input-full:focus {
    border-color: #f58220;
    box-shadow: 0 0 0 3px rgba(245,130,32,0.1);
  }
  
  .page-button:hover:not(:disabled) {
    background-color: #f8fafc;
    border-color: #f58220;
  }
  
  .page-number:hover {
    background-color: #f8fafc;
    border-color: #f58220;
  }
  
  .browse-button:hover {
    background-color: #e06e1a;
  }
`;
document.head.appendChild(styleSheet);

export default MyTrainings;