'use client';

import React, { useState } from 'react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' },
  ]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');

  const handleAddUser = () => {
    if (!newUserName || !newUserEmail) {
      alert('Please fill in all fields.');
      return;
    }

    const newUser: UserProfile = {
      id: Date.now(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'active',
    };

    setUsers([...users, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('user');
  };

  const handleSuspendUser = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' } : user
      )
    );
  };

  const handleResetPassword = (id: number) => {
    alert(`Password for user ID ${id} has been reset.`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>User Management</h1>

      {/* Add User Section */}
      <div style={styles.addUserSection}>
        <h3>Add New User</h3>
        <input
          type="text"
          placeholder="Name"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          style={styles.input}
        />
        <select
          value={newUserRole}
          onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
          style={styles.select}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={handleAddUser} style={styles.addButton}>
          Add User
        </button>
      </div>

      {/* User List */}
      <div>
        <h2>Existing Users</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <button
                    onClick={() => handleSuspendUser(user.id)}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: user.status === 'active' ? '#dc3545' : '#28a745',
                    }}
                  >
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                  <button onClick={() => handleResetPassword(user.id)} style={styles.actionButton}>
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  addUserSection: {
    marginBottom: '30px',
  },
  input: {
    margin: '5px',
    padding: '8px',
    fontSize: '1rem',
    width: '200px',
  },
  select: {
    margin: '5px',
    padding: '8px',
    fontSize: '1rem',
    width: '200px',
  },
  addButton: {
    padding: '10px 15px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    textAlign: 'center',
  },
  actionButton: {
    margin: '5px',
    padding: '5px 10px',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default UserManagement;