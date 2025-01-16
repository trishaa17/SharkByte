import React, { useState } from 'react';
import { auth, updatePasswordForUser } from '../../../lib/firebase'; // Adjust path to firebase.ts

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string; // Admin specifies which user to update
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, userId }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Assuming the updatePasswordForUser function is set up to update the password
      await updatePasswordForUser(userId, newPassword); // Admin changes the password of the specified user
      setSuccess('Password changed successfully!');
      setError('');
      setTimeout(() => {
        onClose(); // Close modal after 2 seconds
      }, 2000);
    } catch (error: any) {
      setError('Error changing password. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '10px',
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontWeight: 'bold', fontSize: '32px', color: 'black', marginBottom: '20px' }}>Change Password</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="newPassword" style={{ color: 'black', fontSize: '14px' }}>
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              style={{
                width: '100%',
                padding: '5px',
                border: 'none',
                borderBottom: '2px solid gray',
                marginTop: '5px',
                fontSize: '14px',
                color: 'black',
              }}
            />
          </div>

          <div style={{ marginBottom: '50px' }}>
            <label htmlFor="confirmNewPassword" style={{ color: 'black', fontSize: '14px' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              style={{
                width: '100%',
                padding: '5px',
                border: 'none',
                borderBottom: '2px solid gray',
                marginTop: '5px',
                fontSize: '14px',
                color: 'black',
              }}
            />
          </div>

          {/* Button container */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <button
              type="submit"
              style={{
                width: '80%',
                padding: '15px',
                backgroundColor: '#555555',
                borderRadius: '25px',
                color: 'white',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '15px', // Space between buttons
              }}
            >
              Change Password
            </button>

            <button
              onClick={onClose}
              style={{
                width: '80%',
                padding: '15px',
                backgroundColor: '#FF6347',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '25px',
              }}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
