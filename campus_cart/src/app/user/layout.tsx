'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ResidentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinkStyle = (path: string) => ({
    backgroundColor: pathname === path ? '#1C254B' : '#30368A',
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 15px',
    height: '100%',
    borderRadius: '0px',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    cursor: 'pointer',
  });

  if (!isClient) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <header
        style={{
          backgroundColor: '#30368A',
          color: 'white',
          padding: '0px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          position: 'relative',
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
            height: '100%',
          }}
        >
          {[
            { path: '/user/home', label: 'Home' },
            { path: '/user/credits', label: 'Vouchers' },
            { path: '/user/preorders', label: 'Pre Orders' },
            { path: '/user/transaction_history', label: 'Transaction History' },
          ].map((link, index) => (
            <a
              key={index}
              href={link.path}
              style={navLinkStyle(link.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = pathname === link.path ? '#1C254B' : '#1C254B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = pathname === link.path ? '#1C254B' : '#30368A';
              }}
            >
              {link.label}
            </a>
          ))}

          {/* Profile Icon */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              
            }}
            onClick={() => setDropdownVisible((prev) => !prev)}
          >
            <img
              src="/profile_pic.jpg"
              alt="Profile Icon"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                marginLeft: '20px',
              }}
            />

            {/* Dropdown Menu */}
            {dropdownVisible && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: '100',
                  backgroundColor: '#30368A',
                  color: 'white',
                  padding: '10px 15px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '130px',
                }}
              >
                <a
                  href="../staff/change_password"
                  style={{
                    textDecoration: 'none',
                    color: 'white',
                    padding: '5px 0',
                  }}
                >
                  Change Password
                </a>
                <a
                  href="/login"
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

export default ResidentLayout;
