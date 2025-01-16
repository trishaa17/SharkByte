'use client';

import React, { useState } from 'react';
import './tags.css';

const ProductRequestsPage = () => {
  const [preOrders, setPreOrders] = useState([
    {
      id: 1,
      email: 'user1@example.com',
      firstName: 'Alice',
      lastName: 'Green',
      item: 'Coffee Mug',
      quantity: 3,
      date: '2025-01-20',
      imageUrl: 'https://example.com/images/coffeemug.jpg',
      currentInventory: 50,
      status: 'pending',
    },
    {
      id: 2,
      email: 'user2@example.com',
      firstName: 'Bob',
      lastName: 'White',
      item: 'T-Shirt',
      quantity: 2,
      date: '2025-01-18',
      imageUrl: 'https://example.com/images/tshirt.jpg',
      currentInventory: 15,
      status: 'completed',
    },
    {
      id: 3,
      email: 'user3@example.com',
      firstName: 'Charlie',
      lastName: 'Black',
      item: 'Backpack',
      quantity: 4,
      date: '2025-01-19',
      imageUrl: 'https://example.com/images/backpack.jpg',
      currentInventory: 30,
      status: 'pending',
    },
  ]);

  const [orderRequests, setOrderRequests] = useState([
    {
      id: 1,
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      item: 'Notebook',
      quantity: 5,
      date: '2025-01-15',
      imageUrl: 'https://example.com/images/notebook.jpg',
      currentInventory: 50,
      status: 'pending',
    },
    {
      id: 2,
      email: 'user2@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      item: 'Pencil',
      quantity: 10,
      date: '2025-01-14',
      imageUrl: 'https://example.com/images/pencil.jpg',
      currentInventory: 30,
      status: 'completed',
    },
    {
      id: 3,
      email: 'user3@example.com',
      firstName: 'Sam',
      lastName: 'Lee',
      item: 'Eraser',
      quantity: 3,
      date: '2025-01-16',
      imageUrl: 'https://example.com/images/eraser.jpg',
      currentInventory: 20,
      status: 'pending',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pre-orders');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleActionClick = (id, action) => {
    if (action === 'backInStock' || action === 'unavailable') {
      setPreOrders((prevRequests) =>
        prevRequests.filter((request) => request.id !== id)
      );
    } else if (action === 'complete') {
      setPreOrders((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: 'completed' } : request
        )
      );
      setOrderRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: 'completed' } : request
        )
      );
    }
  };
  

  const filteredPreOrders = preOrders.filter((request) =>
    (request.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!fromDate || new Date(request.date) >= new Date(fromDate)) &&
    (!toDate || new Date(request.date) <= new Date(toDate))
  );

  const filteredOrderRequests = orderRequests.filter((request) =>
    (request.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!fromDate || new Date(request.date) >= new Date(fromDate)) &&
    (!toDate || new Date(request.date) <= new Date(toDate))
  );

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
                <td>{request.date}</td>
                <td>
                  <div>{`${request.firstName} ${request.lastName}`}</div>
                  <div>{request.email}</div>
                </td>
                <td>
                  <div>
                    <img
                      src={request.imageUrl}
                      alt={request.item}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div>{request.item}</div>
                  </div>
                </td>
                <td>{request.quantity}</td>
                <td>{request.currentInventory}</td>
                <td className="action-cell">
                  <div className="stacked-buttons">
                    <button
                      className="action-button green"
                      onClick={() => handleActionClick(request.id, 'backInStock')}
                    >
                      Back in stock
                    </button>
                    <button
                      className="action-button red"
                      onClick={() => handleActionClick(request.id, 'unavailable')}
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
                <td>{request.date}</td>
                <td>
                  <div>{`${request.firstName} ${request.lastName}`}</div>
                  <div>{request.email}</div>
                </td>
                <td>
                  <div>
                    <img
                      src={request.imageUrl}
                      alt={request.item}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div>{request.item}</div>
                  </div>
                </td>
                <td>{request.quantity}</td>
                <td>
                  <span
                    className={`status-label ${
                      request.status === 'completed' ? 'completed' : 'pending'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td className="action-cell">
                  {request.status === 'pending' && (
                    <button
                      className="complete-button"
                      onClick={() => handleActionClick(request.id, 'complete')}
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
