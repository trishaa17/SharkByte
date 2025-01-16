'use client';

import { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../../lib/firebase'; // Adjust the path to firebase.ts
import { useRouter } from 'next/navigation'; // Next.js router for redirect

export default function HomePage() {
  const [userType, setUserType] = useState<'resident' | 'staff' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Router for redirection after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userType && email && password) {
      try {
        // Sign in with Firebase
        await signInWithEmailAndPassword(auth, email, password);
        
        // On successful login, redirect user based on userType
        if (userType === 'resident') {
          router.push('/resident-dashboard'); // Example path for residents
        } else if (userType === 'staff') {
          router.push('/admin/inventory'); 
        }
      } catch (error) {
        setError('Invalid email or password. Please try again.');
      }
    } else {
      setError('Please fill out all fields.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side (green background) */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#30368A',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
        }}
      >
        <h2>Welcome to Campus Cart</h2>
      </div>

      {/* Right side (white background and login form) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'white', // Set white background here
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '32px', color: 'black' }}>Campus Cart</h1>
          </div>

          {/* Error message */}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            {/* Resident or Staff selection */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <label style={{ color: 'black', fontSize: '16px' }}>
                <input
                  type="radio"
                  name="userType"
                  value="resident"
                  checked={userType === 'resident'}
                  onChange={() => setUserType('resident')}
                  style={{ marginRight: '10px' }}
                />
                Resident
              </label>
              <label style={{ marginLeft: '20px', color: 'black', fontSize: '16px' }}>
                <input
                  type="radio"
                  name="userType"
                  value="staff"
                  checked={userType === 'staff'}
                  onChange={() => setUserType('staff')}
                  style={{ marginRight: '10px' }}
                />
                Staff
              </label>
            </div>

            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{ color: 'black', fontSize: '14px' }}>
                Email
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

            {/* Password Input */}
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="password" style={{ color: 'black', fontSize: '14px' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

            {/* Forgot Password */}
            <div style={{ textAlign: 'right', marginBottom: '40px' }}>
              <a href="/forgetpassword" style={{ fontSize: '12px', color: 'black' }}>
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
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
                Log In
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: 'black'}}>
              Don't have an account?{' '}
              <a href="/signup" style={{ textDecoration: 'underline'}}>
                Sign up here.
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
