import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const CreateTeam = () => {
  const navigate = useNavigate();
  const { mongoUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    team_leader_id: ''
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  
  // Pagination and Team State
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Number of items per page

  // Fetch teams from backend with pagination parameters
  const fetchTeams = async (page = 1) => {
    setLoadingTeams(true);
    try {
      // It's also a good idea to pass the companyId if your backend supports filtering by it
      const companyIdParam = mongoUser?.company_id ? `&companyId=${mongoUser.company_id}` : '';
      const response = await fetch(`http://localhost:5000/api/teams?page=${page}&limit=${limit}${companyIdParam}`);
      
      if (response.ok) {
        const data = await response.json();

        // The backend now returns an object, so we extract the 'teams' array
        const sortedTeams = (data.teams || []).sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );

        setTeams(sortedTeams);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } else {
        console.error('Failed to fetch teams');
      }
    } catch (err) {
      console.error('Error connecting to backend for fetching teams:', err);
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    // Wait until mongoUser is available to fetch so we can pass company_id if needed
    if (mongoUser) {
      fetchTeams(1);
    }
  }, [mongoUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Note: Since teams are paginated, this only checks for duplicates on the CURRENT page. 
    // True validation should also be handled by your backend MongoDB unique constraints.
    const nameExists = teams.some(
      (team) => team.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    );

    if (nameExists) {
      setStatus({ 
        message: 'Error: A team with this name already exists on this page.', 
        type: 'error' 
      });
      return;
    }

    const creatorCompanyId = mongoUser?.company_id;
    if (!creatorCompanyId) {
      setStatus({ 
        message: 'Error: Creator company was not found.', 
        type: 'error' 
      });
      return;
    }

    setStatus({ message: 'Creating team...', type: 'info' });

    try {
      const payload = {
        ...formData,
        company_id: creatorCompanyId,
      };

      const response = await fetch('http://localhost:5000/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ message: 'Team created successfully!', type: 'success' });
        setFormData({ name: '', team_leader_id: '' });
        fetchTeams(1); // Refresh list and jump back to page 1
      } else {
        setStatus({ message: `Error: ${data.error}`, type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Failed to connect to backend', type: 'error' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) fetchTeams(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) fetchTeams(currentPage - 1);
  };

  return (
    <>
      <div style={styles.page}>
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.title}>Team Management</h1>
          </div>
          <button type="button" style={styles.backButton} onClick={() => navigate('/hr-dashboard')}>
            Back to Dashboard
          </button>
        </div>

        {/* Create Team Form Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h2 style={styles.sectionTitle}>Create New Team</h2>
          </div>

          <div style={styles.card}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <input
                  style={styles.input}
                  name="name"
                  placeholder="Team Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" style={styles.button}>Create Team</button>
            </form>

            {status.message && (
              <p
                style={{
                  ...styles.message,
                  ...(status.type === 'error' ? styles.errorMessage : status.type === 'success' ? styles.successMessage : styles.infoMessage),
                }}
              >
                {status.message}
              </p>
            )}
          </div>
        </div>

        {/* Existing Teams List Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h2 style={styles.sectionTitle}>Existing Teams</h2>
          </div>

          <div style={styles.card}>
            {loadingTeams ? (
              <p style={styles.loadingText}>Loading existing teams...</p>
            ) : teams.length === 0 ? (
              <p style={styles.emptyText}>No teams found. Create one above!</p>
            ) : (
              <>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Team Name</th>
                        <th style={styles.th}>Team Leader</th>
                        <th style={styles.th}>Members Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team) => (
                        <tr key={team._id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: '600' }}>{team.name}</td>
                          <td style={styles.td}>
                            {team.team_leader_id 
                              ? team.team_leader_id.name || team.team_leader_id.email || 'Assigned'
                              : 'No leader assigned'}
                          </td>
                          <td style={styles.td}>
                            {team.member_ids ? team.member_ids.length : 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={styles.pagination}>
                    <button 
                      style={{
                        ...styles.pageButton,
                        ...(currentPage === 1 ? styles.pageButtonDisabled : {})
                      }}
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span style={styles.pageInfo}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      style={{
                        ...styles.pageButton,
                        ...(currentPage === totalPages ? styles.pageButtonDisabled : {})
                      }}
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const styles = {
  page: {
    backgroundColor: '#f7f9fc',
    minHeight: '100vh',
    padding: '30px 40px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  headerSection: {
    marginBottom: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#1a2c3e',
    margin: '0 0 8px 0',
    letterSpacing: '-0.02em',
  },
  backButton: {
    backgroundColor: '#ffffff',
    color: '#1f2937',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  section: {
    marginBottom: '40px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
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
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e8edf2',
    borderRadius: '12px',
    padding: '22px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #dbe3eb',
    backgroundColor: '#ffffff',
    outline: 'none',
    color: '#1f2937',
  },
  button: {
    padding: '11px 14px',
    backgroundColor: '#f58220',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    width: 'fit-content',
  },
  message: {
    marginTop: '14px',
    fontWeight: '600',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
  },
  errorMessage: {
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
  },
  successMessage: {
    color: '#0f5132',
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
  },
  infoMessage: {
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    border: '1px solid #bfdbfe',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  th: {
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '600',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 16px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  loadingText: {
    color: '#64748b',
    fontStyle: 'italic',
    margin: 0,
  },
  emptyText: {
    color: '#64748b',
    margin: 0,
    textAlign: 'center',
    padding: '20px 0',
  },
  // Pagination Styles Added Here
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '10px',
    borderTop: '1px solid #e8edf2',
  },
  pageButton: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'background-color 0.2s',
  },
  pageButtonDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    cursor: 'not-allowed',
    border: '1px solid #e5e7eb',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#475569',
    fontWeight: '500',
  }
};

export default CreateTeam;