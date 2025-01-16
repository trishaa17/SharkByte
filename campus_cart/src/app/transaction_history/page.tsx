'use client';

import React, { useState } from 'react';
import './tags.css';

const TransactionHistoryPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = [
    {
      id: 1,
      name: 'Cup',
      date: '2025-01-15',
      quantity: 2,
      creditsUsed: 20,
    },
    {
      id: 2,
      name: 'Milo packet',
      date: '2025-01-10',
      quantity: 3,
      creditsUsed: 30,
    },
    {
      id: 3,
      name: 'Black pen',
      date: '2025-01-12',
      quantity: 5,
      creditsUsed: 50,
    },
  ];

  // Filter transactions by date and search term
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const isInDateRange =
      (!startDate || transactionDate >= new Date(startDate)) &&
      (!endDate || transactionDate <= new Date(endDate));

    const matchesSearchTerm =
      transaction.name.toLowerCase().includes(searchTerm.toLowerCase());

    return isInDateRange && matchesSearchTerm;
  });

  return (
    <div className="preorders-container">
      {/* Title */}
      <h1 className="page-title">Transaction History</h1>

      {/* Tabs and Filter (Search before Date Filter) */}
      <div className="tabs-and-filter">
        {/* Search Filter */}
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Date Filter */}
        <div className="date-filter">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="to-text">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <table className="preorders-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Quantity Purchased</th>
            <th>Credits Used</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length === 0 ? (
            <tr>
              <td colSpan={4}>No transactions found</td>
            </tr>
          ) : (
            filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>
                  <div className="product-info">
                    <img
                      src="https://via.placeholder.com/50" // You can add specific images for the items
                      alt={transaction.name}
                      className="product-image"
                    />
                    <span>{transaction.name}</span>
                  </div>
                </td>
                <td>{transaction.quantity}</td>
                <td>{transaction.creditsUsed}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistoryPage;
