import React, { useEffect, useState } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users on load
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (uid) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete-user/${uid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the user from the local state so the UI updates immediately
        setUsers(users.filter(user => user.firebaseUid !== uid));
        alert("User removed successfully.");
      } else {
        const errData = await response.json();
        alert(`Error: ${errData.error}`);
      }
    } catch (err) {
      alert("Failed to connect to server.");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div style={styles.container}>
      <h2>Manage Users</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.th}>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} style={styles.tr}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button 
                  onClick={() => handleDelete(user.firebaseUid)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: { padding: '20px', fontFamily: 'Arial' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { textAlign: 'left', borderBottom: '2px solid #ddd', padding: '10px' },
  tr: { borderBottom: '1px solid #eee' },
  deleteBtn: { backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }
};

export default UserList;