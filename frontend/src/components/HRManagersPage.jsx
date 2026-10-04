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

function HRManagersPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  // Safe destructuring with fallbacks
  const isHR = auth?.isHR || false;
  const mongoUser = auth?.mongoUser || null;
  const currentUser = auth?.currentUser || null;
  const loading = auth?.loading || false;

  const [managers, setManagers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalManagers, setTotalManagers] = useState(0);
  const [limit] = useState(10);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'manager',
    company_id: ''
  });

  const fetchManagers = async () => {
    try {
      const currentCompanyId = getId(mongoUser?.company_id);
      const url = `${API_BASE}/api/managers?page=${currentPage}&limit=${limit}&companyId=${currentCompanyId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch managers');
      const data = await response.json();
      
      // Handle both paginated and non-paginated responses
      if (data.managers) {
        setManagers(Array.isArray(data.managers) ? data.managers : []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setTotalManagers(data.totalManagers || 0);
      } else {
        setManagers(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalManagers(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      setError(err.message || 'Unable to load managers data.');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/companies`);
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      setCompanies([]);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const handleDeleteManager = async (managerId, managerName, managerRole) => {

    if (managerId === getId(mongoUser?._id)) {
      alert('You cannot delete your own user account.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${managerName}? This will remove them from all team leadership positions.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/api/managers/${managerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to delete manager.');
      }

      await fetchManagers();
    } catch (err) {
      alert(err.message || 'Failed to delete manager.');
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE}/api/managers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to create manager.');
      }

      setShowCreateModal(false);
      setFormData({ name: '', email: '', role: 'manager', company_id: '' });
      await fetchManagers();
    } catch (err) {
      alert(err.message || 'Failed to create manager.');
    }
  };

  const handleUpdateManager = async (e) => {
    e.preventDefault();
  

    try {
      const response = await fetch(`${API_BASE}/api/managers/${editingManager._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formData.role,
          name: formData.name,
          email: formData.email,
          company_id: formData.company_id
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to update manager.');
      }

      setEditingManager(null);
      setFormData({ name: '', email: '', role: 'manager', company_id: '' });
      await fetchManagers();
    } catch (err) {
      alert(err.message || 'Failed to update manager.');
    }
  };

  const openEditModal = (manager) => {
    
    setEditingManager(manager);
    setFormData({
      name: manager.name || '',
      email: manager.email || '',
      role: manager.role || 'manager',
      company_id: getId(manager.company_id) || ''
    });
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
      setError('');
      await Promise.all([fetchManagers(), fetchCompanies()]);
      setPageLoading(false);
    };

    fetchData();
  }, [loading, currentUser, isHR, currentPage, mongoUser?.company_id]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading || pageLoading) {
    return (
      <div>
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
          <h1 style={styles.title}>Managers & Admins</h1>
          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              style={styles.createButton} 
              onClick={() => setShowCreateModal(true)}
            >
              + Add Manager
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={styles.statsSection}>
          <div style={styles.statsContainer}>
            <span style={styles.statsText}>
              Showing {managers.length} of {totalManagers} managers
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
                    <th style={styles.tableHeaderCell}>Email</th>
                    <th style={styles.tableHeaderCellCentered}>Role</th>
                    <th style={styles.tableHeaderCellCentered}>Teams Managed</th>
                    <th style={styles.tableHeaderCellCentered}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((manager) => (
                    <tr key={getId(manager._id)} style={styles.tableRow}>
                      <td style={styles.tableCellCentered}>
                        <Link
                          to={`/profile/${getId(manager._id)}`}
                          style={styles.clickableManagerInfo}
                        >
                          {manager.image_url && (
                            <img 
                              src={manager.image_url} 
                              alt={manager.name}
                              style={styles.avatar}
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <span>{manager.name || 'Unnamed'}</span>
                        </Link>
                      </td>
                      <td style={styles.tableCell}>{manager.email || 'No email'}</td>
                      <td style={styles.tableCellCentered}>
                        <span style={manager.role === 'admin' ? styles.adminBadge : styles.managerBadge}>
                          {manager.role === 'admin' ? 'Admin' : 'Manager'}
                        </span>
                      </td>
                      <td style={styles.tableCellCentered}>
                        {manager.role === 'admin' ? (
                          <span style={styles.allTeamsTag}>All Teams</span>
                        ) : manager.teams_managed && manager.teams_managed.length > 0 ? (
                          <div style={styles.teamsListCentered}>
                            {manager.teams_managed.map(team => (
                              <span key={getId(team._id)} style={styles.teamTag}>
                                {team.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={styles.noTeamsText}>No teams assigned</span>
                        )}
                      </td>
                      <td style={styles.tableCellCentered}>
                        <div style={styles.actionButtonsCentered}>
                          {manager.role !== 'admin' && (
                            <>
                              <button
                                type="button"
                                style={styles.editButton}
                                onClick={() => openEditModal(manager)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                style={styles.deleteButton}
                                onClick={() => handleDeleteManager(getId(manager._id), manager.name, manager.role)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {manager.role === 'admin' && (
                            <span style={styles.protectedText}>Protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {managers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={styles.emptyCell}>
                        No managers found. Add your first manager!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

      {/* Create Manager Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add New Manager</h2>
            <form onSubmit={handleCreateManager}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  required
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  required
                  style={styles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select
                  style={styles.select}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin </option>
                </select>
                <small style={styles.hintText}>Admin users can only be created by the system</small>
              </div>
              <div style={styles.modalButtons}>
                <button type="button" style={styles.cancelButton} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Create Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Manager Modal */}
      {editingManager && (
        <div style={styles.modalOverlay} onClick={() => setEditingManager(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Edit Manager</h2>
            <form onSubmit={handleUpdateManager}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  style={styles.input}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select
                  style={styles.select}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={styles.modalButtons}>
                <button type="button" style={styles.cancelButton} onClick={() => setEditingManager(null)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Update Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

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
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  createButton: {
    border: 'none',
    background: '#10b981',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: '20px',
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
    minWidth: '800px',
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
  managerInfoCentered: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
  },
  clickableManagerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'inherit',
    textDecoration: 'none',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
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
  managerBadge: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
  },
  teamsListCentered: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    justifyContent: 'center',
  },
  teamTag: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
  },
  allTeamsTag: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 600,
    display: 'inline-block',
  },
  noTeamsText: {
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
  protectedText: {
    color: '#6b7280',
    fontSize: '12px',
    fontStyle: 'italic',
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    display: 'inline-block',
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    margin: '0 0 20px 0',
    color: '#1a2c3e',
    fontSize: '24px',
    fontWeight: 600,  
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    color: '#374151',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    color: '#374151',
  },
  hintText: {
    display: 'block',
    marginTop: '4px',
    fontSize: '11px',
    color: '#6b7280',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  cancelButton: {
    border: '1px solid #d1d5db',
    background: '#ffffff',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 500,
  },
  submitButton: {
    border: 'none',
    background: '#f58220',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: 500,
  },
};

export default HRManagersPage;