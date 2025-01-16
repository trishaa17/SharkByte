import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword } from '../../../lib/firebase'; // Adjust path to firebase.ts
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Import Firestore

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'resident' | 'staff' | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [credits] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!userType) {
      setError('Please select a user type');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const db = getFirestore();
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName,
        lastName,
        email: userCredential.user.email,
        userType,
        credits,
      });

      setError('');
      setSuccess('User added successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setError('Error creating user. Please try again.');
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
          position: 'relative',
        }}
      >
        {/* Close Icon */}
        <img
          src="/circle-cross.svg"
          alt="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            height: '25px',
            width: '25px',
            cursor: 'pointer',
          }}
        />

        <h1 style={{ fontWeight: 'bold', fontSize: '32px', color: 'black', marginBottom: '20px', textAlign: 'center' }}>
          Add User
        </h1>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
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

          {/* Form Fields */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="firstName" style={{ color: 'black', fontSize: '14px' }}>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
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

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="lastName" style={{ color: 'black', fontSize: '14px' }}>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
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

          {/* Email and Password */}
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

          <div style={{ marginBottom: '20px' }}>
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

          {/* Submit Button */}
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
                marginBottom: '15px',
              }}
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
