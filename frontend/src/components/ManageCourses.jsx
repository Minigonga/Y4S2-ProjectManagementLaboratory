import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import HRHeader from './HRheader';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';
const DEFAULT_COURSE_IMAGE = 'http://localhost:5000/static/course-images/default-course.png';

const ManageCourses = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const isHR = auth?.isHR || false;
  const currentUser = auth?.currentUser || null;
  const loading = auth?.loading || false;

  const [courses, setCourses] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  const defaultCourseForm = {
    title: '',
    description: '',
    duration_hours: 1,
    type: 'technical',
    format: 'online',
    capacity: 30
  };

  const defaultSession = {
    date: '',
    duration_minutes: 60,
    location: '',
    description: ''
  };

  const [formData, setFormData] = useState(defaultCourseForm);
  const [sessionsData, setSessionsData] = useState([{ ...defaultSession }]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formStatus, setFormStatus] = useState({ message: '', type: '' });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchCourses = async () => {
    setPageLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/courses?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      
      setCourses(data.courses || data);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Unable to load courses.');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && currentUser && isHR) {
      fetchCourses();
    }
  }, [loading, currentUser, isHR, currentPage, searchTerm]);

  const handleCreateNew = () => {
    setFormData(defaultCourseForm);
    setSessionsData([{ ...defaultSession }]);
    setImageFile(null);
    setImagePreview('');
    setFormStatus({ message: '', type: '' });
    setView('create');
  };

  const handleEdit = async (course) => {
    setFormStatus({ message: 'Loading course data...', type: 'info' });
    setView('edit');
    setEditingCourseId(course._id);
    setImageFile(null);
    setImagePreview(course.image_url || '');
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/courses/${course._id}/full`);
      if (!response.ok) throw new Error('Failed to fetch course details');
      
      const { course: fetchedCourse, sessions } = await response.json();
      
      setFormData({
        title: fetchedCourse.title || '',
        description: fetchedCourse.description || '',
        duration_hours: fetchedCourse.duration_hours || 1,
        type: fetchedCourse.type || 'technical',
        format: fetchedCourse.format || 'online',
        capacity: fetchedCourse.capacity || 30
      });

      const formattedSessions = sessions.map(s => ({
        ...s,
        date: s.date ? new Date(s.date).toISOString().slice(0, 16) : '',
        duration_minutes: s.duration_minutes || 60,
        location: s.location || '',
        description: s.description || ''
      }));

      setSessionsData(formattedSessions.length > 0 ? formattedSessions : [{ ...defaultSession }]);
      setFormStatus({ message: '', type: '' });
    } catch (err) {
      setFormStatus({ message: err.message, type: 'error' });
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSessionChange = (index, field, value) => {
    const updatedSessions = [...sessionsData];
    updatedSessions[index][field] = value;
    setSessionsData(updatedSessions);
  };

  const handleSessionCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    const currentSessions = [...sessionsData];
    
    if (count > currentSessions.length) {
      while (currentSessions.length < count) {
        currentSessions.push({ ...defaultSession });
      }
    } else if (count < currentSessions.length && count > 0) {
      currentSessions.length = count;
    }
    setSessionsData(currentSessions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ message: 'Saving changes...', type: 'info' });

    const submissionData = new FormData();
    submissionData.append('course', JSON.stringify(formData));
    submissionData.append('sessions', JSON.stringify(sessionsData));
    if (imageFile) {
      submissionData.append('image', imageFile);
    }

    const endpoint = view === 'create' 
      ? `${API_BASE}/api/admin/courses/create` 
      : `${API_BASE}/api/admin/courses/${editingCourseId}`;
      
    const method = view === 'create' ? 'POST' : 'PUT';

    try {
      const response = await fetch(endpoint, {
        method,
        body: submissionData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save course');

      setFormStatus({ message: `Success! Course was saved successfully.`, type: 'success' });
      
      setTimeout(() => {
        setView('list');
        setCurrentPage(1);
        fetchCourses();
      }, 1500);

    } catch (err) {
      setFormStatus({ message: err.message, type: 'error' });
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) return <div style={styles.page}><p style={styles.infoText}>Loading auth states...</p></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isHR) return <Navigate to="/" replace />;

  return (
    <>
      <HRHeader />
      <div style={styles.page}>
        
        {view === 'list' && (
          <>
            <div style={styles.headerSection}>
              <h1 style={styles.title}>Manage Courses</h1>
              <button style={styles.createButton} onClick={handleCreateNew}>
                + Create New Course
              </button>
            </div>

            <div style={styles.searchSection}>
              <input
                type="text"
                style={styles.searchInput}
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {error && <p style={styles.errorMessage}>{error}</p>}

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell}>Preview</th>
                    <th style={styles.tableHeaderCell}>Course Title</th>
                    <th style={styles.tableHeaderCellCentered}>Type</th>
                    <th style={styles.tableHeaderCellCentered}>Format</th>
                    <th style={styles.tableHeaderCellCentered}>Duration</th>
                    <th style={styles.tableHeaderCellCentered}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLoading ? (
                    <tr><td colSpan={6} style={styles.emptyCell}>Loading courses...</td></tr>
                  ) : (
                    courses.map(course => (
                      <tr key={course._id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <img 
                            src={course.image_url || DEFAULT_COURSE_IMAGE} 
                            alt="Preview" 
                            style={styles.tableRowThumb} 
                          />
                        </td>
                        <td style={styles.tableCell}><strong>{course.title}</strong></td>
                        <td style={styles.tableCellCentered}>
                          <span style={styles.badge}>{course.type}</span>
                        </td>
                        <td style={styles.tableCellCentered}>{course.format}</td>
                        <td style={styles.tableCellCentered}>{course.duration_hours}h</td>
                        <td style={styles.tableCellCentered}>
                          <button style={styles.editButton} onClick={() => handleEdit(course)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {!pageLoading && courses.length === 0 && (
                    <tr>
                      <td colSpan={6} style={styles.emptyCell}>No courses found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <button
                  style={{ ...styles.paginationButton, opacity: currentPage === 1 ? 0.5 : 1 }}
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
                >
                  Previous
                </button>
                <span style={styles.paginationInfo}>
                  Page <strong>{currentPage}</strong> of {totalPages}
                </span>
                <button
                  style={{ ...styles.paginationButton, opacity: currentPage === totalPages ? 0.5 : 1 }}
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {(view === 'create' || view === 'edit') && (
          <div style={styles.formContainer}>
            <div style={styles.headerSection}>
              <h1 style={styles.title}>{view === 'create' ? 'Create New Course' : 'Edit Course'}</h1>
              <button style={styles.backButton} onClick={() => setView('list')}>
                ← Back to List
              </button>
            </div>

            <form style={styles.card} onSubmit={handleSubmit}>
              <h2 style={styles.sectionTitle}>1. General Information</h2>
              
              <div style={styles.imageUploadWrapper}>
                <label style={styles.label}>Course Image Banner</label>
                <div style={styles.imageSelectorFlex}>
                  <img 
                    src={imagePreview || DEFAULT_COURSE_IMAGE} 
                    alt="Upload Preview" 
                    style={styles.formImagePreview} 
                  />
                  <div>
                    <label htmlFor="course-image-file" style={styles.fileUploadLabelBtn}>
                      Upload Image File
                    </label>
                    <input 
                      id="course-image-file" 
                      type="file" 
                      accept="image/*" 
                      style={styles.fileInputHidden} 
                      onChange={handleImageChange} 
                    />
                    <p style={styles.avatarHint}>Supported Formats: PNG, JPG, JPEG.</p>
                  </div>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={{...styles.inputGroup, gridColumn: '1 / -1'}}>
                  <label style={styles.label}>Course Title</label>
                  <input style={styles.input} name="title" value={formData.title} onChange={handleFormChange} required />
                </div>

                <div style={{...styles.inputGroup, gridColumn: '1 / -1'}}>
                  <label style={styles.label}>Description</label>
                  <textarea style={{...styles.input, minHeight: '80px'}} name="description" value={formData.description} onChange={handleFormChange} />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Duration (Hours)</label>
                  <input style={styles.input} type="number" step="0.5" name="duration_hours" value={formData.duration_hours} onChange={handleFormChange} required />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Capacity</label>
                  <input style={styles.input} type="number" name="capacity" value={formData.capacity} onChange={handleFormChange} required />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Type</label>
                  <select style={styles.input} name="type" value={formData.type} onChange={handleFormChange}>
                    <option value="technical">Technical</option>
                    <option value="compliance">Compliance</option>
                    <option value="soft_skill">Soft Skill</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Format</label>
                  <select style={styles.input} name="format" value={formData.format} onChange={handleFormChange}>
                    <option value="online">Online</option>
                    <option value="in_person">In Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <hr style={styles.divider} />

              <div style={styles.sessionHeaderContainer}>
                <h2 style={styles.sectionTitle}>2. Session Details</h2>
                {view === 'create' ? (
                  <div style={styles.sessionCounterRow}>
                    <label style={styles.label}>Number of Sessions:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="20"
                      style={{...styles.input, width: '80px', marginLeft: '12px'}} 
                      value={sessionsData.length} 
                      onChange={handleSessionCountChange} 
                    />
                  </div>
                ) : (
                  <span></span>
                )}
              </div>

              {sessionsData.map((session, index) => (
                <div key={index} style={styles.sessionCard}>
                  <h4 style={styles.sessionTitle}>Session {index + 1}</h4>
                  <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Date & Time</label>
                      <input 
                        style={styles.input} 
                        type="datetime-local" 
                        value={session.date} 
                        onChange={(e) => handleSessionChange(index, 'date', e.target.value)} 
                        required 
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Duration (Minutes)</label>
                      <input 
                        style={styles.input} 
                        type="number" 
                        min="1"
                        value={session.duration_minutes} 
                        onChange={(e) => handleSessionChange(index, 'duration_minutes', e.target.value)} 
                        required 
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Location / Link</label>
                      <input 
                        style={styles.input} 
                        value={session.location || ''} 
                        onChange={(e) => handleSessionChange(index, 'location', e.target.value)} 
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Session Focus</label>
                      <input 
                        style={styles.input} 
                        value={session.description || ''} 
                        onChange={(e) => handleSessionChange(index, 'description', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div style={styles.footerActions}>
                {formStatus.message && (
                  <span style={formStatus.type === 'error' ? styles.errorMessage : styles.successMessage}>
                    {formStatus.message}
                  </span>
                )}
                <button type="submit" style={styles.createButton}>
                  {view === 'create' ? 'Publish Course' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
      <Footer />
    </>
  );
};

const styles = {
  page: { backgroundColor: '#f7f9fc', minHeight: '100vh', padding: '30px 40px', fontFamily: 'Inter, sans-serif' },
  headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, color: '#1a2c3e', fontSize: '30px', fontWeight: 700 },
  createButton: { border: 'none', background: '#10b981', color: '#ffffff', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
  backButton: { backgroundColor: '#ffffff', color: '#1f2937', border: '1px solid #d1d5db', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  searchSection: { marginBottom: '20px' },
  searchInput: { width: '100%', maxWidth: '500px', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', color:'#000', background: '#ffffff'},
  tableContainer: { background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f8fafc' },
  tableHeaderCell: { textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#334155', fontWeight: 600 },
  tableHeaderCellCentered: { textAlign: 'center', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#334155', fontWeight: 600 },
  tableRow: { borderTop: '1px solid #f1f5f9' },
  tableCell: { padding: '14px 16px', fontSize: '14px', color: '#1f2937' },
  tableCellCentered: { padding: '14px 16px', fontSize: '14px', color: '#1f2937', textAlign: 'center' },
  tableRowThumb: { width: '50px', height: '35px', borderRadius: '4px', objectFit: 'cover', backgroundColor: '#e2e8f0' },
  badge: { backgroundColor: '#e5e7eb', color: '#374151', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' },
  editButton: { border: 'none', background: '#f58220', color: '#ffffff', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' },
  emptyCell: { padding: '40px', textAlign: 'center', color: '#64748b' },
  formContainer: { maxWidth: '1000px', margin: '0 auto' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e8edf2', borderRadius: '12px', padding: '30px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1a2c3e', margin: '0 0 20px 0' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#4a5a6a' },
  input: { padding: '10px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #dbe3eb', backgroundColor: '#f9fafb', outline: 'none', color: '#1f2937' },
  imageUploadWrapper: { marginBottom: '24px' },
  imageSelectorFlex: { display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' },
  formImagePreview: { width: '140px', height: '90px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' },
  fileUploadLabelBtn: { display: 'inline-block', padding: '8px 16px', backgroundColor: '#1f2937', color: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  fileInputHidden: { display: 'none' },
  avatarHint: { fontSize: '12px', color: '#64748b', marginTop: '6px', marginBottom: 0 },
  divider: { border: 'none', borderTop: '1px solid #e8edf2', margin: '30px 0' },
  sessionHeaderContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sessionCounterRow: { display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '10px 16px', borderRadius: '8px' },
  lockedText: { fontSize: '13px', color: '#b91c1c', fontWeight: '600', backgroundColor: '#fee2e2', padding: '6px 12px', borderRadius: '6px' },
  sessionCard: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '16px' },
  sessionTitle: { margin: '0 0 16px 0', fontSize: '15px', color: '#3b82f6' },
  footerActions: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', marginTop: '30px' },
  errorMessage: { color: '#b91c1c', fontSize: '14px', fontWeight: '600' },
  successMessage: { color: '#0f5132', fontSize: '14px', fontWeight: '600' },
  infoText: { textAlign: 'center', color: '#475569' },
  paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' },
  paginationButton: { border: '1px solid #d1d5db', background: '#ffffff', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', color: '#374151', fontWeight: '500', fontSize: '13px' },
  paginationInfo: { fontSize: '14px', color: '#4b5563' }
};

export default ManageCourses;