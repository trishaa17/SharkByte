'use client';

import React, { useState, useEffect } from 'react';
import { firestore } from '../../../lib/firebase'; // Import firebase functions
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; // Import the password reset function
import AddUserModal from './signup-popup'; // Import the AddUserModal

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]); // State to store the list of users
  const [search, setSearch] = useState<string>(''); // Search term for user search
  const [filter, setFilter] = useState<string>(''); // Filter for staff or residents
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control modal visibility

  useEffect(() => {
    fetchUsers();
  }, [filter, search]);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    let usersRef = collection(firestore, 'users'); // Firestore collection
    let q = query(usersRef);

    // Apply filter if any
    if (filter) {
      q = query(usersRef, where('userType', '==', filter.toLowerCase())); // Convert filter to lowercase
    }

    // Apply search by firstName and lastName if any
    if (search) {
      q = query(
        usersRef,
        where('firstName', '>=', search),
        where('firstName', '<=', search + '\uf8ff')
      );
      // Adding search for lastName as well
      q = query(
        usersRef,
        where('lastName', '>=', search),
        where('lastName', '<=', search + '\uf8ff')
      );
    }

    const querySnapshot = await getDocs(q);
    const usersList = querySnapshot.docs.map((doc) => doc.data());
    setUsers(usersList);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  // Handle user deletion
  const handleDelete = async (userId: string) => {
    // Delete the user from Firestore
    const userRef = doc(firestore, 'users', userId);
    await deleteDoc(userRef);
    console.log(`Deleted user with ID: ${userId}`);
    fetchUsers(); // Refresh the users list
  };

  // Handle password reset
  const handlePasswordReset = async (email: string) => {
    try {
      const auth = getAuth(); // Get the Firebase auth instance
      await sendPasswordResetEmail(auth, email); // Send password reset email
      alert('Password reset email sent!'); // Notify the admin or user
    } catch (error) {
      console.error('Error sending password reset email:', error);
      alert('Failed to send password reset email. Please try again later.');
    }
  };

  // Handle add new user
  const handleAddUser = () => {
    setIsModalOpen(true); // Open the add user modal
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the add user modal
  };

  return (
    <div>
      <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '20px' }}>Manage Users</h2>

      {/* Search bar and Filter Dropdown */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold', fontSize: '18px' }}>
            All Users: {users.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by Name"
            value={search}
            onChange={handleSearchChange}
            style={{
              padding: '8px 12px',
              border: '1px solid grey',
              borderRadius: '10px',
              marginRight: '10px',
              fontSize: '14px',
              height: '40px',
              width: '200px',
            }}
          />
          <select
            onChange={handleFilterChange}
            value={filter}
            style={{
              padding: '8px 12px',
              border: '1px solid grey',
              borderRadius: '10px',
              fontSize: '14px',
              marginRight: '10px',
              width: '200px',
              height: '40px',
              paddingRight: '20px',
              appearance: 'none',
              background: 'url("data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill%3D%22%23A9A9A9%22%20d%3D%22M3%205.5L6%208.5L9%205.5%22%2F%3E%3C%2Fsvg%3E") no-repeat scroll right 10px center',
              backgroundSize: '15px',
            }}
          >
            <option value="">All Roles</option>
            <option value="staff">Staff</option>
            <option value="resident">Resident</option>
          </select>
          <button
            onClick={handleAddUser}
            style={{
              backgroundColor: '#30368A',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              height: '40px',
            }}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* User Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>User Type</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ textAlign: 'left', padding: '8px' }}>
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}
              </td>
              <td style={{ textAlign: 'left', padding: '8px' }}>{user.email}</td>
              <td style={{ textAlign: 'left', padding: '8px' }}>{user.userType}</td>
              <td style={{ textAlign: 'left', padding: '8px', display: 'flex', justifyContent: 'space-between' }}>
                {/* Change Password button */}
                <button
                  onClick={() => handlePasswordReset(user.email)} // Send password reset email
                  style={{
                    backgroundColor: '#D3D3D3', // Grey color for change password button
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    height: '40px',
                  }}
                >
                  Reset Password
                </button>

                {/* Rubbish Bin (Delete) Icon */}
                <button
                  onClick={() => handleDelete(user.id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF6347" // Rubbish bin icon color (red)
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M9 6v14h6V6h3l-1-3H7l-1 3h3zm3 0v14h6V6H9z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* AddUserModal */}
      <AddUserModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default ManageUsers;
