'use client';

import { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../../lib/firebase'; // Adjust the path to firebase.ts
import { doc, getDoc } from 'firebase/firestore'; // Firestore methods
import { db } from '../../lib/firebase'; // Firestore instance
import { useRouter } from 'next/navigation';
export default function HomePage() {
  const [userType, setUserType] = useState<'resident' | 'staff' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType) {
      setError('Please select Resident or Staff.');
      return;
    }

    if (email && password) {
      try {
        // Sign in with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User Data:", userData);  // Log the user data to check the structure

          const userRole = userData?.userType;  // Ensure role exists in the user data
          console.log("User Role:", userRole); // Check the role value

          // Check if userRole matches the selected userType
          if (userRole === userType) {
            // Redirect to respective dashboard
            if (userRole === 'resident') {
              router.push('/user/home'); // Example path for residents
            } else if (userRole === 'staff') {
              router.push('/staff/inventory'); // Example path for staff
            }
          } else {
            setError(`You do not have access as ${userType}.`);
          }
        } else {
          setError('User data not found. Please contact support.');
        }
      } catch (error) {
        console.error(error);  // Log the error to check what happened
        setError('Invalid email or password. Please try again.');
      }
    } else {
      setError('Please fill out all fields.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side with background image and transparency */}
      <div
        style={{
          flex: 1,
          backgroundImage: 'url(/Home.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Overlay with transparency */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Adjust the transparency here
          }}
        />
      </div>

      {/* Right side with login form */}
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
            <h1 style={{ fontWeight: 'bold', fontSize: '30px', color: 'black' }}>Welcome to Campus Cart</h1>
          </div>

          {/* Error message */}
          {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px'}}>{error}</p>}

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
            <p style={{ fontSize: '14px', color: 'black' }}>
              Don't have an account?{' '}
              <a href="/signup" style={{ textDecoration: 'underline' }}>
                Sign up here.
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
