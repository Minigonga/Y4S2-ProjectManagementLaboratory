import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import './CreateUser.css';

const DEFAULT_AVATAR_URL = 'http://localhost:5000/static/user-images/default-avatar.svg';

const CreateUser = () => {
  const navigate = useNavigate();
  const { currentUser, mongoUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'employee',
    image_url: '',
    teamId: '',
    linkedin: ''
  });
  const [teams, setTeams] = useState([]);
  const [jobDescriptions, setJobDescriptions] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!mongoUser?.company_id) {
      setTeams([]);
      return;
    }

    let cancelled = false;

    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teams');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load teams.');
        }

        const companyTeams = Array.isArray(data.teams)
          ? data.teams.filter((team) => String(team?.company_id?._id || team?.company_id) === String(mongoUser.company_id))
          : [];

        if (!cancelled) {
          setTeams(companyTeams);
        }
      } catch (error) {
        if (!cancelled) {
          setTeams([]);
        }
      }
    };

    const fetchJobDescriptions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/job-descriptions');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load Job descriptions.');
        }

        const jobs = Array.isArray(data) ? data : [];

        if (!cancelled) {
          setJobDescriptions(jobs);
        }
      } catch (error) {
        if (!cancelled) {
          setJobDescriptions([]);
        }
      }
    };

    fetchTeams();
    fetchJobDescriptions();

    return () => {
      cancelled = true;
    };
  }, [mongoUser?.company_id]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: 'Creating user...', type: 'info' });

    if (!currentUser) {
      setStatus({ message: 'Error: You must be logged in.', type: 'error' });
      return;
    }

    if (formData.password.length < 8) {
      setStatus({ message: 'Password must be at least 8 characters.', type: 'error' });
      return;
    }

    const creatorCompanyId = mongoUser?.company_id;
    if (!creatorCompanyId) {
      setStatus({ message: 'Error: Creator company was not found.', type: 'error' });
      return;
    }

    try {
      let uploadedImageUrl = formData.image_url;

      if (!imageFile && !uploadedImageUrl) {
        uploadedImageUrl = DEFAULT_AVATAR_URL;
      }

      if (imageFile) {
        const uploadForm = new FormData();
        uploadForm.append('image', imageFile);

        const uploadResponse = await fetch('http://localhost:5000/upload', {
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

        uploadedImageUrl = `http://localhost:5000/image/${encodeURIComponent(filename)}`;
      }

      const payload = {
        ...formData,
        image_url: uploadedImageUrl,
        company_id: creatorCompanyId,
      };

      const idToken = await currentUser.getIdToken(true);

      const response = await fetch('http://localhost:5000/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (uploadedImageUrl && data?.userId && uploadedImageUrl !== data.image_url) {
          await fetch(`http://localhost:5000/api/admin/users/${data.userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
              role: formData.role,
              image_url: uploadedImageUrl,
              linkedin: formData.linkedin
            }),
          });
        }

        setStatus({ message: `Account Created`, type: 'success' });
        setFormData({
          email: '',
          password: '',
          name: '',
          role: 'employee',
          image_url: '',
          teamId: '',
          linkedin: ''
        });
        setImageFile(null);
        setImagePreview('');
      } else {
        const detailsSuffix = data?.details ? ` (${data.details})` : '';
        setStatus({ message: `Error: ${data.error}${detailsSuffix}`, type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Failed to connect to backend', type: 'error' });
    }
  };

  return (
    <>
      <div className="create-user-page">
        <div className="create-user-container">
          <div className="create-user-header">
            <div>
              <h1 className="create-user-title">Create New User</h1>
            </div>
            <button 
              type="button" 
              className="create-user-back-btn" 
              onClick={() => navigate('/hr-dashboard')}
            >
              Back to Dashboard
            </button>
          </div>

          <div className="create-user-section">
            <div className="create-user-section-header">
              <div className="create-user-section-icon"></div>
              <h2 className="create-user-section-title">User Details</h2>
            </div>

            <div className="create-user-card">
              <form onSubmit={handleSubmit} className="create-user-form">
                <div className="create-user-form-grid">
                  <input 
                    className="create-user-input"
                    name="name" 
                    placeholder="Name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                  <input 
                    className="create-user-input"
                    name="email" 
                    type="email" 
                    placeholder="Email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                  <input 
                    className="create-user-input"
                    name="password" 
                    type="password" 
                    minLength={8} 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />

                  <input 
                    className="create-user-input"
                    name="linkedin" 
                    type="url" 
                    placeholder="LinkedIn Profile URL (Optional)" 
                    value={formData.linkedin} 
                    onChange={handleChange} 
                  />

                  <select 
                    className="create-user-select"
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
                    className="create-user-select"
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>

                  <select 
                    className="create-user-select"
                    name="jobDescription" 
                    value={formData.jobDescription} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Job Description</option>
                    {jobDescriptions.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title}
                      </option>
                    ))}
                  </select>

                  <div className="create-user-avatar-section">
                    <label htmlFor="create-user-image" className="create-user-avatar-label">
                      <img
                        src={imagePreview || formData.image_url || DEFAULT_AVATAR_URL}
                        alt="User avatar"
                        className="create-user-avatar-preview"
                      />
                      <span className="create-user-avatar-hint">Click the image to change</span>
                    </label>
                    <input
                      id="create-user-image"
                      className="create-user-file-input"
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

                <button type="submit" className="create-user-submit-btn">
                  Create User
                </button>
              </form>

              {status.message && (
                <p
                  className={`create-user-message ${
                    status.type === 'error' 
                      ? 'create-user-error' 
                      : status.type === 'success'
                      ? 'create-user-success'
                      : 'create-user-info'
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
};

export default CreateUser;