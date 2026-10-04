import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import './MyTeam.css';

function MyTeamManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = useParams();

  const [team, setTeam] = useState(location.state?.team || null);
  const [loading, setLoading] = useState(!location.state?.team);

  useEffect(() => {
    if (team) return;

    let isCancelled = false;

    const fetchTeam = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teams');
        const teams = await response.json();
        const matchedTeam = Array.isArray(teams)
          ? teams.find((currentTeam) => currentTeam._id === teamId)
          : null;

        if (!isCancelled) setTeam(matchedTeam || null);
      } catch (error) {
        console.error('Error fetching team details:', error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchTeam();
    return () => { isCancelled = true; };
  }, [team, teamId]);

  const members = useMemo(() => {
    if (!Array.isArray(team?.member_ids)) return [];

    return team.member_ids.map((member, index) => {
      if (typeof member === 'object' && member !== null) {
        return {
          id: member._id || `${index}`,
          label: member.name || member.email || 'Unnamed member',
          role: member.role || 'employee'
        };
      }
      return {
        id: `${member}-${index}`,
        label: `Member ID: ${member}`,
        role: 'employee'
      };
    });
  }, [team]);

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

  return (
    <>
      <Header />
      <div className="my-team-management-page">
        <div className="my-team-management-wrapper">
          {loading ? (
            <p className="management-state">Loading team details...</p>
          ) : !team ? (
            <p className="management-state">Team not found.</p>
          ) : (
            <section className="management-card">
              <div className="team-card-header">
                <div>
                  <h2 className="team-title">{team.name}</h2>
                  <p className="team-meta">Total Members: {members.length}</p>
                </div>
                <button
                  type="button"
                  className="generate-team-button"
                  onClick={handleGenerateForTeam}
                >
                  ✨ Generate Plan for Team
                </button>
              </div>

              <h3 className="members-title">Members</h3>
              {members.length === 0 ? (
                <p className="management-state">No members in this team yet.</p>
              ) : (
                <div className="table-container">
                  <table className="management-table">
                    <thead>
                      <tr className="table-header">
                        <th className="table-header-cell">Name</th>
                        <th className="table-header-cell">Role</th>
                        <th className="table-header-cell">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="table-row">
                          <td className="table-cell">{member.label}</td>
                          <td className="table-cell">{member.role}</td>
                          <td className="table-cell action-cell">
                            <button
                              type="button"
                              className="suggestion-button"
                              onClick={() => handleGenerateForMember(member.id)}
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
            </section>
          )}
        </div>
      </div>
    </>
  );
}

export default MyTeamManagement;