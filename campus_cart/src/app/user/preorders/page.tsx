'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from "../../../lib/firebase"; // Update path if necessary
import './tags.css';

const PreOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('All orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const auth = getAuth();
  const db = firestore;

  // Fetch orders from Firebase based on the logged-in user
  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        alert('User is not authenticated');
        return;
      }
  
      // Show an alert with the current user's email
      alert(`Current User Email: ${user.email}`);
  
      try {
        const ordersRef = collection(db, 'preorders');
        const q = query(ordersRef, where("userEmail", "==", user.email)); // Filter by userEmail
        const querySnapshot = await getDocs(q);
  
        const fetchedOrders = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.productName,
            status: data.status,
            image: data.productImage || 'https://via.placeholder.com/150',
            date: data.preorderedOn?.toDate()?.toISOString().split('T')[0] || 'N/A', // Format date
            quantity: data.quantity,
          };
        });
  
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching preorders: ", error);
      }
    };
  
    fetchOrders();
  }, [auth, db]);
  


  const handleRemoveProduct = (id, name) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
    setPopupMessage(`${name} has been removed.`);
    setTimeout(() => setPopupMessage(''), 3000);
  };

  const handleBuyClick = (itemName: string) => {
    setSelectedItem(itemName);
    setShowConfirmation(true);
  };

  const handleConfirmPurchase = () => {
    setShowConfirmation(false);
    setPopupMessage(`${selectedItem} ordered`);
    setSelectedItem(null);
  };

  const handleCancelPurchase = () => {
    setShowConfirmation(false);
    setSelectedItem(null);
  };

  const handleClosePopup = () => {
    setPopupMessage('');
  };

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const isInDateRange =
      (!start || orderDate >= start) && (!end || orderDate <= end);

    return (
      (activeTab === 'All orders' || order.status === activeTab) &&
      isInDateRange
    );
  });

  return (
    <div className="preorders-container">
      <h1 className="page-title">Pre-order History</h1>

      {/* Popup Message for Remove Product */}
      {popupMessage && (
        <div className="popup-message">{popupMessage}</div>
      )}

      {/* Tabs and Date Filter */}
      <div className="tabs-and-filter">
        <div className="tabs">
          {['All orders', 'Available', 'Pending', 'Unavailable'].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="date-filter">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* White Background for Content */}
      <div className="white-box">
        {filteredOrders.length === 0 ? (
          <p>No pre-orders found</p>
        ) : (
          <table className="preorders-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Quantity Pre-ordered</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.date}</td>
                  <td>
                    <div className="product-info">
                      <img
                        src={order.image}
                        alt={order.name}
                        className="product-image"
                      />
                      <span>{order.name}</span>
                    </div>
                  </td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={`tag ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.status === 'Available' && (
                      <div className="action-buttons">
                        <button
                          className="buy-button"
                          onClick={() => handleBuyClick(order.name)}
                        >
                          Buy product
                        </button>
                        <button
                          className="remove-button"
                          onClick={() => handleRemoveProduct(order.id, order.name)}
                        >
                          Remove Product
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Popup for Buy Product */}
      {showConfirmation && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Do you confirm you want to purchase {selectedItem}?</p>
            <div className="popup-buttons">
              <button className="yes-button" onClick={handleConfirmPurchase}>
                Yes
              </button>
              <button className="no-button" onClick={handleCancelPurchase}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreOrdersPage;
