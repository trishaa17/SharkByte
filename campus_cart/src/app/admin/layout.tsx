'use client';

import React from 'react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      {/* Header */}
      <header
        style={{
          backgroundColor: '#30368A', // Dark green background
          color: 'white',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left - Brand */}
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Campus Cart</h1>

        {/* Right - Navigation and Profile */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a
            href="/inventory"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Inventory
          </a>
          <a
            href="/voucher-requests"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Voucher Requests
          </a>
          <a
            href="/product-requests"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Product Requests
          </a>
          <a
            href="/manage-users"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Manage Users
          </a>

          {/* Profile Icon */}
          <a
            href="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: '#006400',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            <img
              src="/profile_icon.png" // Assuming the image is saved in /public/profile_icon.png
              alt="Profile Icon"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          </a>
        </nav>
      </header>

      {/* Page Content */}
      <main style={{ padding: '20px' }}>{children}</main>
    </div>
  );
};

export default AdminLayout;
