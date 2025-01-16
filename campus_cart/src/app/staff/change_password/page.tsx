'use client';

import { useState, useEffect } from 'react';
import { auth, reauthenticateUser, updateUserPassword } from '../../../lib/firebase'; // Updated import from firebase.ts
import { useRouter } from 'next/navigation'; // Next.js router for redirection

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(''); // Track user email
  const router = useRouter();

  useEffect(() => {
    // Get the current user and set email if available
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    } else {
      setUserEmail(null);
    }
  }, []); // Run once on mount to check user status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Get the current user
      const user = auth.currentUser;

      if (user) {
        // Reauthenticate user with their current password
        await reauthenticateUser(user, currentPassword);

        // Update password
        await updateUserPassword(user, newPassword);

        // Show success message
        setError('');
        setSuccess('Password updated successfully!');

        // Redirect to the login page after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError('No user is logged in.');
      }
    } catch (error: any) {
      setError('Error updating password. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top right corner user email */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        color: 'black',
        fontSize: '14px'
      }}>
        {userEmail}
      </div>

      {/* Bottom section with white background and form */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',  // Align to the top
          padding: '60px 20px',  // Adjusted padding to move content higher
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontWeight: 'bold', fontSize: '32px', color: 'black' }}>Change Password</h2>
          </div>

          {/* Error message */}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          {/* Success message */}
          {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

          <form onSubmit={handleSubmit}>
            {/* Current Password Input */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="currentPassword" style={{ color: 'black', fontSize: '14px'}}>
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  marginTop: '5px',
                  fontSize: '14px',
                  color: 'black',
                }}
              />
            </div>

            {/* New Password Input */}
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
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  marginTop: '5px',
                  fontSize: '14px',
                  color: 'black',
                }}
              />
            </div>

            {/* Confirm New Password Input */}
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
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  marginTop: '5px',
                  fontSize: '14px',
                  color: 'black',
                }}
              />
            </div>

            {/* Change Password Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#30368A',
                  borderRadius: '25px',
                  color: 'white',
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
