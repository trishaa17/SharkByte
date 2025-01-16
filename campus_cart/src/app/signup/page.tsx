'use client';

import { useState } from 'react';
import { auth, createUserWithEmailAndPassword } from '../../lib/firebase'; // Adjust path to firebase.ts
import { useRouter } from 'next/navigation'; // Next.js router for redirection
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Import Firestore

export default function SignUpPage() {
  const [firstName, setFirstName] = useState(''); // State for First Name
  const [lastName, setLastName] = useState(''); // State for Last Name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'resident' | 'staff' | null>(null); // Added userType state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Added success state
  const router = useRouter(); // Router for redirection after sign-up

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check if userType is selected
    if (!userType) {
      setError('Please select a user type (Resident or Staff)');
      return;
    }

    // Check if password length is less than 6 characters
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Check if email format is valid using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      // Sign up with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Get the Firestore instance
      const db = getFirestore();

      // Create a new user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName, // Save first name
        lastName, // Save last name
        email: userCredential.user.email,
        userType, // Save the userType
      });

      // Show success message
      setError(''); // Clear error message

      setSuccess('Sign-up successful! Redirecting to login...');

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login'); // Redirect to login page
      }, 2000);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists. Please log in or use a different email.');
      } else {
        setError('Error signing up. Please try again.');
      }
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
        <h2>Sign Up for Campus Cart</h2>
      </div>

      {/* Right side (white background and sign-up form) */}
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
            {/* Resident or Staff selection */}
            <div style={{ marginBottom: '20px', marginTop: '30px', textAlign: 'center' }}>
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

            {/* First Name Input */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="firstName" style={{ color: 'black', fontSize: '14px' }}>
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
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

            {/* Last Name Input */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="lastName" style={{ color: 'black', fontSize: '14px' }}>
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
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

            {/* Confirm Password Input */}
            <div style={{ marginBottom: '50px' }}>
              <label htmlFor="confirmPassword" style={{ color: 'black', fontSize: '14px' }}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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

            {/* Sign Up Button */}
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
                Sign Up
              </button>
            </div>
          </form>

          {/* Redirect to Login Link */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: 'black' }}>
              Already have an account?{' '}
              <a href="/login" style={{ textDecoration: 'underline' }}>
                Log in here.
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
