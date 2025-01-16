'use client';

import React, { useState } from 'react';
//import Header from './Header';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  image: string;
}

interface AuditLog {
  timestamp: string;
  message: string;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState<number | string>('');
  const [newItemImage, setNewItemImage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddNewItem = () => {
    if (!newItemName || !newItemQuantity || !newItemImage) {
      alert('Please provide item name, quantity, and an image URL.');
      return;
    }

    const newItem: InventoryItem = {
      id: Date.now(),
      name: newItemName,
      quantity: Number(newItemQuantity),
      image: newItemImage,
    };

    setInventory([...inventory, newItem]);
    setAuditLogs([
      ...auditLogs,
      {
        timestamp: new Date().toLocaleString(),
        message: `Added new item: ${newItem.name} (Quantity: ${newItem.quantity})`,
      },
    ]);
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemImage('');
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <h2 style={styles.sidebarTitle}>Audit Logs</h2>
        <button onClick={() => setIsSidebarOpen(false)} style={styles.closeButton}>
          Close
        </button>
        <ul style={styles.auditLogList}>
          {auditLogs.map((log, index) => (
            <li key={index} style={styles.auditLogItem}>
              <strong>{log.timestamp}</strong>: {log.message}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/*<Header /> {/* Include Header component */}
        <div style={styles.header}></div>
        <div style={{ padding: '20px' }}>
          <h1 style={styles.title}>Inventory Management</h1>
          <button onClick={() => setIsSidebarOpen(true)} style={styles.openSidebarButton}>
            View Audit Logs
          </button>
        </div>

        {/* Add New Item Section */}
        <div style={styles.newItemForm}>
          <h3>Add New Item</h3>
          <input
            type="text"
            placeholder="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newItemImage}
            onChange={(e) => setNewItemImage(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleAddNewItem} style={styles.addButton}>
            Add New Item
          </button>
        </div>

        {/* Inventory List Section */}
        <div>
          <h2>Current Inventory</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img src={item.image} alt={item.name} style={styles.image} />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      style={styles.updateButton}
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      style={styles.updateButton}
                    >
                      -1
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  function handleUpdateQuantity(id: number, quantityChange: number) {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + quantityChange } : item
      )
    );
    const updatedItem = inventory.find((item) => item.id === id);
    if (updatedItem) {
      setAuditLogs([
        ...auditLogs,
        {
          timestamp: new Date().toLocaleString(),
          message: `Updated ${updatedItem.name} quantity by ${quantityChange}. New quantity: ${
            updatedItem.quantity + quantityChange
          }`,
        },
      ]);
    }
  }
};

const styles = {
  container: {
    display: 'flex',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '300px',
    height: '100%',
    backgroundColor: '#f8f9fa',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    zIndex: 1000,
    transition: 'transform 0.3s ease',
    overflowY: 'auto',
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    marginBottom: '20px',
  },
  closeButton: {
    marginBottom: '20px',
    padding: '10px 15px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  auditLogList: {
    listStyle: 'none',
    padding: 0,
  },
  auditLogItem: {
    marginBottom: '10px',
    borderBottom: '1px solid #ddd',
    paddingBottom: '5px',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '2rem',
    textAlign: 'center',
    flex: 1,
  },
  openSidebarButton: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  newItemForm: {
    marginBottom: '30px',
  },
  input: {
    margin: '5px',
    padding: '8px',
    fontSize: '1rem',
  },
  addButton: {
    padding: '10px 15px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'center',
  },
  updateButton: {
    padding: '5px 10px',
    margin: '2px',
    backgroundColor: '#17a2b8',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  image: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    display: 'block', // Ensures the image is treated as a block element
    margin: '0 auto',
  },
};

export default InventoryManagement;
