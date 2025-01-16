'use client';

import React, { useState, useEffect } from 'react';
import { firestore } from '../../../lib/firebase'; // Import firebase functions
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; // Import the password reset function
import AddUserModal from './signup-popup'; // Import the AddUserModal

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]); // State to store the list of users
  const [search, setSearch] = useState<string>(''); // Search term for user search
  const [filter, setFilter] = useState<string>(''); // Filter for staff or residents
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control modal visibility
  const [creditModalOpen, setCreditModalOpen] = useState<boolean>(false); // State to control credit modal visibility
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set()); // Set of selected user IDs
  const [selectAll, setSelectAll] = useState<boolean>(false); // State for the "select all" checkbox
  const [creditAmount, setCreditAmount] = useState<number>(0); // State to store the credit amount

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
    const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  // Handle credit modal close
  const handleCloseCreditModal = () => {
    setCreditModalOpen(false); // Close the credit modal
  };

  // Toggle individual user checkbox selection
  const handleUserCheckboxChange = (userId: string) => {
    const updatedSelection = new Set(selectedUsers);
    if (updatedSelection.has(userId)) {
      updatedSelection.delete(userId);
    } else {
      updatedSelection.add(userId);
    }
    setSelectedUsers(updatedSelection);
  };

  // Toggle select all checkboxes
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedUsers(new Set()); // Deselect all
    } else {
      const allUserIds = new Set(users.map((user) => user.id)); // Select all users
      setSelectedUsers(allUserIds);
    }
    setSelectAll(!selectAll); // Toggle "select all" state
  };

  // Open the credit modal
  const handleOpenCreditModal = () => {
    setCreditModalOpen(true); // Open the credit modal
  };

  // Handle credit addition to selected users
  const handleAddCredits = async () => {
    const updatedUsers = Array.from(selectedUsers);
    try {
      // Loop through the selected users and update their credit in Firestore
      for (const userId of updatedUsers) {
        const userRef = doc(firestore, 'users', userId);

        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const currentCredits = userData?.credits || 0;
        const newCreditAmount = currentCredits + creditAmount;


        await updateDoc(userRef, {
          credits: newCreditAmount, // Update the user's credit
        });
      }
      alert('Credits added successfully!');
      setCreditAmount(0); // Reset the credit amount
      setCreditModalOpen(false); // Close the modal
    } catch (error) {
      console.error('Error adding credits:', error);
      alert('Failed to add credits. Please try again later.');
    }
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
          <button
            onClick={handleOpenCreditModal}
            style={{
              backgroundColor: '#30368A',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              height: '40px',
              marginLeft: '10px',
              paddingBottom: '10px',
            }}
          >
            + Credits
          </button>
        </div>
      </div>

      {/* User Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllChange} // Select or deselect all checkboxes
                style={{
                  border: '1px solid grey',
                  backgroundColor: 'transparent',
                  borderRadius: '5px',
                  marginTop: '5px',
                  height: '20px',
                  width: '20px',
                }}
              />
            </th>
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
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={() => handleUserCheckboxChange(user.id)} // Handle individual user checkbox change
                  style={{
                    border: '1px solid grey',
                    backgroundColor: 'transparent',
                    borderRadius: '5px',
                    height: '20px',
                    width: '20px',
                  }}
                />
              </td>
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

      {/* Credit Modal */}
    {creditModalOpen && (
      <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', width: '300px', position: 'relative' }}>
          {/* Close Icon */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              cursor: 'pointer',
            }}
            onClick={handleCloseCreditModal} // Close the modal on click
          >
            <img
              src="/circle-cross.svg" // Replace with the path to your SVG icon
              alt="Close"
              style={{
                width: '20px',
                height: '20px',
              }}
            />
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}>Add Credits</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', marginTop: '30px' }}>
            <button
              style={{
                backgroundColor: '#30368A',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '16px',
              }}
              onClick={() => setCreditAmount(creditAmount + 1)}
            >
              +
            </button>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
              style={{
                width: '60px',
                padding: '5px',
                textAlign: 'center',
                border: '1px solid grey',
                borderRadius: '5px',
                fontSize: '16px',
                marginLeft: '10px',
                marginRight: '10px',
              }}
            />
            <button
              style={{
                backgroundColor: '#30368A',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '16px',
              }}
              onClick={() => setCreditAmount(creditAmount - 1)}
            >
              -
            </button>
          </div>
          <div style={{ marginBottom: '30px', marginTop: '30px' }}>
            <button
              onClick={handleAddCredits}
              style={{
                backgroundColor: '#30368A',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Add Credits
            </button>
          </div>
          <div style={{ marginBottom: '10px', textAlign: 'center', marginTop: '30px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>For Users:</span>
            <div style={{ marginTop: '10px' }}>
              <ul>
                {Array.from(selectedUsers).map((userId) => (
                  <li key={userId}>{users.find((user) => user.id === userId)?.firstName}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )}


      {/* AddUserModal */}
      <AddUserModal isOpen={isModalOpen} onClose={handleCloseModal} />
      
    </div>
  );
};

export default ManageUsers;
