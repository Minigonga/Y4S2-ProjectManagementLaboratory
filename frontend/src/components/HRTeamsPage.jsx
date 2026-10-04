import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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

function HRTeamsPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const isHR = auth?.isHR || false;
  const mongoUser = auth?.mongoUser || null;
  const currentUser = auth?.currentUser || null;
  const loading = auth?.loading || false;

  const [teams, setTeams] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);   // Tracks initial page access loading
  const [tableLoading, setTableLoading] = useState(false); // Tracks background search updates
  const [error, setError] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeams, setTotalTeams] = useState(0);
  const [limit] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); 
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleTeamMembers = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the teams list after successful deletion
        setTeams(prevTeams => prevTeams.filter(team => team._id !== teamId));
        alert('Team deleted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while deleting the team');
    }
  };

  const fetchTeams = async () => {
    setTableLoading(true); // Don't disrupt the whole screen, just flag background loading
    setError('');

    try {
      const currentCompanyId = getId(mongoUser?.company_id);
      const url = `${API_BASE}/api/teams?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(debouncedSearchTerm)}&companyId=${currentCompanyId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams data.');
      }

      const teamsData = await response.json();
      
      if (teamsData.teams) {
        setTeams(Array.isArray(teamsData.teams) ? teamsData.teams : []);
        setCurrentPage(teamsData.currentPage || 1);
        setTotalPages(teamsData.totalPages || 1);
        setTotalTeams(teamsData.totalTeams || 0);
      } else {
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setTotalPages(1);
        setTotalTeams(Array.isArray(teamsData) ? teamsData.length : 0);
      }
    } catch (err) {
      setError(err.message || 'Unable to load teams data.');
    } finally {
      setTableLoading(false);
      setPageLoading(false); // Initial boot up completed
    }
  };

  useEffect(() => {
    if (loading) return;

    if (!currentUser || !isHR) {
      setPageLoading(false);
      return;
    }

    fetchTeams();
  }, [loading, currentUser, isHR, currentPage, debouncedSearchTerm, mongoUser?.company_id]);

  const formattedTeams = useMemo(() => {
    return teams.map((team) => {
      const teamLeader = team.team_leader_id;
      const members = Array.isArray(team.member_ids) ? team.member_ids : [];
      
      return {
        id: getId(team._id),
        name: team.name || 'Unnamed Team',
        teamLeader: teamLeader ? (teamLeader.name || 'Unassigned') : 'Unassigned',
        teamLeaderId: teamLeader ? getId(teamLeader._id) : null,
        memberCount: members.length,
        members: members.map(member => ({
          id: getId(member._id),
          name: member.name || 'Unnamed User',
          role: member.role || 'employee',
          email: member.email || 'No email'
        })),
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      };
    });
  }, [teams]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setExpandedTeamId(null);
    }
  };

  // Hard block screen loading is ONLY used on initial app load now
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
          <h1 style={styles.title}>Company Teams</h1>
          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              style={styles.createButton} 
              onClick={() => navigate('/admin/create-team')}
            >
              + Create New Team
            </button>
          </div>
        </div>

        {/* Search Bar Container stays mounted always */}
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder="Search by team name..."
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
              {tableLoading ? 'Searching...' : `Showing ${formattedTeams.length} of ${totalTeams} teams`}
            </span>
          </div>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        {!error && (
          <div style={{ opacity: tableLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCellCentered}>Team Name</th>
                    <th style={styles.tableHeaderCell}>Team Leader</th>
                    <th style={styles.tableHeaderCell}>Members Count</th>
                    <th style={styles.tableHeaderCellCentered}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formattedTeams.map((team) => (
                    <React.Fragment key={team.id}>
                      <tr style={styles.tableRow}>
                        <td style={styles.tableCellCentered}>
                          <button 
                            style={styles.teamNameButtonCentered}
                            onClick={() => toggleTeamMembers(team.id)}
                          >
                            {expandedTeamId === team.id ? '▼' : '▶'} {team.name}
                          </button>
                        </td>
                        <td style={styles.tableCell}>{team.teamLeader}</td>
                        <td style={styles.tableCell}>{team.memberCount}</td>
                        <td style={styles.tableCellCentered}>
                          <div style={styles.actionButtonsCentered}>
                            <button
                              type="button"
                              style={styles.editButton}
                              onClick={() => navigate(`/hr/edit-team/${team.id}`)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              style={styles.deleteButton}
                              onClick={() => handleDeleteTeam(team.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedTeamId === team.id && (
                        <tr>
                          <td colSpan={4} style={styles.expandedCell}>
                            <div style={styles.membersSection}>
                              <h4 style={styles.membersTitle}>Team Members</h4>
                              {team.members.length > 0 ? (
                                <table style={styles.membersTable}>
                                  <thead>
                                    <tr>
                                      <th style={styles.membersHeaderCell}>Name</th>
                                      <th style={styles.membersHeaderCell}>Role</th>
                                      <th style={styles.membersHeaderCell}>Email</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {team.members.map((member) => (
                                      <tr key={member.id} style={styles.membersRow}>
                                        <td style={styles.membersCell}>{member.name}</td>
                                        <td style={styles.membersCellCentered}>
                                          <span style={member.role === 'admin' ? styles.adminBadge : styles.employeeBadge}>
                                            {member.role}
                                          </span>
                                        </td>
                                        <td style={styles.membersCell}>{member.email}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p style={styles.noMembersText}>No members assigned to this team yet.</p>
                              )}
                              {team.teamLeaderId && (
                                <div style={styles.teamLeaderNote}>
                                  <strong>Team Leader:</strong> {team.teamLeader}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {formattedTeams.length === 0 && (
                    <tr>
                      <td colSpan={4} style={styles.emptyCell}>
                        {searchTerm ? 'No teams found matching your search.' : 'No teams found. Create your first team!'}
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
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  page: { backgroundColor: '#f7f9fc', minHeight: '100vh', padding: '30px 40px', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' },
  headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, color: '#1a2c3e', fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em' },
  buttonGroup: { display: 'flex', gap: '12px' },
  createButton: { border: 'none', background: '#10b981', color: '#ffffff', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: 600 },
  searchSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' },
  searchContainer: { flex: 1, position: 'relative', maxWidth: '400px' },
  searchInput: { width: '100%', padding: '10px 36px 10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', color: '#000', backgroundColor: '#fff' },
  clearButton: { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '14px', padding: '4px' },
  statsContainer: { display: 'flex', alignItems: 'center' },
  statsText: { fontSize: '14px', color: '#6b7280' },
  infoText: { color: '#475569', fontSize: '14px', textAlign: 'center', padding: '20px' },
  errorText: { color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px' },
  tableContainer: { background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  tableHeader: { background: '#f8fafc' },
  tableHeaderCell: { textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#334155', fontWeight: 600 },
  tableHeaderCellCentered: { textAlign: 'center', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#334155', fontWeight: 600 },
  tableRow: { borderTop: '1px solid #f1f5f9' },
  tableCell: { padding: '14px 16px', fontSize: '14px', color: '#1f2937', textAlign: 'left' },
  tableCellCentered: { padding: '14px 16px', fontSize: '14px', color: '#1f2937', textAlign: 'center' },
  teamNameButtonCentered: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: 0, display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' },
  actionButtonsCentered: { display: 'flex', gap: '8px', justifyContent: 'center' },
  editButton: { border: 'none', background: '#f58220', color: '#ffffff', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontWeight: 600 },
  deleteButton: { border: 'none', background: '#dc2626', color: '#ffffff', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontWeight: 600 },
  emptyCell: { padding: '40px', textAlign: 'center', color: '#64748b' },
  expandedCell: { padding: '20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' },
  membersSection: { marginLeft: '30px' },
  membersTitle: { margin: '0 0 12px 0', color: '#1a2c3e', fontSize: '16px', fontWeight: 600 },
  membersTable: { width: '100%', borderCollapse: 'collapse', marginBottom: '16px' },
  membersHeaderCell: { textAlign: 'center', padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
  membersRow: { borderBottom: '1px solid #f3f4f6' },
  membersCell: { padding: '8px 12px', fontSize: '13px', color: '#374151', textAlign: 'left' },
  membersCellCentered: { padding: '8px 12px', fontSize: '13px', color: '#374151', textAlign: 'center' },
  adminBadge: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', display: 'inline-block' },
  employeeBadge: { backgroundColor: '#e5e7eb', color: '#374151', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', display: 'inline-block' },
  noMembersText: { color: '#6b7280', fontSize: '13px', fontStyle: 'italic', marginBottom: '16px' },
  teamLeaderNote: { marginTop: '12px', padding: '8px 12px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '13px', color: '#92400e' },
  paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', padding: '16px' },
  paginationButton: { border: '1px solid #d1d5db', background: '#ffffff', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', color: '#374151', fontWeight: 500, fontSize: '14px', transition: 'all 0.2s' },
  pageNumbers: { display: 'flex', gap: '8px' },
  pageNumberButton: { border: '1px solid #d1d5db', background: '#ffffff', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', color: '#374151', fontWeight: 500, fontSize: '14px', transition: 'all 0.2s' },
  activePageButton: { background: '#f58220', color: '#ffffff', borderColor: '#f58220' },
};

export default HRTeamsPage;