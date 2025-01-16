import React, { useState, useEffect } from 'react';
import { firestore } from '../../../lib/firebase';
import { collection, addDoc, Timestamp, query, getDocs } from 'firebase/firestore'; // Firestore functions
import './Credits.css';

const Credits = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [voucherType, setVoucherType] = useState('food');
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('Pending'); // Default status is Pending
  const [showPopup, setShowPopup] = useState(false); // State for showing the popup
  const [userRequests, setUserRequests] = useState<any[]>([]); // State to store the user's requests
  const [filter, setFilter] = useState('All'); // State for filtering requests

  // Fetch all voucher requests from Firestore
  const fetchUserRequests = async () => {
    try {
      const q = query(collection(firestore, 'voucherRequests')); // Fetch all requests
      const querySnapshot = await getDocs(q);
      const requestsList: any[] = [];
      querySnapshot.forEach((doc) => {
        requestsList.push({ id: doc.id, ...doc.data() });
      });
      setUserRequests(requestsList); // Set the fetched data to the state
    } catch (e) {
      console.error('Error fetching requests: ', e);
    }
  };

  // Handle form submission and add the request to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add voucher request to Firestore
    try {
      const docRef = await addDoc(collection(firestore, 'voucherRequests'), {
        voucherType,
        amount,
        reason,
        status,
        date: Timestamp.fromDate(new Date()), // Set the current date
      });
      console.log('Voucher request submitted with ID: ', docRef.id);

      // Show the success popup
      setShowPopup(true);

      // Fetch the updated requests after submission
      fetchUserRequests();

      // Optionally, reset form fields after submission
      setVoucherType('food');
      setAmount(0);
      setReason('');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup when the close button is clicked
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchUserRequests(); // Fetch all voucher requests when the "View Requests" tab is active
    }
  }, [activeTab]);

  // Filter requests based on the selected status
  const filteredRequests =
    filter === 'All'
      ? userRequests
      : userRequests.filter((request) => request.status === filter);

  return (
    <div className="credits-page">
      <div className="credits-header">
        <p className="credits-line">120 Credits Remaining</p>
      </div>
      <div className="credits-container">
        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 0 ? 'active' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            Request Voucher
          </button>
          <button
            className={`tab ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            View Requests
          </button>
        </div>

        <div className="credits-content">
          {/* Voucher Request Form */}
          {activeTab === 0 && (
            <div className="form-container">
              <h2>Request a Voucher</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="voucherType">Voucher Type</label>
                  <select
                    id="voucherType"
                    name="voucherType"
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                  >
                    <option value="food">Food</option>
                    <option value="books">Books</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Amount</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason</label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why do you need this voucher?"
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Submit Request
                </button>
              </form>
            </div>
          )}

          {/* View Requests Section */}
          {activeTab === 1 && (
            <div className="requests-container">
              <h2>Your Voucher Requests</h2>

              {/* Filter Dropdown */}
              <div className="filter-container">
                <label htmlFor="filter">Filter by Status:</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Voucher Type</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.voucherType}</td>
                      <td>{request.amount} Credits</td>
                      <td>{request.reason}</td>
                      <td>
                        <span
                          className={`status-badge ${request.status.toLowerCase()}`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRequests.length === 0 && (
                <p>No voucher requests found for the selected filter.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Request Submitted</h3>
            <p>Please check the status of your request under "View Requests".</p>
            <button onClick={handleClosePopup} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credits;
