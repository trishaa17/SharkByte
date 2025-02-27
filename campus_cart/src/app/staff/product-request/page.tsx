'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from "../../../lib/firebase"; // Adjust the import to your Firebase setup
import './tags.css';

const db = firestore;

// Utility function to format the date to yyyy-mm-dd
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate(); // If timestamp is a Firestore timestamp, use toDate()
  return date.toISOString().split('T')[0]; // Returns the date in yyyy-mm-dd format
};

const ProductRequestsPage = () => {
  const [preOrders, setPreOrders] = useState([]);
  const [orderRequests, setOrderRequests] = useState([]);
  const [inventory, setInventory] = useState([]); // Added state for inventory
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pre-orders');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  useEffect(() => {
    const fetchPreOrders = async () => {
      const preOrdersRef = collection(db, 'preorders');
      const snapshot = await getDocs(preOrdersRef);
      const preOrdersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPreOrders(preOrdersData);
    };

    const fetchOrderRequests = async () => {
      const buyRequestRef = collection(db, 'buyRequest');
      const snapshot = await getDocs(buyRequestRef);
      const orderRequestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrderRequests(orderRequestsData);
    };

    const fetchInventory = async () => {
      const inventoryRef = collection(db, 'inventory');
      const snapshot = await getDocs(inventoryRef);
      const inventoryData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInventory(inventoryData);
    };

    fetchPreOrders();
    fetchOrderRequests();
    fetchInventory(); // Fetch inventory
  }, []);

  // Function to get current inventory quantity based on product name
  const getCurrentInventory = (productName) => {
    if (!productName) return 0; // Return 0 if productName is undefined or null
    const inventoryItem = inventory.find((item) => item.name.toLowerCase() === productName.toLowerCase());
    return inventoryItem ? inventoryItem.quantity : 0; // Default to 0 if not found
  };

  // Function to handle "Complete", "Back in Stock" or "Unavailable" button click
  const handleActionClick = async (id, action, productName) => {
    const currentInventory = getCurrentInventory(productName);

    if (action === 'complete') {
      // Update the status to 'completed'
      const orderRequestRef = doc(db, 'buyRequest', id);
      await updateDoc(orderRequestRef, {
        status: 'completed',
      });
      // Update the orderRequests state to reflect the change
      setOrderRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: 'completed' } : request
        )
      );
    } else if (action === 'backInStock') {
      // Update status to 'available' when stock is available
      const preorderRef = doc(db, 'preorders', id);
      await updateDoc(preorderRef, {
        status: 'available',
      });
      // Update the preOrders state to reflect the change
      setPreOrders((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: 'available' } : request
        )
      );
    } else if (action === 'unavailable') {
      // Update status to 'unavailable'
      const preorderRef = doc(db, 'preorders', id);
      await updateDoc(preorderRef, {
        status: 'unavailable',
      });
      // Update the preOrders state to reflect the change
      setPreOrders((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: 'unavailable' } : request
        )
      );
    }
  };

  // Filter preorders to only show those with status 'pending'
  const filteredPreOrders = preOrders.filter((request) =>
    request.status === 'pending' &&
    (request.userFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.productName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!fromDate || new Date(request.date) >= new Date(fromDate)) &&
    (!toDate || new Date(request.date) <= new Date(toDate))
  );

  const filteredOrderRequests = orderRequests.filter((request) => {
    // Check if purchasedAt exists and is a Firestore timestamp
    const purchasedDate = request.purchasedAt && request.purchasedAt.toDate ? request.purchasedAt.toDate() : new Date(request.purchasedAt);
  
    return (
      (request.userFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.productName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!fromDate || new Date(purchasedDate) >= new Date(fromDate)) &&
      (!toDate || new Date(purchasedDate) <= new Date(toDate))
    );
  });
  

  return (
    <div className="product-requests-container">
      <h1 className="page-title">Product Requests</h1>
      <div className="search-tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pre-orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('pre-orders')}
          >
            Pre-orders
          </button>
          <button
            className={`tab ${activeTab === 'order-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('order-requests')}
          >
            Order Requests
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by User Name or Item Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="date-filters">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="date-input"
            />
            <span>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      </div>

      {activeTab === 'pre-orders' ? (
        <table className="requests-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Item</th>
              <th>Quantity Ordered</th>
              <th>Current Inventory</th>
              <th className="action-header">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPreOrders.map((request) => (
              <tr key={request.id}>
                <td>{formatDate(request.preorderedOn)}</td>
                <td>
                  <div>{`${request.userFirstName} ${request.userLastName}`}</div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>{request.userEmail}</div> 
                </td>
                <td>{request.productName}</td>
                <td>{request.quantity}</td>
                <td>{getCurrentInventory(request.productName)}</td>
                <td className="action-cell">
                  <div className="stacked-buttons">
                    {getCurrentInventory(request.productName) > 0 && (
                      <button
                        className="action-button green"
                        onClick={() => handleActionClick(request.id, 'backInStock', request.productName)}
                      >
                        Back in stock
                      </button>
                    )}
                    <button
                      className="action-button red"
                      onClick={() => handleActionClick(request.id, 'unavailable', request.productName)}
                    >
                      Unavailable
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      ) : (
        <table className="requests-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Item</th>
              <th>Quantity Ordered</th>
              <th>Status</th>
              <th className="action-header">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrderRequests.map((request) => (
              <tr key={request.id}>
                <td>{formatDate(request.purchasedAt)}</td>
                <td>
                  <div>{`${request.userFirstName} ${request.userLastName}`}</div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>{request.userEmail}</div> {/* Updated email styling */}
                </td>
                <td>{request.productName}</td>
                <td>{request.quantity}</td>
                <td>
                  <div className={`status-label ${request.status}`}>
                    {request.status === 'pending' ? 'Pending' : 'Completed'}
                  </div>
                </td>
                <td className="action-cell">
                  {/* Show "Complete" button only if status is "pending" */}
                  {request.status === 'pending' && (
                    <button
                      className="action-button green"
                      onClick={() => handleActionClick(request.id, 'complete', request.productName)}
                    >
                      Complete
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductRequestsPage;
