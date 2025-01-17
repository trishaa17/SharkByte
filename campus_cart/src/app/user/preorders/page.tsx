'use client';

import React, { useState, useEffect } from 'react';
import { firestore } from '../../../lib/firebase';
import { collection, query, getDocs, getDoc, where, doc, updateDoc } from 'firebase/firestore';
import { auth } from '../../../lib/firebase';
import './tags.css'; // Ensure this path is correct

const Preorders = () => {
  const [userPreorders, setUserPreorders] = useState<any[]>([]);
  const [filteredPreorders, setFilteredPreorders] = useState<any[]>([]);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchUserDetails = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
        } else {
          console.error('User details not found');
        }
      } catch (error) {
        console.error('Error fetching user details: ', error);
      } finally {
        setIsLoadingUser(false);
      }
    }
  };

  const fetchUserPreorders = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }
    try {
      const q = query(
        collection(firestore, 'preorders'),
        where('userEmail', '==', currentUser.email)
      );
      const querySnapshot = await getDocs(q);
      const preordersList: any[] = [];
      querySnapshot.forEach((doc) => {
        preordersList.push({ id: doc.id, ...doc.data() });
      });
      setUserPreorders(preordersList);
      setFilteredPreorders(preordersList); // Initially show all preorders
    } catch (e) {
      console.error('Error fetching preorders: ', e);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchUserPreorders();
  }, []);

  useEffect(() => {
    let filtered = userPreorders;

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(preorder => preorder.status === selectedStatus.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(preorder =>
        preorder.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preorder.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPreorders(filtered);
  }, [selectedStatus, searchTerm, userPreorders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'available':
        return 'green';
      case 'unavailable':
        return 'red';
      case 'bought':
        return 'blue';
      case 'cancelled':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Function to handle the "Buy Item" action
  const handleBuyItem = async (preorderId: string) => {
    try {
      const preorderRef = doc(firestore, 'preorders', preorderId);
      await updateDoc(preorderRef, { status: 'bought' });
      // Refresh preorders after updating the status
      fetchUserPreorders();
    } catch (error) {
      console.error('Error updating status to bought: ', error);
    }
  };

  // Function to handle the "Cancel Item" action
  const handleCancelItem = async (preorderId: string) => {
    try {
      const preorderRef = doc(firestore, 'preorders', preorderId);
      await updateDoc(preorderRef, { status: 'cancelled' });
      // Refresh preorders after updating the status
      fetchUserPreorders();
    } catch (error) {
      console.error('Error updating status to cancelled: ', error);
    }
  };

  return (
    <div className="product-requests-container">
      <div className="page-title">Preorders</div>

      <div className="search-tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setSelectedStatus('All'); setActiveTab('all'); }}
          >
            All
          </button>
          <button
            className={`tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => { setSelectedStatus('Available'); setActiveTab('available'); }}
          >
            Available
          </button>
          <button
            className={`tab ${activeTab === 'unavailable' ? 'active' : ''}`}
            onClick={() => { setSelectedStatus('Unavailable'); setActiveTab('unavailable'); }}
          >
            Unavailable
          </button>
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => { setSelectedStatus('Pending'); setActiveTab('pending'); }}
          >
            Pending
          </button>
          <button
            className={`tab ${activeTab === 'bought' ? 'active' : ''}`}
            onClick={() => { setSelectedStatus('Bought'); setActiveTab('bought'); }}
          >
            Bought
          </button>
          <button
            className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => { setSelectedStatus('Cancelled'); setActiveTab('cancelled'); }}
          >
            Cancelled
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Product or User Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="preorders-content">
        <h2>Your Preorders</h2>

        <table className="requests-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Preordered On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPreorders.map((preorder) => (
              <tr key={preorder.id}>
                <td>{preorder.productName}</td>
                <td>{preorder.quantity}</td>
                <td>{preorder.totalAmount}</td>
                <td>
                  <span className={`status-label ${getStatusColor(preorder.status)}`}>
                    {preorder.status.charAt(0).toUpperCase() + preorder.status.slice(1)}
                  </span>
                </td>
                <td>
                  {preorder.status === 'available' && (
                    <div className="stacked-buttons">
                      <button
                        className="action-button"
                        onClick={() => handleBuyItem(preorder.id)}
                      >
                        Buy Item
                      </button>
                      <button
                        className="action-button red"
                        onClick={() => handleCancelItem(preorder.id)}
                      >
                        Cancel Item
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPreorders.length === 0 && (
          <p>No preorders found.</p>
        )}
      </div>
    </div>
  );
};

export default Preorders;