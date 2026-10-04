import { useState } from 'react';
import './HRNotifyModal.css';

function HRNotifyModal({ targetUsers = [], onClose, onSent }) {
  const [notifyType, setNotifyType] = useState('user');
  const [channel, setChannel] = useState('in_app');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const isBulk = targetUsers.length > 1;
  const displayName = isBulk
    ? `${targetUsers.length} users`
    : targetUsers[0]?.name || 'user';

  const handleSend = async () => {
    if (!message.trim()) return alert('Please enter a message.');
    try {
      setSending(true);

      await Promise.all(targetUsers.map(user =>
        fetch('http://localhost:5000/api/notifications/hr-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: user.id || user._id,
            managerId: user.managerId || null,
            notifyType,
            channel,
            message
          })
        })
      ));

      onSent?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Send Notification</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-subtitle">
            Notifying <strong>{displayName}</strong>
          </p>

          <label className="modal-label">Notify who?</label>
          <div className="modal-options">
            {['user', 'manager', 'both'].map(opt => (
              <button
                key={opt}
                className={`modal-option-btn ${notifyType === opt ? 'selected' : ''}`}
                onClick={() => setNotifyType(opt)}
              >
                {opt === 'user' ? 'Employee' : opt === 'manager' ? 'Manager' : 'Both'}
              </button>
            ))}
          </div>

          <label className="modal-label">Channel</label>
          <div className="modal-options">
            {['in_app', 'email', 'both'].map(opt => (
              <button
                key={opt}
                className={`modal-option-btn ${channel === opt ? 'selected' : ''}`}
                onClick={() => setChannel(opt)}
              >
                {opt === 'in_app' ? 'In-App' : opt === 'email' ? 'Email' : 'Both'}
              </button>
            ))}
          </div>

          <label className="modal-label">Message</label>
          <textarea
            className="modal-textarea"
            rows={4}
            placeholder="Write a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn send" onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : `Send to ${displayName}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HRNotifyModal;