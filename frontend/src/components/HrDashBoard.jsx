import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Header from './HRheader';
import { useAuth } from '../context/AuthContext';
import HRNotifyModal from './HRNotifyModal';

const API_BASE = 'http://localhost:5000';

function getId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
}

function AdminDashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const isHR = auth?.isHR || false;
  const mongoUser = auth?.mongoUser || null;
  const currentUser = auth?.currentUser || null;
  const loading = auth?.loading || false;

  const [adminStats, setAdminStats] = useState([
    { title: '0', subtitle: 'TOTAL USERS', path: '/hr-employees', clickable: true },
    { title: '0', subtitle: 'ACTIVE TEAMS', path: '/hr-teams', clickable: true },
    { title: '0', subtitle: 'TEAM MANAGERS', path: '/hr-managers', clickable: true },
    { title: '0', subtitle: 'TOTAL COURSES', clickable: false },
    { title: '0%', subtitle: 'COMPLETION RATE', clickable: false },
    { title: '0', subtitle: 'PENDING REQUESTS', path: '/admin/pending-requests', clickable: false }
  ]);
  
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notifyStatus, setNotifyStatus] = useState({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [showAll, setShowAll] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState(null);

  const adminActions = [
    { name: 'Create User', description: 'Add new employees to the platform', path: '/admin/create-user' },
    { name: 'Create Team', description: 'Form new teams', path: '/admin/create-team' },
    { name: 'Add Manager to Team', description: 'Assign managers to oversee teams', path: '/admin/add-manager-to-team' },
    { name: 'Manage Job Description', description: 'Manage employees job description', path: '/admin/manage-job-description'},
    { name: 'Manage Courses', description: 'Manage available courses', path: '/admin/manage-courses' },
  ];


  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const currentCompanyId = getId(mongoUser?.company_id);
      const response = await fetch(`${API_BASE}/api/admin/stats?companyId=${currentCompanyId}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      
      setAdminStats([
        { title: data.totalUsers.toLocaleString(), subtitle: 'TOTAL USERS', path: '/hr-employees', clickable: true },
        { title: data.totalTeams.toLocaleString(), subtitle: 'ACTIVE TEAMS', path: '/hr-teams', clickable: true },
        { title: data.totalManagers.toLocaleString(), subtitle: 'TEAM MANAGERS', path: '/hr-managers', clickable: true },
        { title: data.totalCourses.toLocaleString(), subtitle: 'TOTAL COURSES', path: '/admin/courses', clickable: true },
        { title: `${data.completionRate}%`, subtitle: 'COMPLETION RATE', clickable: false },
        { title: data.pendingRequests.toLocaleString(), subtitle: 'PENDING REQUESTS', path: '/admin/pending-requests', clickable: true }
      ]);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    }
  };

  // Fetch inactive users from API
  const fetchInactiveUsers = async () => {
    try {
      const currentCompanyId = getId(mongoUser?.company_id);
      const currentYear = new Date().getFullYear();
      const response = await fetch(`${API_BASE}/api/admin/inactive-users?year=${currentYear}&companyId=${currentCompanyId}`);
      if (!response.ok) throw new Error('Failed to fetch inactive users');
      const data = await response.json();
      setInactiveUsers(data);
      // Reset view when new data arrives
      setShowAll(false);
      setVisibleCount(5);
    } catch (err) {
      console.error('Error fetching inactive users:', err);
      setInactiveUsers([]);
    }
  };

  useEffect(() => {
    if (loading) {
      setPageLoading(true);
      return;
    }

    if (!currentUser || !isHR) {
      setPageLoading(false);
      return;
    }

    const fetchData = async () => {
      setPageLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchInactiveUsers()
      ]);
      setPageLoading(false);
    };

    fetchData();
  }, [loading, currentUser, isHR, mongoUser?.company_id]);

  // Update displayed users based on showAll or visibleCount
  useEffect(() => {
    if (showAll) {
      setDisplayedUsers(inactiveUsers);
    } else {
      setDisplayedUsers(inactiveUsers.slice(0, visibleCount));
    }
  }, [inactiveUsers, showAll, visibleCount]);

  const handleStatClick = (stat) => {
    if (stat.clickable && stat.path) {
      navigate(stat.path);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === displayedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(displayedUsers.map(user => user.id));
    }
  };

  const handleShowMore = () => {
    if (showAll) {
      // If showing all, collapse to show only 5
      setShowAll(false);
      setVisibleCount(5);
    } else {
      // If not showing all, check if there are more users to show
      if (visibleCount + 5 >= inactiveUsers.length) {
        // Show all remaining users
        setShowAll(true);
      } else {
        // Show 5 more
        setVisibleCount(prev => prev + 5);
      }
    }
  };

  const handleNotifyUsers = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to notify');
      return;
    }
    const selected = displayedUsers.filter(u => selectedUsers.includes(u.id));
    setNotifyTarget({
      users: selected,
      managerId: null  // For bulk notifications, we won't target managers, but this can be extended if needed
    });
  };

  const handleNotifySingleUser = (user) => {
    setNotifyTarget({
      users: [user],
      managerId: user.managerId || null
    });
  };

  if (loading || pageLoading) {
    return (
      <div>
        <Header />
        <div style={styles.page}>
          <p style={styles.infoText}>Loading dashboard data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentUser || !isHR) {
    navigate('/login');
    return null;
  }

  const currentYear = new Date().getFullYear();
  const usersWithZeroTrainings = inactiveUsers.filter(u => u.trainingsCompleted === 0).length;
  const totalTrainingsMissed = inactiveUsers.reduce((sum, u) => sum + (5 - u.trainingsCompleted), 0);
  const hasMoreUsers = !showAll && visibleCount < inactiveUsers.length;
  const isShowingAll = showAll || visibleCount >= inactiveUsers.length;

  return (
    <div>
      <Header />
      <div style={styles.page}>
        {/* Header Section */}
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.title}>
              Human Resources <span style={styles.titleAccent}>Dashboard</span>
            </h1>
            <p style={styles.subtitle}>System overview and management controls</p>
          </div>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {adminStats.map((stat, index) => (
            <div 
              key={index} 
              style={{
                ...styles.statCard,
                cursor: stat.clickable ? 'pointer' : 'default',
              }}
              onClick={() => handleStatClick(stat)}
              className={stat.clickable ? 'stat-card-clickable' : ''}
            >
              <p style={styles.statTitle}>{stat.title}</p>
              <p style={styles.statSubtitle}>{stat.subtitle}</p>
              {stat.clickable && (
                <div style={styles.clickIndicator}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* Admin Actions Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h2 style={styles.sectionTitle}>Administrative Tools</h2>
          </div>
          <div style={styles.actionsGrid}>
            {adminActions.map((action, index) => (
              <div key={index} style={styles.actionCard}>
                <div style={styles.actionContent}>
                  <h3 style={styles.actionTitle}>{action.name}</h3>
                  <p style={styles.actionDescription}>{action.description}</p>
                </div>
                <button 
                  onClick={() => navigate(action.path)}
                  style={styles.actionButton}
                >
                  Access →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive Users Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h2 style={styles.sectionTitle}>Users with no trainings in {currentYear}</h2>
          </div>
          
          <div style={styles.inactiveUsersContainer}>
            <div style={styles.inactiveUsersHeader}>
              <div style={styles.headerLeft}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === displayedUsers.length && displayedUsers.length > 0}
                    onChange={handleSelectAll}
                    style={styles.checkbox}
                  />
                  Select All ({displayedUsers.length} users)
                </label>
              </div>
              <button
                onClick={handleNotifyUsers}
                style={{
                  ...styles.notifyButton,
                  opacity: selectedUsers.length === 0 ? 0.6 : 1,
                  cursor: selectedUsers.length === 0 ? 'not-allowed' : 'pointer'
                }}
                disabled={selectedUsers.length === 0}
              >
                Notify Selected ({selectedUsers.length})
              </button>
            </div>

            <div style={styles.userTable}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell} width="50">Select</th>
                    <th style={styles.tableHeaderCell}>User</th>
                    <th style={styles.tableHeaderCell}>Department</th>
                    <th style={styles.tableHeaderCell}>Last Training</th>
                    <th style={styles.tableHeaderCell}>Trainings ({currentYear})</th>
                    <th style={styles.tableHeaderCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((user) => (
                    <tr key={user.id} style={styles.tableRow}>
                      <td style={styles.tableCell} align="center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          style={styles.checkbox}
                        />
                      </td>
                      <td style={styles.tableCell}>
                        <div>
                          <div style={styles.userName}>{user.name}</div>
                          <div style={styles.userEmail}>{user.email}</div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>{user.department}</td>
                      <td style={styles.tableCell}>{user.lastTraining}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.trainingBadge,
                          backgroundColor: user.trainingsCompleted === 0 ? '#fee2e2' : '#fef3c7',
                          color: user.trainingsCompleted === 0 ? '#dc2626' : '#d97706'
                        }}>
                          {user.trainingsCompleted} completed
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {notifyStatus[user.id] === 'sending' && (
                          <span style={styles.sendingStatus}>Sending...</span>
                        )}
                        {notifyStatus[user.id] === 'sent' && (
                          <span style={styles.sentStatus}>Sent ✓</span>
                        )}
                        {!notifyStatus[user.id] && (
                          <button
                            onClick={() => handleNotifySingleUser(user)}
                            style={styles.singleNotifyButton}
                          >
                            Notify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {displayedUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={styles.emptyCell}>
                        All employees have their required trainings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Show More Button */}
            {inactiveUsers.length > 5 && (
              <div style={styles.showMoreContainer}>
                <button
                  onClick={handleShowMore}
                  style={styles.showMoreButton}
                >
                  {showAll ? 'Show Less' : hasMoreUsers ? `Show More (${inactiveUsers.length - visibleCount} remaining)` : 'Show All'}
                </button>
                {!showAll && !hasMoreUsers && !isShowingAll && (
                  <button
                    onClick={() => setShowAll(true)}
                    style={styles.showMoreButton}
                  >
                    Show All ({inactiveUsers.length} total)
                  </button>
                )}
                {showAll && (
                  <div style={styles.showingAllText}>
                    Showing all {inactiveUsers.length} users
                  </div>
                )}
              </div>
            )}

            {inactiveUsers.length > 0 && (
              <div style={styles.inactiveUsersFooter}>
                <div style={styles.summaryStats}>
                  <span>Total inactive: <strong>{usersWithZeroTrainings}</strong> users with zero trainings</span>
                  <span style={styles.summarySeparator}>•</span>
                  <span>Total trainings missed: <strong>{totalTrainingsMissed}</strong></span>
                  <span style={styles.summarySeparator}>•</span>
                  <span>Showing: <strong>{displayedUsers.length}</strong> of <strong>{inactiveUsers.length}</strong> users</span>
                </div>
              </div>
            )}
          </div>
        </div>

        
      </div>
      <Footer />
      {notifyTarget && (
        <HRNotifyModal
          targetUsers={notifyTarget.users}
          onClose={() => setNotifyTarget(null)}
          onSent={() => {
            setNotifyTarget(null);
            setSelectedUsers([]);
          }}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#f7f9fc',
    minHeight: '100vh',
    padding: '0px 0px 0px 30px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
  },

  headerSection: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#1a2c3e',
    marginBottom: '8px',
    letterSpacing: '-0.02em'
  },

  titleAccent: {
    color: '#f58220',
    background: 'linear-gradient(135deg, #f58220 0%, #f59e0b 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: '#f58220'
  },

  subtitle: {
    fontSize: '14px',
    color: '#6b7a8a',
    margin: 0
  },

  infoText: {
    textAlign: 'center',
    color: '#6b7a8a',
    padding: '40px'
  },

  errorText: {
    color: '#b91c1c',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
    marginBottom: '40px'
  },

  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e8edf2',
    transition: 'all 0.2s ease',
    position: 'relative'
  },

  statTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a2c3e',
    margin: '0 0 8px 0'
  },

  statSubtitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#8a99a8',
    margin: 0,
    letterSpacing: '0.5px'
  },

  clickIndicator: {
    position: 'absolute',
    bottom: '12px',
    right: '16px',
    fontSize: '14px',
    color: '#8a99a8',
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },

  section: {
    marginBottom: '40px'
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },

  sectionIcon: {
    width: '4px',
    height: '24px',
    backgroundColor: '#f58220',
    borderRadius: '2px'
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#000000',
    margin: 0
  },

  inactiveUsersContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e8edf2',
    overflow: 'hidden'
  },

  inactiveUsersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e8edf2'
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4a5a6a',
    cursor: 'pointer'
  },

  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },

  notifyButton: {
    backgroundColor: '#f58220',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },

  userTable: {
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  tableHeader: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e8edf2'
  },

  tableHeaderCell: {
    padding: '16px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#000000',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },

  tableRow: {
    borderBottom: '1px solid #f0f2f5',
    transition: 'background-color 0.2s ease'
  },

  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: '#4a5a6a'
  },

  userName: {
    fontWeight: '600',
    color: '#1a2c3e',
    marginBottom: '4px'
  },

  userEmail: {
    fontSize: '12px',
    color: '#8a99a8'
  },

  trainingBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },

  singleNotifyButton: {
    backgroundColor: '#f58220',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },

  sendingStatus: {
    fontSize: '12px',
    color: '#f59e0b',
    fontWeight: '500'
  },

  sentStatus: {
    fontSize: '12px',
    color: '#10b981',
    fontWeight: '500'
  },

  showMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e8edf2',
    gap: '12px'
  },

  showMoreButton: {
    backgroundColor: '#ffffff',
    color: '#f58220',
    border: '1px solid #e8edf2',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  showingAllText: {
    fontSize: '12px',
    color: '#6b7a8a',
    fontStyle: 'italic'
  },

  inactiveUsersFooter: {
    padding: '16px 20px',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e8edf2'
  },

  summaryStats: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#6b7a8a',
    flexWrap: 'wrap'
  },

  summarySeparator: {
    color: '#d1d5db'
  },

  actionHighlight: {
    color: '#000000',
    fontWeight: '500'
  },

  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#ffffff'
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },

  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e8edf2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },

  actionContent: {
    flex: 1
  },

  actionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a2c3e',
    marginBottom: '6px'
  },

  actionDescription: {
    fontSize: '13px',
    color: '#8a99a8',
    margin: 0
  },

  actionButton: {
    backgroundColor: 'transparent',
    border: '1px solid #e8edf2',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#f58220',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginLeft: '16px'
  },

  activityTable: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e8edf2',
    overflow: 'hidden'
  },

  emptyCell: {
    padding: '40px',
    textAlign: 'center',
    color: '#8a99a8'
  }
};

// Hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .stat-card-clickable {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .stat-card-clickable:hover {
    background-color: #f0f2f5;
    border-color: #d1d5db;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  .stat-card-clickable:hover .click-indicator {
    opacity: 1;
  }
  
  .action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  .action-button:hover {
    background-color: #f58220;
    color: #ffffff;
    border-color: #f58220;
  }
  
  .table-row:hover {
    background-color: #f9fafb;
  }
  
  .single-notify-button:hover {
    background-color: #e06e1a;
  }
  
  .notify-button:hover {
    background-color: #e06e1a;
  }
  
  .show-more-button:hover {
    background-color: #f58220;
    color: #ffffff;
    border-color: #f58220;
  }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;