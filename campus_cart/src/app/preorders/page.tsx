'use client';

import React, { useState } from 'react';
import './tags.css';

const PreOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('All orders');
  const [orders, setOrders] = useState([
    {
      id: 1,
      name: 'Cup',
      status: 'Available',
      image: 'https://via.placeholder.com/150',
      date: '2025-01-15',
      quantity: 2,
    },
    {
      id: 2,
      name: 'Milo packet',
      status: 'Unavailable',
      image: 'https://via.placeholder.com/150',
      date: '2025-01-10',
      quantity: 3,
    },
    {
      id: 3,
      name: 'Black pen',
      status: 'Pending',
      image: 'https://via.placeholder.com/150',
      date: '2025-01-12',
      quantity: 5,
    },
  ]);

  const [popupMessage, setPopupMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleRemoveProduct = (id, name) => {
    const updatedOrders = orders.filter((order) => order.id !== id);
    setOrders(updatedOrders);

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
