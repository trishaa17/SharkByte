'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../../../lib/firebase'; // Import your Firebase initialization
import './tags.css';

const db = firestore;

interface Transaction {
  id: string;
  name: string;
  date: string; // Stored as an ISO string in Firestore
  quantity: number;
  creditsUsed: number;
  status: string; // Add this field for status
  imageUrl?: string; // Optional field for product image
}

const TransactionHistoryPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No user is logged in.');
          return;
        }

        const q = query(
          collection(db, 'buyRequest'),
          where('userEmail', '==', user.email)
        );

        const querySnapshot = await getDocs(q);
        const requestsList: Transaction[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Map Firestore document fields to Transaction type
          requestsList.push({
            id: doc.id,
            name: data.productName || 'Unknown Product', // Map "productName" to "name"
            date: data.purchasedAt?.toDate ? data.purchasedAt.toDate().toISOString() : '', // Convert Firestore timestamp
            quantity: data.quantity || 0,
            creditsUsed: data.totalAmount || 0, // Map "totalAmount" to "creditsUsed"
            status: data.status || 'Unknown', // Map "status"
          });
        });

        setTransactions(requestsList); // Update state with the transactions
      } catch (e) {
        console.error('Error fetching transactions:', e);
        setError('Failed to fetch transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const isInDateRange =
      (!startDate || transactionDate >= new Date(startDate)) && 
      (!endDate || transactionDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999))); // Include end date

    const matchesSearchTerm = transaction.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return isInDateRange && matchesSearchTerm;
  });

  const getStatusColor = (status: string) => {
    if (status.toLowerCase() === 'pending') {
      return '#FFD700'; // Darker shade of yellow for pending status
    } else if (status.toLowerCase() === 'completed') {
      return 'green'; // Green background for completed status
    }
    return 'gray'; // Default color for other statuses
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="preorders-container">
      <h1 className="page-title">Transaction History</h1>

      {/* Tabs and Filters */}
      <div className="tabs-and-filter">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search product"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="date-filter">
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
          />
          <span className="to-text">to</span>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>

      {/* Table */}
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <table className="preorders-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th style={{ textAlign: 'left' }}>Product</th>
              <th>Quantity Purchased</th>
              <th>Credits Used</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading...</td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={5}>No transactions found</td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    {new Date(transaction.date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false, // Display in 24-hour format
                    })}
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <div className="product-info">
                      <span>{transaction.name}</span>
                    </div>
                  </td>
                  <td>{transaction.quantity}</td>
                  <td>{transaction.creditsUsed}</td>
                  <td>
                    <span
                      style={{
                        backgroundColor: getStatusColor(transaction.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
