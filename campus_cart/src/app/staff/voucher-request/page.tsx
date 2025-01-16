// app/admin/voucherRequests/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { firestore } from '../../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import './VoucherRequests.css';

// Define a TypeScript interface for the request data
interface VoucherRequest {
  id: string;
  voucherType: string;
  amount: number;
  reason: string;
  status: string;
}

const AdminVoucherRequests = () => {
  const [requests, setRequests] = useState<VoucherRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const q = query(collection(firestore, 'voucherRequests'));
        const querySnapshot = await getDocs(q);
        const requestsList: VoucherRequest[] = [];
        querySnapshot.forEach((doc) => {
          requestsList.push({ id: doc.id, ...doc.data() } as VoucherRequest); // Cast to VoucherRequest type
        });
        setRequests(requestsList);
      } catch (error) {
        setError('Failed to fetch requests');
        console.error('Error fetching requests: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
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
    } catch (error) {
      setError('Failed to update request status');
      console.error('Error updating status: ', error);
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
            <th>Type</th>
            <th>Amount</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                No voucher requests available.
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr key={request.id}>
                <td>{request.voucherType}</td>
                <td>{request.amount} Credits</td>
                <td>{request.reason}</td>
                <td>{request.status}</td>
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
