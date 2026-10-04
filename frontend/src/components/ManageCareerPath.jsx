import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

const ManageCareerPath = () => {
  const navigate = useNavigate();
  const { mongoUser } = useAuth();
  
  // State for listing career paths
  const [careerPaths, setCareerPaths] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for creating/editing Job Description
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [editId, setEditId] = useState(null); // Track if we are editing an item
  const [status, setStatus] = useState({ message: '', type: '' });

  // Fetch Career Paths from Backend
  const fetchCareerPaths = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/career-paths');
      if (response.ok) {
        const data = await response.json();
        setCareerPaths(data);
      }
    } catch (err) {
      console.error("Failed to fetch career paths", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCareerPaths();
  }, [fetchCareerPaths]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Set up the form to handle editing
  const handleEditClick = (e, path) => {
    e.stopPropagation();
    setEditId(path._id);
    setFormData({
      title: path.title,
      description: path.description || ''
    });
    // Scroll smoothly to the form so the user knows something happened
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Reset form back to creation mode
  const cancelEdit = () => {
    setEditId(null);
    setFormData({ title: '', description: '' });
    setStatus({ message: '', type: '' });
  };

  // Logic to Remove a Job Description
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent accordion from toggling
    if (!window.confirm("Are you sure you want to delete this Job Description?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/career-paths/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCareerPaths(prev => prev.filter(path => path._id !== id));
        if (expandedId === id) setExpandedId(null);
        if (editId === id) cancelEdit(); // Reset form if deleting the item currently being edited
      } else {
        alert("Failed to delete the Job Description.");
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // Logic to Create or Update a Job Description
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editId;

    setStatus({ 
      message: isEditing ? 'Updating Job Description...' : 'Creating Job Description...', 
      type: 'info' 
    });

    const creatorCompanyId = mongoUser?.company_id;
    if (!creatorCompanyId) {
      setStatus({ message: 'Error: Company ID not found.', type: 'error' });
      return;
    }

    try {
      const url = isEditing 
        ? `http://localhost:5000/api/career-paths/${editId}`
        : 'http://localhost:5000/api/career-paths';
        
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          company_id: creatorCompanyId
        }),
      });

      if (response.ok) {
        setStatus({ 
          message: isEditing ? 'Job Description updated successfully!' : 'Job Description created successfully!', 
          type: 'success' 
        });
        setFormData({ title: '', description: '' });
        setEditId(null);
        fetchCareerPaths(); // Refresh the list
      } else {
        const data = await response.json();
        setStatus({ message: `Error: ${data.error || 'Something went wrong'}`, type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Failed to connect to backend', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header mongoUser={mongoUser} />

      <div style={styles.page}>
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.title}>Manage Career Paths</h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Define and view roles within your organization</p>
          </div>
          <button type="button" style={styles.backButton} onClick={() => navigate('/hr-dashboard')}>
            Back to Dashboard
          </button>
        </div>

        {/* Existing Paths List Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h2 style={styles.sectionTitle}>Existing Career Paths</h2>
          </div>
          <div style={styles.card}>
            {loading ? (
              <p style={{ color: '#64748b' }}>Loading career paths...</p>
            ) : careerPaths.length === 0 ? (
              <p style={{ color: '#64748b' }}>No career paths found. Create one below.</p>
            ) : (
              <div style={styles.listContainer}>
                {careerPaths.map((path) => (
                  <div key={path._id} style={styles.listItem}>
                    <div 
                      style={styles.listHeader} 
                      onClick={() => toggleExpand(path._id)}
                    >
                      <span style={styles.pathTitle}>{path.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button 
                          onClick={(e) => handleEditClick(e, path)}
                          style={styles.editBtn}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, path._id)}
                          style={styles.deleteBtn}
                        >
                          Remove
                        </button>
                        <span style={styles.expandIcon}>
                          {expandedId === path._id ? '−' : '+'}
                        </span>
                      </div>
                    </div>
                    {expandedId === path._id && (
                      <div style={styles.pathDescription}>
                        {path.description || "No description provided."}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Section (Handles both Add and Edit) */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}></div>
            <h2 style={styles.sectionTitle}>
              {editId ? 'Edit Job Description' : 'Add New Job Description'}
            </h2>
          </div>

          <div style={styles.card}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <label style={styles.label}>Path Title</label>
                <input 
                  style={styles.input} 
                  name="title" 
                  placeholder="e.g. Lead Product Designer" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                />
                <label style={styles.label}>Description & Requirements</label>
                <textarea 
                  style={{...styles.input, minHeight: '120px', resize: 'vertical'}} 
                  name="description" 
                  placeholder="What does this role entail?" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={styles.button}>
                  {editId ? 'Update Job Description' : 'Create Job Description'}
                </button>
                {editId && (
                  <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {status.message && (
              <p
                style={{
                  ...styles.message,
                  ...(status.type === 'error' ? styles.errorMessage : 
                     status.type === 'info' ? styles.infoMessage : styles.successMessage),
                }}
              >
                {status.message}
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  page: { backgroundColor: '#f7f9fc', flex: 1, padding: '30px 40px', fontFamily: 'Inter, sans-serif' },
  headerSection: { marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '32px', fontWeight: '600', color: '#1a2c3e', margin: 0 },
  backButton: { backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', fontWeight: '600', color: '#374151' },
  section: { marginBottom: '30px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  sectionIcon: { width: '4px', height: '24px', backgroundColor: '#f58220', borderRadius: '2px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#000000', margin: 0 },
  card: { backgroundColor: '#ffffff', border: '1px solid #e8edf2', borderRadius: '12px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#4b5563' },
  input: { backgroundColor: '#ffffff', color: '#000000', padding: '10px 12px', fontSize: '15px', borderRadius: '8px', border: '1px solid #dbe3eb', outline: 'none' },
  button: { padding: '11px 14px', backgroundColor: '#f58220', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: 'fit-content', marginTop: '8px' },
  message: { marginTop: '14px', fontWeight: '600', borderRadius: '8px', padding: '10px 12px', fontSize: '13px' },
  errorMessage: { color: '#b91c1c', backgroundColor: '#fee2e2', border: '1px solid #fecaca' },
  successMessage: { color: '#0f5132', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0' },
  infoMessage: { color: '#1e40af', backgroundColor: '#dbeafe', border: '1px solid #bfdbfe' },
  
  listContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: { border: '1px solid #f1f5f9', borderRadius: '8px', overflow: 'hidden' },
  listHeader: { 
    padding: '12px 16px', 
    backgroundColor: '#f8fafc', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  pathTitle: { fontWeight: '600', color: '#334155' },
  expandIcon: { color: '#f58220', fontWeight: 'bold', fontSize: '18px' },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  editBtn: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  cancelBtn: {
    padding: '11px 14px',
    backgroundColor: '#ffffff',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '8px'
  }
};

export default ManageCareerPath;