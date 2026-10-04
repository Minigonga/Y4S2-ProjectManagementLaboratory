import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HRHeader from './HRheader';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

function getId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
}

export default function HREditTeamPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { isHR, mongoUser, loading: authLoading } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [teamLeaderId, setTeamLeaderId] = useState('');
  const [memberIds, setMemberIds] = useState([]);
  
  // Data state
  const [availableUsers, setAvailableUsers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!isHR) {
      navigate('/login');
      return;
    }

    fetchTeamAndUsers();
  }, [teamId, isHR, authLoading]);

  const fetchTeamAndUsers = async () => {
    setPageLoading(true);
    setError('');

    try {
      // 1. Fetch the team data
      const teamRes = await fetch(`${API_BASE}/api/teams/edit/${teamId}`);
      if (!teamRes.ok) throw new Error('Failed to fetch team details');
      const teamData = await teamRes.json();

      setName(teamData.name || '');
      setTeamLeaderId(teamData.team_leader_id ? getId(teamData.team_leader_id) : '');
      setMemberIds(teamData.member_ids ? teamData.member_ids.map(m => getId(m)) : []);

      // 2. Fetch all users to populate selects/checkboxes
      const usersRes = await fetch(`${API_BASE}/api/users`);
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      const usersData = await usersRes.json();

      // Filter to only show users in the same company
      const currentCompanyId = getId(mongoUser?.company_id);
      const companyUsers = currentCompanyId 
        ? usersData.filter(u => getId(u.company_id) === currentCompanyId)
        : usersData;

      setAvailableUsers(companyUsers);

      // 3. Fetch all teams to check for existing managers across the company
      const teamsRes = await fetch(`${API_BASE}/api/teams?companyId=${currentCompanyId}`);
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        const allTeamsList = teamsData.teams || (Array.isArray(teamsData) ? teamsData : []);
        // Exclude the current team being edited
        setAllTeams(allTeamsList.filter(t => getId(t._id) !== teamId));
      }
    } catch (err) {
      setError(err.message || 'Error loading page data.');
    } finally {
      setPageLoading(false);
    }
  };

  // Maps userId -> name of the team where   already have a manager assigned
  const usersWithOtherManagers = useMemo(() => {
    const mapping = {};
    allTeams.forEach(team => {
      const leaderId = team.team_leader_id ? getId(team.team_leader_id._id || team.team_leader_id) : '';
      if (leaderId) {
        const members = team.member_ids || [];
        members.forEach(m => {
          const mId = getId(m._id || m);
          if (mId) {
            mapping[mId] = team.name;
          }
        });
      }
    });
    return mapping;
  }, [allTeams]);

  // Filter available company users based on the search input
  const filteredUsers = useMemo(() => {
    return availableUsers.filter(user => {
      const nameMatch = (user.name || '').toLowerCase().includes(memberSearch.toLowerCase());
      const emailMatch = (user.email || '').toLowerCase().includes(memberSearch.toLowerCase());
      return nameMatch || emailMatch;
    });
  }, [availableUsers, memberSearch]);

  const handleMemberToggle = (userId) => {
    setMemberIds((prev) => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (teamLeaderId) {
      for (const mId of memberIds) {
        if (usersWithOtherManagers[mId]) {
          const otherTeamName = usersWithOtherManagers[mId];
          const userObj = availableUsers.find(u => getId(u._id) === mId);
          const userName = userObj ? (userObj.name || userObj.email) : 'A selected member';
          setError(`Cannot save changes: ${userName} already has a manager assigned in team "${otherTeamName}". A user cannot have 2 managers.`);
          return;
        }
      }
    }

    try {
      const res = await fetch(`${API_BASE}/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          team_leader_id: teamLeaderId || null,
          member_ids: memberIds
        }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || 'Failed to update team.');
      }

      navigate('/hr-teams');
    } catch (err) {
      setError(err.message);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div>
        <HRHeader />
        <div style={styles.page}><p style={styles.infoText}>Loading team data...</p></div>
        <Footer />
      </div>
    );
  }

  // Find eligible leaders for the dropdown (admins or managers)
  const eligibleManagers = availableUsers.filter(u => u.role === 'admin' || u.role === 'manager');

  return (
    <div>
      <HRHeader />
      <div style={styles.page}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Edit Team</h1>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            Cancel & Go Back
          </button>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Team Name <span style={{color: 'red'}}>*</span></label>
              <input
                type="text"
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>

            {/* Team Leader */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Team Leader (Manager/Admin)</label>
              <select
                style={styles.input}
                value={teamLeaderId}
                onChange={(e) => {
                  const newLeaderId = e.target.value;
                  setTeamLeaderId(newLeaderId);
                  if (newLeaderId) {
                    const conflictingMembers = memberIds.filter(mId => usersWithOtherManagers[mId]);
                    if (conflictingMembers.length > 0) {
                      const firstConflict = availableUsers.find(u => getId(u._id) === conflictingMembers[0]);
                      setError(`Warning: ${firstConflict?.name || firstConflict?.email} already has a manager in team "${usersWithOtherManagers[conflictingMembers[0]]}". Remove them from members or clear the leader before saving.`);
                    } else {
                      setError('');
                    }
                  } else {
                    setError('');
                  }
                }}
              >
                <option value="">-- No Leader Assigned --</option>
                {eligibleManagers.map(manager => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name || manager.email} ({manager.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Team Members Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Team Members ({memberIds.length} Selected)</label>
              
              {/* Display currently selected members as tags/badges */}
              {memberIds.length > 0 && (
                <div style={styles.badgesContainer}>
                  {memberIds.map(mId => {
                    const user = availableUsers.find(u => getId(u._id) === mId);
                    if (!user) return null;
                    return (
                      <div key={mId} style={styles.badge}>
                        <span>{user.name || user.email} ({user.role})</span>
                        <button
                          type="button"
                          style={styles.removeBadgeButton}
                          onClick={() => handleMemberToggle(mId)}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Live Search Input Bar */}
              <input
                type="text"
                style={styles.input}
                placeholder="Search members by name or email..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />

              {/* Selection Area / Checkbox Container */}
              <div style={styles.checkboxContainer}>
                {filteredUsers.map(user => {
                  const userIdStr = getId(user._id);
                  const isSelected = memberIds.includes(userIdStr);
                  const otherTeam = usersWithOtherManagers[userIdStr];
                  const hasManagerElsewhere = teamLeaderId && otherTeam;

                  return (
                    <label 
                      key={user._id} 
                      style={{
                        ...styles.checkboxLabel,
                        opacity: hasManagerElsewhere && !isSelected ? 0.5 : 1,
                        cursor: hasManagerElsewhere && !isSelected ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={hasManagerElsewhere && !isSelected}
                        onChange={() => {
                          if (hasManagerElsewhere && !isSelected) {
                            setError(`${user.name || user.email} already has a manager assigned in team "${otherTeam}".`);
                            return;
                          }
                          handleMemberToggle(userIdStr);
                        }}
                        style={styles.checkbox}
                      />
                      <div>
                        <span>{user.name || user.email}</span>
                        <span style={styles.roleText}> - {user.role}</span>
                        {otherTeam && (
                          <span style={{ ...styles.roleText, color: '#b91c1c', fontWeight: '600' }}>
                            {' '}(Managed in team: {otherTeam})
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <p style={{color: '#6b7280', fontSize: '14px'}}>No users found matching "{memberSearch}".</p>
                )}
              </div>
            </div>

            <div style={styles.submitSection}>
              <button type="submit" style={styles.saveButton}>Save Changes</button>
            </div>
          </form>
        </div>
      </div>
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
    fontSize: '30px',
    fontWeight: 700,
  },
  backButton: {
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#374151',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '30px',
    maxWidth: '800px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#000000',
    
    backgroundColor: '#ffffff'
  },
  checkboxContainer: {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '15px',
    maxHeight: '300px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#f9fafb'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#1f2937',
    cursor: 'pointer'
  },
  checkbox: {
    marginRight: '10px',
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  roleText: {
    color: '#6b7280',
    fontSize: '12px',
    marginLeft: '5px'
  },
  submitSection: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveButton: {
    border: 'none',
    background: '#10b981',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '15px'
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
  badgesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  badge: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '4px 12px',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  removeBadgeButton: {
    background: 'none',
    border: 'none',
    color: '#1e40af',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: 0,
    lineHeight: 1,
  },
};