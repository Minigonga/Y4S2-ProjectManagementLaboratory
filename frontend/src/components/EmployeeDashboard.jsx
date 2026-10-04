import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

function ManagerDashboard() {
  const navigate = useNavigate();
  const { currentUser, mongoUser } = useAuth();
  const [timeRange, setTimeRange] = useState(12);
  
  // State for API data
  const [teamStats, setTeamStats] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTeam, setUserTeam] = useState(null);

  // Fetch team data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Using dummy data for testing (will be replaced with real API calls)
        setTeamStats({
          totalHoursDone: 133,
          totalHoursAssigned: 200,
          avgSatisfaction: 4.3,
          missedCount: 2,
          completionRate: 66,
          teamSize: 5,
          missedTrainings: []
        });

        setTeamMembers([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            hoursDone: 28,
            hoursAssigned: 40,
            progress: 70,
            satisfaction: 4.5,
            completedCourses: 3,
            totalEnrollments: 4
          },
          {
            id: '2',
            name: 'Sarah Smith',
            email: 'sarah@example.com',
            hoursDone: 35,
            hoursAssigned: 40,
            progress: 87,
            satisfaction: 4.8,
            completedCourses: 4,
            totalEnrollments: 4
          },
          {
            id: '3',
            name: 'Michael Johnson',
            email: 'michael@example.com',
            hoursDone: 15,
            hoursAssigned: 40,
            progress: 37,
            satisfaction: 3.2,
            completedCourses: 1,
            totalEnrollments: 4
          },
          {
            id: '4',
            name: 'Emily Chen',
            email: 'emily@example.com',
            hoursDone: 40,
            hoursAssigned: 40,
            progress: 100,
            satisfaction: 4.9,
            completedCourses: 5,
            totalEnrollments: 5
          },
          {
            id: '5',
            name: 'David Brown',
            email: 'david@example.com',
            hoursDone: 15,
            hoursAssigned: 40,
            progress: 37,
            satisfaction: 3.5,
            completedCourses: 2,
            totalEnrollments: 4
          }
        ]);

        setMonthlyMetrics([
          { month: 'Jan', hoursDone: 45, hoursAssigned: 100, satisfaction: 3.8 },
          { month: 'Feb', hoursDone: 52, hoursAssigned: 100, satisfaction: 3.9 },
          { month: 'Mar', hoursDone: 58, hoursAssigned: 100, satisfaction: 4.0 },
          { month: 'Apr', hoursDone: 63, hoursAssigned: 120, satisfaction: 4.1 },
          { month: 'May', hoursDone: 70, hoursAssigned: 120, satisfaction: 4.2 },
          { month: 'Jun', hoursDone: 78, hoursAssigned: 120, satisfaction: 4.3 },
          { month: 'Jul', hoursDone: 85, hoursAssigned: 140, satisfaction: 4.4 },
          { month: 'Aug', hoursDone: 89, hoursAssigned: 140, satisfaction: 4.5 },
          { month: 'Sep', hoursDone: 95, hoursAssigned: 150, satisfaction: 4.6 },
          { month: 'Oct', hoursDone: 103, hoursAssigned: 150, satisfaction: 4.7 },
          { month: 'Nov', hoursDone: 110, hoursAssigned: 160, satisfaction: 4.8 },
          { month: 'Dec', hoursDone: 133, hoursAssigned: 200, satisfaction: 4.9 }
        ]);

        setUpcomingDeadlines([
          {
            course: 'Advanced Excel Skills',
            courseId: '1',
            teamMembers: [
              { name: 'Michael Johnson', email: 'michael@example.com', progress: 30 }
            ],
            dueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
            daysLeft: 13,
            urgent: true
          },
          {
            course: 'Compliance Training 2025',
            courseId: '2',
            teamMembers: [
              { name: 'Michael Johnson', email: 'michael@example.com', progress: 20 },
              { name: 'David Brown', email: 'david@example.com', progress: 15 },
              { name: 'Sarah Smith', email: 'sarah@example.com', progress: 95 }
            ],
            dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
            daysLeft: 23,
            urgent: false
          }
        ]);

        setUserTeam({ name: 'Backend Team' });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <div>
        <Header />
        <div style={styles.page}>
          <p style={{ textAlign: 'center', color: '#8a99a8' }}>Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div style={styles.page}>
          <div style={{ ...styles.errorBox }}>
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getProgressColor = (progress) => {
    if (progress === 100) return '#10b981';
    if (progress >= 50) return '#f58220';
    if (progress > 0) return '#f59e0b';
    return '#d1d5db';
  };

  const filteredMetrics = monthlyMetrics.slice(-timeRange);
  const maxHours = Math.max(
    ...filteredMetrics.map(m => Math.max(m.hoursDone, m.hoursAssigned)),
    1
  );

  return (
    <div>
      <Header />
      <div style={styles.page}>

        {/* ── Header Section ── */}
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.title}>
              Team Performance <span style={styles.titleAccent}>Dashboard</span>
            </h1>
            <p style={styles.subtitle}>
              {userTeam?.name ? `${userTeam.name} - ` : ''}Monitor your team's learning progress and training metrics
            </p>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        {teamStats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statTitle}>{teamStats.totalHoursDone}</p>
              <p style={styles.statSubtitle}>HOURS DONE</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statTitle}>{teamStats.totalHoursAssigned}</p>
              <p style={styles.statSubtitle}>HOURS ASSIGNED</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statTitle}>{teamStats.avgSatisfaction}★</p>
              <p style={styles.statSubtitle}>AVG SATISFACTION</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statTitle}>{teamStats.completionRate}%</p>
              <p style={styles.statSubtitle}>COMPLETION RATE</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statTitle}>{teamStats.missedCount}</p>
              <p style={styles.statSubtitle}>MISSED TRAININGS</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statTitle}>{teamStats.teamSize}</p>
              <p style={styles.statSubtitle}>TEAM MEMBERS</p>
            </div>
          </div>
        )}

        {/* ── Performance Graph Section ── */}
        {monthlyMetrics.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Team Performance Trends</h2>
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
                {filteredMetrics.map((metric, idx) => (
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
        )}

        {/* ── Two Column Layout ── */}
        <div style={styles.twoColGrid}>

          {/* Upcoming Deadlines */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Upcoming Deadlines</h2>
            </div>
            <div style={styles.card}>
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((deadline, i) => (
                  <div key={i} style={styles.deadlineRow}>
                    <div style={styles.deadlineLeft}>
                      <p style={styles.deadlineCourse}>{deadline.course}</p>
                      <p style={styles.deadlineTeamMembers}>
                        {deadline.teamMembers.length} team member{deadline.teamMembers.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span
                      style={{
                        ...styles.daysLeftBadge,
                        backgroundColor: deadline.urgent ? '#fee2e2' : '#fff7ed',
                        color: deadline.urgent ? '#dc2626' : '#c2410c',
                      }}
                    >
                      {deadline.daysLeft}d
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ padding: '20px', color: '#8a99a8' }}>No upcoming deadlines</p>
              )}
            </div>
          </div>

          {/* Team Performance Summary */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon} />
              <h2 style={styles.sectionTitle}>Quick Stats</h2>
            </div>
            <div style={styles.card}>
              {teamStats && (
                <div style={{ padding: '20px' }}>
                  <div style={styles.quickStatRow}>
                    <span>Team Size</span>
                    <strong>{teamStats.teamSize} members</strong>
                  </div>
                  <div style={styles.quickStatRow}>
                    <span>Completion Rate</span>
                    <strong>{teamStats.completionRate}%</strong>
                  </div>
                  <div style={styles.quickStatRow}>
                    <span>Avg Satisfaction</span>
                    <strong>{teamStats.avgSatisfaction}★</strong>
                  </div>
                  <div style={styles.quickStatRow}>
                    <span>Pending Courses</span>
                    <strong>{teamStats.missedCount}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Team Members Section ── */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Team Members Performance</h2>
          </div>
          <div style={styles.card}>
            {teamMembers.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell}>Name</th>
                    <th style={styles.tableHeaderCell}>Hours Done</th>
                    <th style={styles.tableHeaderCell}>Hours Assigned</th>
                    <th style={styles.tableHeaderCell}>Progress</th>
                    <th style={styles.tableHeaderCell}>Satisfaction</th>
                    <th style={styles.tableHeaderCell}>Courses</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div>
                          <div style={styles.userName}>{member.name}</div>
                          <div style={styles.userEmail}>{member.email}</div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>{member.hoursDone}h</td>
                      <td style={styles.tableCell}>{member.hoursAssigned}h</td>
                      <td style={styles.tableCell}>
                        <div style={styles.progressBarSmall}>
                          <div
                            style={{
                              ...styles.progressBarFill,
                              width: `${member.progress}%`,
                              backgroundColor: getProgressColor(member.progress),
                            }}
                          />
                        </div>
                        <span style={styles.progressText}>{member.progress}%</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.satisfactionBadge}>{member.satisfaction}★</span>
                      </td>
                      <td style={styles.tableCell}>{member.completedCourses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: '20px', color: '#8a99a8' }}>No team members found</p>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = {
  page: {
    backgroundColor: '#f7f9fc',
    minHeight: '100vh',
    padding: '30px 40px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '20px',
    color: '#dc2626',
  },
  headerSection: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#1a2c3e',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  titleAccent: {
    color: '#f58220',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7a8a',
    margin: 0,
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
  },
  statTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a2c3e',
    margin: '0 0 8px 0',
  },
  statSubtitle: {
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
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#000000',
    margin: 0,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e8edf2',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e8edf2',
  },
  tableHeaderCell: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#000000',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid #f0f2f5',
    transition: 'background-color 0.2s ease',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: '#4a5a6a',
  },
  userName: {
    fontWeight: '600',
    color: '#1a2c3e',
    marginBottom: '4px',
  },
  userEmail: {
    fontSize: '12px',
    color: '#8a99a8',
  },
  twoColGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  deadlineRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f0f2f5',
  },
  deadlineLeft: {
    flex: 1,
  },
  deadlineCourse: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a2c3e',
    margin: '0 0 4px 0',
  },
  deadlineTeamMembers: {
    fontSize: '12px',
    color: '#8a99a8',
    margin: 0,
  },
  daysLeftBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  quickStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f0f2f5',
    fontSize: '14px',
  },
  progressBarSmall: {
    backgroundColor: '#f0f2f5',
    borderRadius: '999px',
    height: '4px',
    overflow: 'hidden',
    marginBottom: '4px',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '999px',
  },
  progressText: {
    fontSize: '11px',
    color: '#8a99a8',
    fontWeight: '600',
  },
  satisfactionBadge: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
};

export default ManagerDashboard;
