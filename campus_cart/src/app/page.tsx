// src/app/page.tsx
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [userType, setUserType] = useState<'student' | 'staff' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType && email && password) {
      // Handle login logic here (e.g., redirect to a specific page based on user type)
      alert(`Logging in as ${userType}`);
    } else {
      alert('Please fill out all fields.');
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

          <form onSubmit={handleSubmit}>
            {/* Student or Staff selection */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <label style={{ color: 'black', fontSize: '16px' }}>
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={userType === 'student'}
                  onChange={() => setUserType('student')}
                  style={{ marginRight: '10px' }}
                />
                Student
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
                  padding: '10px',
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
                  padding: '10px',
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
              <a href="#" style={{ fontSize: '12px', color: 'black' }}>
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
        </div>
      </div>
    </div>
  );
}

