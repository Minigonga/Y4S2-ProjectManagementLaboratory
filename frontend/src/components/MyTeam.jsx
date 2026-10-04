import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

function calculatePeopleSessionStats(people = []) {
  return people.map((person) => {
    const enrollments = person.enrollments ?? [];

    let totalSessions = 0;
    let attendedSessions = 0;

    // Track assigned hours by month
    const hoursAssignedByMonthMap = {};
    const hoursDoneByMonthMap = {};

    const enrollmentStats = enrollments.map((enrollment) => {
      const sessionAttendance = enrollment.session_attendance ?? [];
      const enrollmentTotalSessions = sessionAttendance.length;
      const enrollmentAttendedSessions = sessionAttendance.filter(
        (session) => session.attended === true
      ).length;

      const enrollmentCompletionRate =
        enrollmentTotalSessions > 0
          ? Math.round((enrollmentAttendedSessions / enrollmentTotalSessions) * 100)
          : 0;

      totalSessions += enrollmentTotalSessions;
      attendedSessions += enrollmentAttendedSessions;

      // Group assigned hours by enrollment month
      if (enrollment.enrolled_at) {
        const date = new Date(enrollment.enrolled_at);
        const monthKey = `${date.getUTCFullYear()}-${String(
          date.getUTCMonth() + 1
        ).padStart(2, "0")}`;

        const hours = enrollment.course_id?.duration_hours || 0;
        hoursAssignedByMonthMap[monthKey] =
          (hoursAssignedByMonthMap[monthKey] || 0) + hours;
      }

      if (enrollment.completed_at) {
        const date = new Date(enrollment.completed_at);
        const monthKey = `${date.getUTCFullYear()}-${String(
          date.getUTCMonth() + 1
        ).padStart(2, "0")}`;

        const hours = enrollment.course_id?.duration_hours || 0;
        hoursDoneByMonthMap[monthKey] =
          (hoursDoneByMonthMap[monthKey] || 0) + hours;
      }

      return {
        name: enrollment.course_id?.title,
        hours: enrollment.course_id?.duration_hours,
        status: enrollment.status,
        totalSessions: enrollmentTotalSessions,
        attendedSessions: enrollmentAttendedSessions,
        completionRate: enrollmentCompletionRate,
      };
    });

    const completionRate =
      totalSessions > 0
        ? Math.round((attendedSessions / totalSessions) * 100)
        : 0;

    const hoursAssigned = enrollments.reduce((sum, enrollment) => {
      return sum + (enrollment.course_id?.duration_hours || 0);
    }, 0);

    const completedHours = enrollments.reduce((sum, enrollment) => {
      if (enrollment.status !== "completed") return sum;
      return sum + (enrollment.course_id?.duration_hours || 0);
    }, 0);

    // Convert grouped object into array
    const hoursAssignedByMonth = Object.entries(
      hoursAssignedByMonthMap
    ).map(([month, hours]) => ({ month, hours }));

    const hoursDoneByMonth = Object.entries(
      hoursDoneByMonthMap
    ).map(([month, hours]) => ({ month, hours }));

    return {
      ...person,
      hoursAssigned,
      completedHours,
      totalSessions,
      attendedSessions,
      missedSessions: totalSessions - attendedSessions,
      completionRate,
      enrollmentStats,
      hoursAssignedByMonth,
      hoursDoneByMonth,
    };
  });
}

function buildMonthlyMetrics(peopleStats = []) {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Initialize all months
  const monthlyMap = monthNames.reduce((acc, month) => {
    acc[month] = { month, hoursAssigned: 0, hoursDone: 0 };
    return acc;
  }, {});

  peopleStats.forEach((person) => {
    const assigned = person.hoursAssignedByMonth ?? [];
    const done = person.hoursDoneByMonth ?? [];

    // Assigned hours
    assigned.forEach(({ month, hours }) => {
      const [, monthNumber] = month.split("-");
      const monthName = monthNames[Number(monthNumber) - 1];
      if (monthlyMap[monthName]) {
        monthlyMap[monthName].hoursAssigned += hours;
      }
    });

    // Done hours
    done.forEach(({ month, hours }) => {
      const [, monthNumber] = month.split("-");
      const monthName = monthNames[Number(monthNumber) - 1];
      if (monthlyMap[monthName]) {
        monthlyMap[monthName].hoursDone += hours;
      }
    });
  });

  return Object.values(monthlyMap);
}

