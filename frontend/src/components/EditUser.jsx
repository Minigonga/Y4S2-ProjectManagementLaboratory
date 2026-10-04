import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import './EditUser.css';

const API_BASE = 'http://localhost:5000';

function splitName(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function EditUser() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { isHR, currentUser, mongoUser, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'employee',
    password: '',
    image_url: '',
    teamId: '',
  });
  const [teams, setTeams] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    if (authLoading || !currentUser || !isHR || !userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setStatus({ message: '', type: '' });

      try {
        const [userResponse, teamsResponse] = await Promise.all([
          fetch(`${API_BASE}/api/admin/users/${userId}`),
          fetch(`${API_BASE}/api/teams`),
        ]);

        const data = await userResponse.json();
        const teamsData = await teamsResponse.json();

        if (!userResponse.ok) {
          throw new Error(data.error || 'Failed to load user details.');
        }

        if (!teamsResponse.ok) {
          throw new Error(teamsData.error || 'Failed to load teams.');
        }

        const { firstName, lastName } = splitName(data.name);
        const companyTeams = Array.isArray(teamsData)
          ? teamsData.filter((team) => String(team?.company_id?._id || team?.company_id) === String(mongoUser?.company_id))
          : [];
        const currentTeam = companyTeams.find((team) =>
          Array.isArray(team?.member_ids) && team.member_ids.some((member) => String(member?._id || member) === String(userId))
        );

        setTeams(companyTeams);
        setFormData({
          email: data.email || '',
          name: data.name || '',
          role: data.role || 'employee',
          password: '',
          image_url: data.image_url || '',
          teamId: currentTeam?._id || '',
        });
      } catch (error) {
        setStatus({ message: error.message || 'Failed to load user.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authLoading, currentUser, isHR, userId, mongoUser?.company_id]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ message: 'Saving changes...', type: 'info' });

    if (formData.password && formData.password.length < 8) {
      setStatus({ message: 'Password must be at least 8 characters.', type: 'error' });
      return;
    }

    try {
      let uploadedImageUrl = formData.image_url;

      if (imageFile) {
        const uploadForm = new FormData();
        uploadForm.append('image', imageFile);

        const uploadResponse = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: uploadForm,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text().catch(() => 'Upload failed');
          throw new Error(errorText || 'Failed to upload image.');
        }

        const contentType = uploadResponse.headers.get('content-type') || '';
        let filename = imageFile.name;

        if (contentType.includes('application/json')) {
          const uploadData = await uploadResponse.json();
          if (uploadData?.filename) {
            filename = uploadData.filename;
          }
        } else {
          await uploadResponse.text();
        }

        uploadedImageUrl = `${API_BASE}/image/${encodeURIComponent(filename)}`;
      }

      const payload = {
        ...formData,
        image_url: uploadedImageUrl,
      };

      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user.');
      }

      setStatus({ message: 'User updated successfully.', type: 'success' });
      setFormData((prev) => ({
        ...prev,
        password: '',
        image_url: uploadedImageUrl,
      }));
      setImagePreview('');
      setImageFile(null);
    } catch (error) {
      setStatus({ message: error.message || 'Failed to update user.', type: 'error' });
    }
  };

  if (authLoading) {
    return (
      <div>
        <div className="edit-user-page">
          <p className="edit-user-info-text">Checking access...</p>
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
    <>
      <div className="edit-user-page">
        <div className="edit-user-container">
          <div className="edit-user-header">
            <div>
              <h1 className="edit-user-title">Edit User</h1>
            </div>
            <button 
              type="button" 
              className="edit-user-back-btn" 
              onClick={() => navigate('/hr-employees')}
            >
              Back to Personnel
            </button>
          </div>

          <div className="edit-user-section">
            <div className="edit-user-section-header">
              <div className="edit-user-section-icon"></div>
              <h2 className="edit-user-section-title">User Details</h2>
            </div>

            <div className="edit-user-card">
              {loading ? (
                <p className="edit-user-info-text">Loading user...</p>
              ) : (
                <form onSubmit={handleSubmit} className="edit-user-form">
                  <div className="edit-user-form-grid">
                    <input 
                      className="edit-user-input"
                      name="name" 
                      placeholder="Name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                    />
                    <input 
                      className="edit-user-input"
                      name="email" 
                      type="email" 
                      placeholder="Email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                    />
                    <input 
                      className="edit-user-input"
                      name="password" 
                      type="password" 
                      minLength={8} 
                      placeholder="New Password" 
                      value={formData.password} 
                      onChange={handleChange} 
                    />
                    <select 
                      className="edit-user-select"
                      name="teamId" 
                      value={formData.teamId} 
                      onChange={handleChange}
                    >
                      <option value="">No Team</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                    <select 
                      className="edit-user-select"
                      name="role" 
                      value={formData.role} 
                      onChange={handleChange}
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="edit-user-avatar-section">
                      <label htmlFor="edit-user-image" className="edit-user-avatar-label">
                        <img
                          src={imagePreview || formData.image_url || 'http://localhost:5000/static/user-images/default-avatar.svg'}
                          alt="User avatar"
                          className="edit-user-avatar-preview"
                        />
                        <span className="edit-user-avatar-hint">Click the image to change</span>
                      </label>
                      <input
                        id="edit-user-image"
                        className="edit-user-file-input"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          if (imagePreview && imagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(imagePreview);
                          }
                          setImageFile(file);
                          setImagePreview(file ? URL.createObjectURL(file) : '');
                        }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="edit-user-submit-btn">
                    Save Changes
                  </button>
                </form>
              )}

              {status.message && (
                <p
                  className={`edit-user-message ${
                    status.type === 'error' 
                      ? 'edit-user-error' 
                      : status.type === 'success'
                      ? 'edit-user-success'
                      : 'edit-user-info'
                  }`}
                >
                  {status.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default EditUser;