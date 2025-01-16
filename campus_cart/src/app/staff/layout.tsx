'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // For detecting the current route

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname(); // Get the current path
  const [isClient, setIsClient] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false); // State to toggle dropdown visibility

  useEffect(() => {
    setIsClient(true); // Set to true after the component mounts on the client
  }, []);

  const navLinkStyle = (path: string) => ({
    backgroundColor: pathname === path ? '#1C254B' : '#30368A', // Darker blue for active, default for others
    color: 'white', // Keep text white
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    display: 'flex', // Make the link behave like a flex container
    alignItems: 'center', // Vertically center the text
    justifyContent: 'center', // Horizontally center the text
    padding: '0 15px', // Horizontal padding to add space on the left/right of the text
    height: '100%', // Make the link fill the full height of the header
    borderRadius: '0px', // Optional: Rounded corners for a button-like look
    transition: 'background-color 0.3s ease, color 0.3s ease', // Smooth transition for hover and active states
    cursor: 'pointer',
  });

  // Ensure the component only renders after the client is ready
  if (!isClient) {
    return null; // Don't render until client-side JavaScript is ready
  }

  return (
    <div>
      {/* Header */}
      <header
        style={{
          backgroundColor: '#30368A', // Header background
          color: 'white',
          padding: '0px 20px',
          display: 'flex',
          alignItems: 'center', // Align items vertically in the center
          justifyContent: 'space-between',
          height: '60px', // Set a fixed height for the header
          position: 'relative', // Ensure the dropdown is positioned relative to the header
        }}
      >
        {/* Left - Brand */}
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Campus Cart</h1>

        {/* Right - Navigation and Profile */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0px',
            height: '100%', // Make the nav container fill the full height of the header
          }}
        >
          {[
            { path: '/staff/inventory', label: 'Inventory' },
            { path: '/staff/voucher-request', label: 'Voucher Requests' },
            { path: '/staff/product-request', label: 'Product Requests' },
            { path: '/staff/manage-users', label: 'Manage Users' },
            { path: '/staff/reports', label: 'Reports' },
          ].map((link, index) => (
            <a
              key={index}
              href={link.path}
              style={navLinkStyle(link.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = pathname === link.path ? '#1C254B' : '#1C254B'; // Hover color matches active color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = pathname === link.path ? '#1C254B' : '#30368A'; // Restore original color
              }}
            >
              {link.label}
            </a>
          ))}

          {/* Profile Icon */}
          <div
            style={{
              position: 'relative', // Needed for positioning the dropdown menu
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px', // Smaller width
              height: '30px', // Smaller height
              borderRadius: '50%',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => setDropdownVisible((prev) => !prev)} // Toggle dropdown visibility on click
          >
            <img
              src="/profile_pic.jpg" // Assuming the image is saved in /public/profile_pic.jpg
              alt="Profile Icon"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />

            {/* Dropdown Menu */}
            {dropdownVisible && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px', // Position below the icon
                  right: '100', // Align with the right side of the header
                  backgroundColor: '#30368A', // Slightly different shade for the dropdown
                  color: 'white',
                  padding: '10px 15px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '130px', // Fixed width for the dropdown
                }}
              >
                <a
                  href="/staff/change_password"
                  style={{
                    textDecoration: 'none',
                    color: 'white',
                    padding: '5px 0',
                  }}
                >
                  Change Password
                </a>
                <a
                  href="../login"
                  style={{
                    textDecoration: 'none',
                    color: 'white',
                    padding: '5px 0',
                  }}
                >
                  Log Out
                </a>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main style={{ padding: '20px' }}>{children}</main>
    </div>
  );
};

export default AdminLayout;

