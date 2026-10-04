import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import HRHeader from './HRheader';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

function getId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
}

function HREmployeesPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const isHR = auth?.isHR || false;
  const mongoUser = auth?.mongoUser || null;
  const currentUser = auth?.currentUser || null;
  const loading = auth?.loading || false;

  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDeleteUser = async (userId) => {
    if (userId === getId(mongoUser?._id)) {
      alert('You cannot delete your own user.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to delete user.');
      }

      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const fetchUsers = async () => {
    setPageLoading(true);
    setError('');

    try {
      // Using detailed=true to get populated job_id and teams
      const usersUrl = `${API_BASE}/api/usersP?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(debouncedSearchTerm)}&detailed=true`;
      const usersRes = await fetch(usersUrl);

      if (!usersRes.ok) {
        throw new Error('Failed to fetch employees data.');
      }

      const usersData = await usersRes.json();

      if (usersData.users) {
        setUsers(Array.isArray(usersData.users) ? usersData.users : []);
        setCurrentPage(usersData.currentPage || 1);
        setTotalPages(usersData.totalPages || 1);
        setTotalUsers(usersData.totalUsers || 0);
      } else {
        setUsers(Array.isArray(usersData) ? usersData : []);
        setTotalPages(1);
        setTotalUsers(Array.isArray(usersData) ? usersData.length : 0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Unable to load employees data.');
    } finally {
      setPageLoading(false);
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

    fetchUsers();
  }, [loading, currentUser, isHR, currentPage, debouncedSearchTerm]);

  const rows = useMemo(() => {
    const currentCompanyId = getId(mongoUser?.company_id);
  
    const usersInCompany = users.filter((user) => {
      if (!currentCompanyId) return true;
      return getId(user.company_id) === currentCompanyId;
    });
  
    return usersInCompany.map((user) => {
      return {
        id: user._id,
        name: user.name || 'Unnamed user',
        role: user.role || 'employee',
        email: user.email || 'No email',
        imageUrl: user.image_url || '',
        team: user.teams && user.teams.length > 0 ? user.teams : ['Unassigned'],
        jobTitle: user.job_id?.title || 'Not assigned',
        linkedInUrl: user.linkedIn_url || '',
        firebaseUid: user.firebase_uid || '',
      };
    });
  }, [users, mongoUser?.company_id]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading || pageLoading) {
    return (
      <div>
        <HRHeader />
        <div style={styles.page}>
          <p style={styles.infoText}>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!auth) {
    return (
      <div>
        <HRHeader />
        <div style={styles.page}>
          <p style={styles.errorText}>Authentication error. Please refresh the page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isHR) {
    return <Navigate to="/my-trainings" replace />;
  }

  return (
    <div>
      <HRHeader />
      <div style={styles.page}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Company Employees</h1>
        </div>

        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                style={styles.clearButton}
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          <div style={styles.statsContainer}>
            <span style={styles.statsText}>
              Showing {rows.length} of {totalUsers} employees
            </span>
          </div>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        {!error && (
          <>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCellCentered}>Name</th>
                    <th style={styles.tableHeaderCellCentered}>Email</th>
                    <th style={styles.tableHeaderCellCentered}>Role</th>
                    <th style={styles.tableHeaderCellCentered}>Job Title</th>
                    <th style={styles.tableHeaderCell}>Team</th>
                    <th style={styles.tableHeaderCellCentered}>LinkedIn</th>
                    <th style={styles.tableHeaderCellCentered}>Action</th>
                  </tr>
                </thead>
                
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} style={styles.tableRow}>
                      <td style={styles.tableCellCentered}>
                        <Link
                          to={`/profile/${row.id}`}
                          style={styles.clickableUser}
                        >
                          {row.imageUrl && (
                            <img
                              src={row.imageUrl}
                              alt={row.name}
                              style={styles.avatar}
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <span>{row.name}</span>
                        </Link>
                      </td>
                      <td style={styles.tableCellCentered}>{row.email}</td>
                      <td style={styles.tableCellCentered}>
                        <span style={getRoleStyle(row.role)}>
                          {row.role === 'admin' ? 'Admin' : row.role === 'manager' ? 'Manager' : row.role === 'hr' ? 'HR' : 'Employee'}
                        </span>
                      </td>
                      <td style={styles.tableCellCentered}>
                        <span style={styles.jobBadge}>
                          {row.jobTitle}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.teamList}>
                          {row.team.map((teamName, index) => (
                            teamName !== 'Unassigned' ? (
                              <span key={index} style={styles.teamTag}>
                                {teamName}
                              </span>
                            ) : (
                              <span key={index} style={styles.unassignedText}>
                                Unassigned
                              </span>
                            )
                          ))}
                        </div>
                      </td>
                      <td style={styles.tableCellCentered}>
                        {row.linkedInUrl ? (
                          <a
                            href={row.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.linkedInLink}
                          >
                            <span style={styles.linkedInIcon}>in</span>
                          </a>
                        ) : (
                          <span style={styles.noDataText}>—</span>
                        )}
                      </td>
                      <td style={styles.tableCellCentered}>
                        <div style={styles.actionButtonsCentered}>
                          <button
                            type="button"
                            style={styles.editButton}
                            onClick={() => navigate(`/admin/edit-user/${row.id}`)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            style={styles.deleteButton}
                            onClick={() => handleDeleteUser(row.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} style={styles.emptyCell}>
                        {searchTerm ? 'No employees found matching your search.' : 'No employees found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <button
                  style={styles.paginationButton}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div style={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      style={{
                        ...styles.pageNumberButton,
                        ...(pageNum === currentPage ? styles.activePageButton : {})
                      }}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button
                  style={styles.paginationButton}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

const getRoleStyle = (role) => {
  switch(role) {
    case 'admin':
      return styles.adminBadge;
    case 'manager':
      return styles.managerBadge;
    case 'hr':
      return styles.hrBadge;
    default:
      return styles.employeeBadge;
  }
};

const styles = {
  page: {
    backgroundColor: '#f7f9fc',
    minHeight: '100vh',
    padding: '30px 40px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    color: '#1a2c3e',
    fontSize: '32px',
    fontWeight: 600,
    letterSpacing: '-0.02em'
  },
  searchSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
    maxWidth: '400px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 36px 10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#000',
    backgroundColor: '#fff'
  },
  clearButton: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    fontSize: '14px',
    padding: '4px',
  },
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  statsText: {
    fontSize: '14px',
    color: '#6b7280',
  },
  infoText: {
    color: '#475569',
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px',
  },
  errorText: {
    color: '#b91c1c',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
  },
  tableContainer: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1100px',
  },
  tableHeader: {
    background: '#f8fafc',
  },
  tableHeaderCell: {
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#334155',
    fontWeight: 600,
  },
  tableHeaderCellCentered: {
    textAlign: 'center',
    padding: '14px 16px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#334155',
    fontWeight: 600,
  },
  tableRow: {
    borderTop: '1px solid #f1f5f9',
  },
  tableCell: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#1f2937',
    textAlign: 'left',
  },
  tableCellCentered: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#1f2937',
    textAlign: 'center',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  clickableUser: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'inherit',
    textDecoration: 'none',
  },
  adminBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
  },
  hrBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
  },
  managerBadge: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
  },
  employeeBadge: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
  },
  jobBadge: {
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block',
  },
  teamList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    alignItems: 'center',
  },
  teamTag: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    display: 'inline-block',
  },
  unassignedText: {
    color: '#9ca3af',
    fontSize: '12px',
    fontStyle: 'italic',
  },
  actionButtonsCentered: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  editButton: {
    border: 'none',
    background: '#f58220',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '12px',
  },
  deleteButton: {
    border: 'none',
    background: '#dc2626',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '12px',
  },
  emptyCell: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
    padding: '16px',
  },
  paginationButton: {
    border: '1px solid #d1d5db',
    background: '#ffffff',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  pageNumbers: {
    display: 'flex',
    gap: '8px',
  },
  pageNumberButton: {
    border: '1px solid #d1d5db',
    background: '#ffffff',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  activePageButton: {
    background: '#f58220',
    color: '#ffffff',
    borderColor: '#f58220',
  },
  linkedInLink: {
    textDecoration: 'none',
  },
  linkedInIcon: {
    display: 'inline-block',
    backgroundColor: '#0a66c2',
    color: '#ffffff',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '24px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  noDataText: {
    color: '#9ca3af',
    fontSize: '12px',
  },
};

export default HREmployeesPage;