import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const AddManagerToTeam = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teamId: '',
    managerId: ''
  });
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);

  // Fetch teams and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, usersRes] = await Promise.all([
          // Added ?limit=1000 to fetch all teams for the dropdown instead of just page 1
          fetch('http://localhost:5000/api/teams?limit=1000'),
          fetch('http://localhost:5000/api/users')
        ]);

        const teamsData = await teamsRes.json();
        const usersData = await usersRes.json();

        // FIX: Extract the 'teams' array from the paginated response object
        // Fallback to empty array if undefined to prevent map errors
        setTeams(teamsData.teams || []);
        
        // Safety check for users data as well, in case that endpoint is also paginated
        setUsers(Array.isArray(usersData) ? usersData : (usersData.users || []));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setStatus({ message: 'Failed to fetch teams and users', type: 'error' });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: 'Adding manager...', type: 'info' });

    try {
      const response = await fetch('http://localhost:5000/api/teams/add-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: formData.teamId,
          managerId: formData.managerId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ message: 'Manager added successfully!', type: 'success' });
        setFormData({ teamId: '', managerId: '' });
      } else {
        setStatus({ message: `Error: ${data.error}`, type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Failed to connect to backend', type: 'error' });
    }
  };

  if (loading) {
    return (
      <>
        <div style={styles.page}>
          <div style={styles.headerSection}>
            <div>
              <h1 style={styles.title}>Add Manager to Team</h1>
            </div>
            <button type="button" style={styles.backButton} onClick={() => navigate('/hr-dashboard')}>
              Back to Dashboard
            </button>
          </div>
          <div style={styles.card}>
            <p style={styles.infoText}>Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div style={styles.page}>
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.title}>Add Manager to Team</h1>
          </div>
          <button type="button" style={styles.backButton} onClick={() => navigate('/hr-dashboard')}>
            Back to Dashboard
          </button>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h2 style={styles.sectionTitle}>Assignment Details</h2>
          </div>

          <div style={styles.card}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <select
                  style={styles.input}
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    -- Select Team --
                  </option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.input}
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    -- Select Manager --
                  </option>
                  {users
                    .filter((user) => user.role === 'manager')
                    .map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                </select>
              </div>

              <button type="submit" style={styles.button}>Add Manager</button>
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
    marginBottom: '30px',
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
  infoText: {
    color: '#475569',
    fontSize: '14px',
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
};

export default AddManagerToTeam;