function TeamMonthlyPerformance({ stats }) {
  const [timeRange, setTimeRange] = useState(6); // Default to 6 months

  // Helper to generate the last N months labels
  const getMonths = (count) => {
    const months = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString('default', { month: 'short' }) + " '" + String(d.getFullYear()).slice(-2);
      months.push({ key, label });
    }
    return months;
  };

  const monthlyMetrics = useMemo(() => {
    const requiredMonths = getMonths(timeRange);
    
    // Create a map for O(1) access to stats
    const statsMap = new Map();
    
    // Aggregate all stats into the map
    stats.forEach(person => {
      // Aggregate Assigned
      person.hoursAssignedByMonth.forEach(({ month, hours }) => {
        const current = statsMap.get(month) || { hoursAssigned: 0, hoursDone: 0 };
        statsMap.set(month, { ...current, hoursAssigned: current.hoursAssigned + hours });
      });
      // Aggregate Done
      person.hoursDoneByMonth.forEach(({ month, hours }) => {
        const current = statsMap.get(month) || { hoursAssigned: 0, hoursDone: 0 };
        statsMap.set(month, { ...current, hoursDone: current.hoursDone + hours });
      });
    });

    // Map the required months to the aggregated data
    return requiredMonths.map(({ key, label }) => ({
      month: label,
      hoursAssigned: statsMap.get(key)?.hoursAssigned || 0,
      hoursDone: statsMap.get(key)?.hoursDone || 0
    }));
  }, [stats, timeRange]);

  const maxHours = Math.max(...monthlyMetrics.map(m => Math.max(m.hoursAssigned, m.hoursDone)), 1);

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionIcon} />
        <h2 style={styles.sectionTitle}>Team Members Performance</h2>
        <div style={styles.timeRangeButtons}>
          {[1, 3, 6, 12].map(months => (
            <button
              key={months}
              onClick={() => setTimeRange(months)}
              style={{
                ...styles.timeButton,
                backgroundColor: timeRange === months ? '#f58220' : '#ffffff',
                color: timeRange === months ? '#ffffff' : '#8a99a8',
                borderColor: timeRange === months ? '#f58220' : '#e8edf2',
              }}
            >
              {months}m
            </button>
          ))}
        </div>
      </div>

      <div style={styles.graphCard}>
        <div style={styles.graphContainer}>
          {monthlyMetrics.map((metric, idx) => (
            <div key={idx} style={styles.barGroup}>
              <div style={styles.barContainer}>
                <div
                  style={{
                    ...styles.bar,
                    height: `${(metric.hoursDone / maxHours) * 200}px`,
                    backgroundColor: '#f58220',
                  }}
                  title={`${metric.hoursDone}h done`}
                />
                <div
                  style={{
                    ...styles.bar,
                    height: `${(metric.hoursAssigned / maxHours) * 200}px`,
                    backgroundColor: '#fdd5b3',
                    opacity: 0.6,
                  }}
                  title={`${metric.hoursAssigned}h assigned`}
                />
              </div>
              <p style={styles.barLabel}>{metric.month}</p>
            </div>
          ))}
        </div>
        <div style={styles.graphLegend}>
          <span><div style={{ ...styles.legendDot, backgroundColor: '#f58220' }} /> Hours Done</span>
          <span><div style={{ ...styles.legendDot, backgroundColor: '#fdd5b3' }} /> Hours Assigned</span>
        </div>
      </div>
    </div>
  );
}

