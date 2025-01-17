'use client';

import React, { useEffect, useState } from 'react';
import { firestore } from '../../../lib/firebase';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import './VoucherRequests.css';

// Define a TypeScript interface for the request data
interface VoucherRequest {
  id: string;
  voucherType: string;
  amount: number;
  reason: string;
  status: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

const AdminVoucherRequests = () => {
  const [requests, setRequests] = useState<VoucherRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VoucherRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All'); // Default filter

  useEffect(() => {
    const fetchRequestsAndUsers = async () => {
      try {
        setLoading(true);

        // Fetch voucher requests
        const q = query(collection(firestore, 'voucherRequests'));
        const querySnapshot = await getDocs(q);
        const requestsList: VoucherRequest[] = [];
        for (const docSnap of querySnapshot.docs) {
          const requestData = docSnap.data();
          const { userFirstName, userLastName, userEmail, ...requestDetails } = requestData;

          requestsList.push({
            id: docSnap.id,
            voucherType: requestDetails.voucherType,
            amount: requestDetails.amount,
            reason: requestDetails.reason,
            status: requestDetails.status,
            firstName: userFirstName || 'NA',
            lastName: userLastName || 'NA',
            email: userEmail || 'NA',
          });
        }

        setRequests(requestsList);
        setFilteredRequests(requestsList); // Initialize filtered list

      } catch (error) {
        setError('Failed to fetch requests');
        console.error('Error fetching requests: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestsAndUsers();
  }, []);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const requestDocRef = doc(firestore, 'voucherRequests', requestId);
      await updateDoc(requestDocRef, {
        status: newStatus,
      });

      // Update local state after status change
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
      applyFilter(filter); // Reapply filter after update
    } catch (error) {
      setError('Failed to update request status');
      console.error('Error updating status: ', error);
    }
  };

  const handleFilterChange = (selectedFilter: string) => {
    setFilter(selectedFilter);
    applyFilter(selectedFilter);
  };

  const applyFilter = (selectedFilter: string) => {
    if (selectedFilter === 'All') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((req) => req.status === selectedFilter));
    }
  };

  if (loading) return <p>Loading voucher requests...</p>;

  return (
    <div className="admin-page">
      <h1>Voucher Requests</h1>
      {error && <p className="error">{error}</p>}
      <table className="voucher-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Reason</th>
            <th>
              Status
              <select
                className="status-filter"
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center' }}>
                No voucher requests available.
              </td>
            </tr>
          ) : (
            filteredRequests.map((request) => (
              <tr key={request.id}>
                <td>
                  <div>{request.firstName} {request.lastName}</div>
                  <div style={{ fontSize: '0.8em', color: '#666' }}>{request.email}</div>
                </td>
                <td>{request.voucherType.charAt(0).toUpperCase() + request.voucherType.slice(1).toLowerCase()}</td>
                <td>{request.amount} Credits</td>
                <td>{request.reason}</td>
                <td>
                  <span className={`status-tag ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  {request.status === 'Pending' && (
                    <>
                      <button
                        className="accept-btn"
                        onClick={() => handleStatusChange(request.id, 'Accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleStatusChange(request.id, 'Rejected')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminVoucherRequests;
