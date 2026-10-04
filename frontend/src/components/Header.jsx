import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';
import trainuLogo from '../assets/trainu-logo.png';

const navItems = [
  //{ label: 'Dashboard', to: '/employee-dashboard' },
  { label: 'Courses', to: '/course-list' },
  { label: 'My Learnings', to: '/my-trainings' },
  { label: 'My Teams', to: '/my-teams' },
  { label: 'HR Dashboard', to: '/hr-dashboard' },
];

function Header() {
  const { currentUser, mongoUser, logout } = useAuth();
  const navigate = useNavigate();
  const isManager = mongoUser?.role === 'manager' || mongoUser?.role === 'admin';
  const isAdmin = mongoUser?.role === 'admin';
  const [showFallbackIcon, setShowFallbackIcon] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const popupRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const notifPopupRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        popupRef.current && !popupRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);


  useEffect(() => {
    setShowFallbackIcon(false);
  }, [mongoUser?.image_url]);

  // Fetch notifications on load and set up polling
  useEffect(() => {
    if (!mongoUser?._id) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll 30s
    return () => clearInterval(interval);
  }, [mongoUser]);

  async function fetchNotifications() {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications?userId=${mongoUser._id}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }

  // Toggle notification popup and mark as read if opening
  async function handleOpenNotifications() {
    setShowNotifications(prev => !prev);
    if (!showNotifications && unreadCount > 0) {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: mongoUser._id })
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }

  // Close notification popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifRef.current && !notifRef.current.contains(e.target) &&
        notifPopupRef.current && !notifPopupRef.current.contains(e.target)
      ) setShowNotifications(false);
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  return (
    <>
    <header className="app-header">
      <div className="brand" aria-label="TrainU home" onClick={() => navigate('/my-trainings')} style={{ cursor: 'pointer' }}>
        <img src={trainuLogo} alt="TrainU+" className="brand-logo" style={{ height: '60px', objectFit: 'contain' }}/>
      </div>

      <nav className="header-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          if (item.label === 'My Teams' && !isManager) return null;
          if (item.label === 'HR Dashboard' && !isAdmin) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="header-actions" aria-label="Header actions">
        {currentUser && (
          <>
            <div className="notif-wrapper">
              <button
                type="button"
                className="icon-button"
                aria-label="Notifications"
                onClick={handleOpenNotifications}
                ref={notifRef}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 4a5 5 0 0 0-5 5v3.3l-1.4 2.8A1 1 0 0 0 6.5 17h11a1 1 0 0 0 .9-1.4L17 12.3V9a5 5 0 0 0-5-5Zm0 16a2.2 2.2 0 0 0 2.1-1.6H9.9A2.2 2.2 0 0 0 12 20Z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notif-popup" ref={notifPopupRef}>
                  <div className="notif-popup-header">
                    <span>Notifications</span>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <p className="notif-empty">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                          <p className="notif-title">{n.title}</p>
                          <p className="notif-message">{n.message}</p>
                          <span className="notif-date">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="profile-menu">
              <button 
                type="button" 
                className="icon-button profile-trigger" 
                aria-label="User profile"
                onClick={() => setShowUserMenu(!showUserMenu)}
                ref={menuRef}
              >
                {mongoUser?.image_url && !showFallbackIcon ? (
                  <img
                    src={mongoUser.image_url}
                    alt="Profile"
                    className="user-avatar"
                    onError={() => setShowFallbackIcon(true)}
                  />
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Zm0 2.2c-4.1 0-7.5 2.2-7.5 4.8a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1c0-2.6-3.4-4.8-7.5-4.8Z" />
                  </svg>
                )}
              </button>

              {showUserMenu && (
                <div className="user-profile-popup" ref={popupRef}>
                  <div className="popup-profile-card">
                    <div className="popup-header-section">
                      <div className="popup-avatar-container">
                        {mongoUser?.image_url && !showFallbackIcon ? (
                          <img
                            src={mongoUser.image_url}
                            alt="Profile"
                            className="popup-avatar"
                            onError={() => setShowFallbackIcon(true)}
                          />
                        ) : (
                          <div className="popup-avatar-fallback">
                            <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                              <path d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Zm0 2.2c-4.1 0-7.5 2.2-7.5 4.8a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1c0-2.6-3.4-4.8-7.5-4.8Z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="popup-user-info">
                        <h3 className="popup-user-name">{mongoUser?.name || currentUser?.email}</h3>
                        <p className="popup-user-email" title={currentUser?.email}>{currentUser?.email}</p>
                      </div>
                    </div>
                    
                    <div className="popup-actions">
                      <button 
                        className="popup-action-btn profile-btn" 
                        onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Zm0 2.2c-4.1 0-7.5 2.2-7.5 4.8a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1c0-2.6-3.4-4.8-7.5-4.8Z" />
                        </svg>
                        <span>View Profile</span>
                      </button>
                      
                      <button 
                        className="popup-action-btn logout-btn" 
                        onClick={handleLogout}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M5 2h9a1 1 0 0 1 1 1v1h2V3a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v18a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-1h-2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm15.293 9.293l-2.5 2.5a.999.999 0 1 1-1.414-1.414l1.793-1.793H11v-2h7.172l-1.793-1.793a.999.999 0 1 1 1.414-1.414l2.5 2.5a1 1 0 0 1 0 1.414Z" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
    </>
  );
}

export default Header;
