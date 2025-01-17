'use client';

import React, { useState, useEffect } from 'react';
import { firestore } from '../../../lib/firebase';
import { collection, addDoc, Timestamp, query, getDocs, doc, getDoc, where } from 'firebase/firestore'; // Firestore functions
import { auth } from '../../../lib/firebase'; // Assuming you have Firebase auth initialized
import './tags.css';

const Preorders = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [status, setStatus] = useState('Pending'); // Default status is Pending
  const [showPopup, setShowPopup] = useState(false); // State for showing the popup
  const [userPreorders, setUserPreorders] = useState<any[]>([]); // State to store the user's preorders
  const [filter, setFilter] = useState('All'); // State for filtering preorders
  const [userDetails, setUserDetails] = useState<any>(null); // State to store the user details
  const [isLoadingUser, setIsLoadingUser] = useState(true); // State to track user details loading

  // Fetch user details from Firestore
  const fetchUserDetails = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
        } else {
          console.error('User details not found in Firestore');
        }
      } catch (error) {
        console.error('Error fetching user details: ', error);
      } finally {
        setIsLoadingUser(false); // Mark loading as complete
      }
    }
  };

  // Fetch all preorders for the logged-in user from Firestore
  const fetchUserPreorders = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user is logged in');
      return;
    }

    try {
      // Query Firestore for preorders with the logged-in user's email
      const q = query(
        collection(firestore, 'preorders'),
        where('userEmail', '==', currentUser.email) // Filter by email
      );

      const querySnapshot = await getDocs(q);
      const preordersList: any[] = [];
      querySnapshot.forEach((doc) => {
        preordersList.push({ id: doc.id, ...doc.data() });
      });

      setUserPreorders(preordersList); // Update the state with filtered preorders
    } catch (e) {
      console.error('Error fetching preorders: ', e);
    }
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchUserPreorders(); // Fetch all preorders when the "View Preorders" tab is active
    }

    fetchUserDetails(); // Fetch user details when the component is mounted
  }, [activeTab]);

  // Filter preorders based on the selected status
  const filteredPreorders =
    filter === 'All'
      ? userPreorders
      : userPreorders.filter((preorder) => preorder.status === filter);

  return (
    <div className="preorders-page">
      <div className="preorders-header">
        <p className="preorders-line">
          {userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : 'Loading User...'}
        </p>
      </div>
      <div className="preorders-container">
        {/* Tab Navigation */}
        <div className="tabs">
          
          <button
            className={`tab ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            View Preorders
          </button>
        </div>

        {/* Filter by Status Tabs */}
        {activeTab === 1 && (
          <div className="status-tabs">
            <button
              className={`tab ${filter === 'All' ? 'active' : ''}`}
              onClick={() => setFilter('All')}
            >
              All
            </button>
            <button
              className={`tab ${filter === 'Pending' ? 'active' : ''}`}
              onClick={() => setFilter('Pending')}
            >
              Pending
            </button>
            <button
              className={`tab ${filter === 'Accepted' ? 'active' : ''}`}
              onClick={() => setFilter('Accepted')}
            >
              Accepted
            </button>
            <button
              className={`tab ${filter === 'Rejected' ? 'active' : ''}`}
              onClick={() => setFilter('Rejected')}
            >
              Rejected
            </button>
          </div>
        )}

        <div className="preorders-content">
          {/* View Preorders Section */}
          {activeTab === 1 && (
            <div className="preorders-container">
              <h2>Your Preorders</h2>

              <table className="preorders-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Preordered On</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPreorders.map((preorder) => (
                    <tr key={preorder.id}>
                      <td>{preorder.productName}</td>
                      <td>{preorder.quantity}</td>
                      <td>{preorder.totalAmount}</td>
                      <td>
                        <span
                          className={`status-badge ${preorder.status.toLowerCase()}`}
                        >
                          {preorder.status}
                        </span>
                      </td>
                      <td>{new Date(preorder.preorderedOn.seconds * 1000).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPreorders.length === 0 && (
                <p>No preorders found for the selected filter.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Preorder Submitted</h3>
            <p>Your preorder has been successfully submitted. Please check "View Preorders" to track its status.</p>
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preorders;