function MyTeam() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = useParams();

  const [team, setTeam] = useState(location.state?.team || null);
  const [loading, setLoading] = useState(!location.state?.team);
  const [membersData, setMembersData] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [missedSessions, setMissedSessions] = useState([]);
  const [recentCompletions, setRecentCompletions] = useState([]);
  
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    totalCoursesCompleted: 0,
    totalCoursesInProgress: 0,
    totalHoursCompleted: 0,
    averageProgress: 0,
    completionRate: 0,
  });

  const fetchTeamData = useCallback(async () => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/teams/${teamId}/with-missed-sessions`);
      if (!response.ok) throw new Error('Failed to fetch team data');
      const data = await response.json();
      
      setTeam(data.team);
      setMembersData(data.members || []);
      setMissedSessions(data.missedSessions || []);
      setRecentCompletions(data.recentCompletions || []);
      
      const totalMembers = data.members?.length || 0;
      const totalCoursesCompleted = data.members?.reduce((sum, m) => sum + (m.completedCourses || 0), 0) || 0;
      const totalCoursesInProgress = data.members?.reduce((sum, m) => sum + ((m.totalCourses || 0) - (m.completedCourses || 0)), 0) || 0;
      const totalHoursCompleted = data.members?.reduce((sum, m) => sum + (m.totalHoursCompleted || 0), 0) || 0;
      
      const membersWithCourses = data.members?.filter(m => m.totalCourses > 0) || [];
      const averageProgress = membersWithCourses.length > 0 
        ? Math.round(membersWithCourses.reduce((sum, m) => sum + (m.averageProgress || 0), 0) / membersWithCourses.length)
        : 0;
      
      const totalEnrolledCourses = data.members?.reduce((sum, m) => sum + (m.totalCourses || 0), 0) || 0;
      const completionRate = totalEnrolledCourses > 0 
        ? Math.round((totalCoursesCompleted / totalEnrolledCourses) * 100)
        : 0;

      setTeamStats({
        totalMembers,
        totalCoursesCompleted,
        totalCoursesInProgress,
        totalHoursCompleted,
        averageProgress,
        completionRate,
      });
      
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId, fetchTeamData]);

  // Secondary fetch to get raw enrollments specifically for the performance graph
  useEffect(() => {
    const fetchGraphStats = async () => {
      try {
        if (!membersData || membersData.length === 0) return;

        const responses = await Promise.allSettled(
          membersData.map((member) =>
            fetch(`${API_BASE}/api/enrollments/user/${member.memberId}/courses`)
              .then(async (res) => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json();
              })
          )
        );

        const membersWithEnrollments = responses.map((result, index) => ({
          ...membersData[index],
          enrollments: result.status === "fulfilled" ? result.value.enrollments || [] : []
        }));

        const calculatedStats = calculatePeopleSessionStats(membersWithEnrollments);
        setGraphData(calculatedStats);

      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    if (membersData.length > 0) {
      fetchGraphStats();
    }
  }, [membersData]);

  const handleGenerateForMember = (memberId) => {
    navigate(`/ai-suggestions/${teamId}`, {
      state: { team, filterMemberId: memberId }
    });
  };

  const handleGenerateForTeam = () => {
    navigate(`/ai-suggestions/${teamId}`, {
      state: { team }
    });
  };

  const getProgressDisplay = (member) => {
    if (member.totalCourses === 0) {
      return <span style={styles.noActivity}>No courses</span>;
    }
    
    if (member.completedCourses === member.totalCourses) {
      return (
        <div style={styles.progressWrapper}>
          <div style={styles.completedBadge}>All Completed ✓</div>
        </div>
      );
    }
    
    const inProgressCount = member.inProgressCourses || 0;
    const notStartedCount = member.notStartedCourses || 0;
    
    if (inProgressCount === 0 && notStartedCount > 0) {
      return (
        <div style={styles.progressWrapper}>
          <div style={styles.notStartedBadge}>Not Started</div>
        </div>
      );
    }
    
    return (
      <div>
        <div style={styles.progressWrapper}>
          <div style={styles.progressTrack}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${member.averageProgress || 0}%`,
                backgroundColor: getProgressColor(member.averageProgress || 0)
              }}
            />
          </div>
          <span style={styles.progressText}>{member.averageProgress || 0}%</span>
        </div>
        <div style={styles.courseBreakdown}>
          {member.completedCourses > 0 && (
            <span style={styles.completedBadge}>{member.completedCourses} done</span>
          )}
          {inProgressCount > 0 && (
            <span style={styles.inProgressBadge}>{inProgressCount} in progress</span>
          )}
        </div>
      </div>
    );
  };

  const getMemberAvatar = (member) => {
    if (member.memberImage) {
      return <img src={member.memberImage} alt={member.memberName} style={styles.avatar} />;
    }
    return (
      <div style={member.missedSessions?.length > 0 ? styles.warningAvatar : styles.avatarPlaceholder}>
        {member.memberName?.charAt(0) || '?'}
      </div>
    );
  };

  if (!auth) {
    return (
      <div>
        <Header />
        <div style={styles.page}>
          <p style={styles.errorText}>Authentication error. Please refresh the page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div style={styles.page}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading team details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!team) {
    return (
      <>
        <Header />
        <div style={styles.page}>
          <div style={styles.notFoundContainer}>
            <p style={styles.notFoundText}>Team not found.</p>
            <button style={styles.backButton} onClick={() => navigate('/hr-teams')}>
              Back to Teams
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={styles.page}>
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.title}>{team.name}</h1>
            <p style={styles.subtitle}>Team Management Dashboard</p>
          </div>
          <button
            type="button"
            style={styles.generateButton}
            onClick={handleGenerateForTeam}
          >
            ✨ Generate Plan for Team
          </button>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{teamStats.totalMembers}</p>
            <p style={styles.statLabel}>Total Members</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{teamStats.totalCoursesCompleted}</p>
            <p style={styles.statLabel}>Courses Completed</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{teamStats.totalCoursesInProgress}</p>
            <p style={styles.statLabel}>In Progress</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{teamStats.totalHoursCompleted}</p>
            <p style={styles.statLabel}>Hours Completed</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{teamStats.averageProgress}%</p>
            <p style={styles.statLabel}>Avg Progress</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{teamStats.completionRate}%</p>
            <p style={styles.statLabel}>Completion Rate</p>
          </div>
        </div>

        {/* Team Monthly Performance Graph powered by Graph Data */}
        <TeamMonthlyPerformance stats={graphData} />

        {/* Members Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h2 style={styles.sectionTitle}>Team Members</h2>
          </div>

          {membersData.length === 0 ? (
            <div style={styles.emptyCard}>
              <p>No members in this team yet.</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell}>Member</th>
                    <th style={styles.tableHeaderCell}>Role</th>
                    <th style={styles.tableHeaderCell}>Hours Completed</th>
                    <th style={styles.tableHeaderCell}>Courses</th>
                    <th style={styles.tableHeaderCell}>Progress</th>
                    <th style={styles.tableHeaderCell}>Recent Activity</th>
                    <th style={styles.tableHeaderCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {membersData.map((member) => (
                    <tr key={member.memberId} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div style={styles.memberInfo}>
                          {getMemberAvatar(member)}
                          <div>
                            <div style={styles.memberName}>{member.memberName}</div>
                            <div style={styles.memberEmail}>{member.memberEmail}</div>
                            {member.missedSessions?.length > 0 && (
                              <div style={styles.missedWarning}>
                                ⚠️ {member.missedSessions.length} missed session(s)
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={getRoleStyle(member.memberRole || 'employee')}>
                          {member.memberRole === 'admin' ? 'Admin' : member.memberRole === 'manager' ? 'Manager' : 'Employee'}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={member.totalHoursCompleted < 40 ? styles.warningText : styles.successText}>
                          {Math.round(member.totalHoursCompleted || 0)} / 40 hrs
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div>
                          <span style={styles.courseCount}>{member.completedCourses || 0}</span>
                          <span style={styles.courseTotal}> / {member.totalCourses || 0}</span>
                        </div>
                        {(member.totalCourses || 0) > 0 && (member.completedCourses || 0) !== (member.totalCourses || 0) && (
                          <div style={styles.remainingText}>
                            {(member.totalCourses || 0) - (member.completedCourses || 0)} remaining
                          </div>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {getProgressDisplay(member)}
                      </td>
                      <td style={styles.tableCell}>
                        {member.recentCompletions?.length > 0 ? (
                          <div style={styles.recentActivity}>
                            <span style={styles.recentBadge}>
                              {member.recentCompletions.length} completed
                            </span>
                            <span style={styles.recentDate}>
                              in last 30 days
                            </span>
                          </div>
                        ) : (
                          <span style={styles.noActivity}>No recent activity</span>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          type="button"
                          style={styles.suggestionButton}
                          onClick={() => handleGenerateForMember(member.memberId)}
                          title="Generate AI Suggestions"
                        >
                          Generate suggestions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Missed Sessions Section */}
        {missedSessions.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIconWarning}></div>
              <h2 style={styles.sectionTitleWarning}>Missed Sessions</h2>
            </div>
            <div style={styles.missedSessionsContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell}>Member</th>
                    <th style={styles.tableHeaderCell}>Course</th>
                    <th style={styles.tableHeaderCell}>Session Date</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {missedSessions.slice(0, 10).map((session, idx) => (
                    <tr key={idx} style={styles.missedSessionRow}>
                      <td style={styles.tableCell}>
                        <div style={styles.memberInfo}>
                          <div style={styles.warningAvatar}>
                            {session.memberName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div style={styles.memberName}>{session.memberName}</div>
                            <div style={styles.memberEmail}>{session.memberEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.courseName}>{session.courseTitle}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.missedDate}>
                          {session.sessionDateFormatted || 'Date not available'}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.missedBadge}>Missed</span>
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          type="button"
                          style={styles.notifyButton}
                          onClick={() => handleGenerateForMember(session.memberId)}
                        >
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {missedSessions.length > 10 && (
                <div style={styles.showMoreContainer}>
                  <button style={styles.showMoreButton}>
                    Show All ({missedSessions.length} missed sessions)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Course Completions Section */}
        {recentCompletions.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}></div>
              <h2 style={styles.sectionTitle}>Recent Course Completions</h2>
            </div>
            <div style={styles.recentGrid}>
              {recentCompletions.slice(0, 6).map((completion, idx) => (
                <div key={idx} style={styles.recentCard}>
                  <div style={styles.recentCardHeader}>
                    <div style={styles.recentIcon}>✓</div>
                    <div style={styles.recentInfo}>
                      <h4 style={styles.recentCourseTitle}>
                        {completion.courseTitle || 'Untitled Course'}
                      </h4>
                      <p style={styles.recentMemberName}>{completion.memberName}</p>
                    </div>
                  </div>
                  <div style={styles.recentCardFooter}>
                    <span style={styles.recentDate}>
                      Completed: {completion.completedDateFormatted || new Date(completion.completedAt).toLocaleDateString()}
                    </span>
                    {completion.courseHours && (
                      <span style={styles.recentHours}>
                        {completion.courseHours} hours
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {recentCompletions.length > 6 && (
              <div style={styles.showMoreContainer}>
                <button style={styles.showMoreButton}>
                  Show All ({recentCompletions.length} completions)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

const getRoleStyle = (role) => {
  switch(role) {
    case 'admin': return styles.adminBadge;
    case 'manager': return styles.managerBadge;
    default: return styles.employeeBadge;
  }
};

const getProgressColor = (progress) => {
  if (progress >= 75) return '#10b981';
  if (progress >= 50) return '#f59e0b';
  if (progress >= 25) return '#f58220';
  return '#ef4444';
};

const styles = {
  page: {
    backgroundColor: '#f7f9fc',
    minHeight: '100vh',
    padding: '30px 40px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
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
  },
  notFoundContainer: {
    textAlign: 'center',
    padding: '60px 40px',
  },
  notFoundText: {
    fontSize: '18px',
    color: '#64748b',
    marginBottom: '20px',
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#1a2c3e',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7a8a',
    margin: 0,
  },
  generateButton: {
    backgroundColor: '#f58220',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e8edf2',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a2c3e',
    margin: '0 0 8px 0',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#8a99a8',
    margin: 0,
    letterSpacing: '0.5px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  sectionIcon: {
    width: '4px',
    height: '24px',
    backgroundColor: '#f58220',
    borderRadius: '2px',
  },
  sectionIconWarning: {
    width: '4px',
    height: '24px',
    backgroundColor: '#dc2626',
    borderRadius: '2px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#000000',
    margin: 0,
  },
  sectionTitleWarning: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#dc2626',
    margin: 0,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center',
    border: '1px solid #e8edf2',
    color: '#64748b',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e8edf2',
    overflow: 'auto',
  },
  missedSessionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #fee2e2',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1000px',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e8edf2',
  },
  tableHeaderCell: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#000000',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid #f0f2f5',
  },
  missedSessionRow: {
    borderBottom: '1px solid #fee2e2',
  },
  tableCell: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#4a5a6a',
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f58220',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '16px',
  },
  warningAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '16px',
  },
  memberName: {
    fontWeight: '600',
    color: '#1a2c3e',
    marginBottom: '4px',
  },
  memberEmail: {
    fontSize: '12px',
    color: '#8a99a8',
  },
  missedWarning: {
    fontSize: '11px',
    color: '#dc2626',
    marginTop: '4px',
    fontWeight: '500',
  },
  adminBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  managerBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  employeeBadge: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  warningText: {
    color: '#e53e3e',
    fontWeight: '600',
  },
  successText: {
    color: '#38a169',
    fontWeight: '600',
  },
  courseCount: {
    fontWeight: '700',
    color: '#1a2c3e',
    fontSize: '16px',
  },
  courseTotal: {
    color: '#8a99a8',
    fontSize: '14px',
  },
  remainingText: {
    fontSize: '11px',
    color: '#8a99a8',
    marginTop: '2px',
  },
  progressWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  progressTrack: {
    flex: 1,
    height: '6px',
    backgroundColor: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
  },
  progressText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#4a5a6a',
    minWidth: '45px',
  },
  courseBreakdown: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '6px',
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    display: 'inline-block',
  },
  inProgressBadge: {
    backgroundColor: '#fed7aa',
    color: '#9c4221',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    display: 'inline-block',
  },
  notStartedBadge: {
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    display: 'inline-block',
  },
  missedBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  courseName: {
    fontWeight: '500',
    color: '#1a2c3e',
  },
  missedDate: {
    color: '#dc2626',
    fontWeight: '500',
  },
  recentActivity: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  recentBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block',
    width: 'fit-content',
    textAlign: 'center', 
  },
  recentDate: {
    fontSize: '11px',
    color: '#8a99a8',
    textAlign: 'center', 
  },
  noActivity: {
    fontSize: '12px',
    color: '#8a99a8',
    fontStyle: 'italic',
  },
  suggestionButton: {
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  notifyButton: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  recentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '16px',
  },
  recentCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e8edf2',
  },
  recentCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  recentIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  recentInfo: {
    flex: 1,
  },
  recentCourseTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a2c3e',
    margin: '0 0 4px 0',
  },
  recentMemberName: {
    fontSize: '12px',
    color: '#8a99a8',
    margin: 0,
  },
  recentCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid #f0f2f5',
  },
  recentHours: {
    fontSize: '11px',
    color: '#6b7a8a',
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#f58220',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  showMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  showMoreButton: {
    backgroundColor: 'transparent',
    color: '#f58220',
    border: '1px solid #f58220',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorText: {
    color: '#b91c1c',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
  },
  timeRangeButtons: {
    display: 'flex',
    gap: '8px',
    marginLeft: 'auto',
  },
  timeButton: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  graphCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e8edf2',
  },
  graphContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '280px',
    marginBottom: '20px',
    gap: '8px',
  },
  barGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  barContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    height: '240px',
  },
  bar: {
    width: '10px',
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.3s ease',
  },
  barLabel: {
    fontSize: '12px',
    color: '#8a99a8',
    margin: 0,
    fontWeight: '500',
  },
  graphLegend: {
    display: 'flex',
    gap: '24px',
    fontSize: '12px',
    color: '#6b7a8a',
  },
  legendDot: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    marginRight: '6px',
    verticalAlign: 'middle',
  },
};

export default MyTeam;