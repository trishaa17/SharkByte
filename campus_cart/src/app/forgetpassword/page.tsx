'use client';

import { useState } from 'react';
import { auth, sendPasswordResetEmail } from '../../lib/firebase'; // Adjust path to firebase.ts
import { useRouter } from 'next/navigation'; // Next.js router for redirection

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      // Send password reset email using Firebase
      await sendPasswordResetEmail(auth, email);
      
      // Clear any existing error
      setError('');

      // Show success message
      setSuccess('Password reset email sent! Check your inbox.');

      // Clear the email field after success
      setEmail('');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else {
        setError('Error sending password reset email. Please try again.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side (green background) */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#006400',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <h2>Reset Your Password</h2>
      </div>

      {/* Right side (white background and form) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'white',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '32px', color: 'black' }}>Campus Cart</h1>
          </div>

          {/* Error message */}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          {/* Success message */}
          {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

          <form onSubmit={handleSubmit}>

            {/* Email Input */}
            <div style={{ marginBottom: '50px', marginTop: '20px' }}>
              <label htmlFor="email" style={{ color: 'black', fontSize: '14px' }}>
                Enter your email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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

            {/* Reset Password Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: '#555555',
                  borderRadius: '25px',
                  color: 'white',
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Send Reset Email
              </button>
            </div>
          </form>

          {/* Redirect to Login Link */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: 'black'}}>
              Remembered your password?{' '}
              <a href="/login" style={{ textDecoration: 'underline'}}>
                Log in here.
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
