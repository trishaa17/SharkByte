'use client';

import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../../../lib/firebase"; // Adjust the path to match your setup.

interface InventoryItem {
  id: string;
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const inventoryCollection = collection(firestore, 'inventory');
  const auditLogCollection = collection(firestore, 'auditLogs');

  // Fetch inventory and logs on component mount
  useEffect(() => {
    const fetchInventory = async () => {
      const inventorySnapshot = await getDocs(inventoryCollection);
      const items = inventorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];
      setInventory(items);
    };

    const fetchAuditLogs = async () => {
      const logsSnapshot = await getDocs(auditLogCollection);
      const logs = logsSnapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as AuditLog[];
      setAuditLogs(logs);
    };

    fetchInventory();
    fetchAuditLogs();
  }, []);

  const handleAddNewItem = async () => {
    if (!newItemName || !newItemQuantity || !newItemImage) {
      alert('Please provide item name, quantity, and an image URL.');
      return;
    }

    const newItem = {
      name: newItemName,
      quantity: Number(newItemQuantity),
      image: newItemImage,
    };

    try {
      const docRef = await addDoc(inventoryCollection, newItem);
      setInventory([...inventory, { id: docRef.id, ...newItem }]);
      await logAudit(`Added new item: ${newItem.name} (Quantity: ${newItem.quantity})`);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemImage('');
    } catch (error) {
      console.error("Error adding new item: ", error);
    }
  };

  const handleUpdateQuantity = async (id: string, quantityChange: number) => {
    const itemToUpdate = inventory.find((item) => item.id === id);
    if (!itemToUpdate) return;

    const updatedQuantity = itemToUpdate.quantity + quantityChange;
    try {
      await updateDoc(doc(firestore, 'inventory', id), { quantity: updatedQuantity });
      setInventory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: updatedQuantity } : item
        )
      );
      await logAudit(`Updated ${itemToUpdate.name} quantity by ${quantityChange}. New quantity: ${updatedQuantity}`);
    } catch (error) {
      console.error("Error updating quantity: ", error);
    }
  };

  const logAudit = async (message: string) => {
    const log = {
      timestamp: new Date().toLocaleString(),
      message,
    };

    try {
      await addDoc(auditLogCollection, { ...log, serverTimestamp: serverTimestamp() });
      setAuditLogs((prev) => [...prev, log]);
    } catch (error) {
      console.error("Error logging audit: ", error);
    }
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
        <div style={{ padding: '20px' }}>
          <h1 style={styles.title}>Inventory Management</h1>
          <button onClick={() => setIsSidebarOpen(true)} style={styles.openSidebarButton}>
            View Audit Logs
          </button>
        </div>

        {/* Inventory List Section */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={styles.boldTitle}>Current Inventory</h2>
          <button
            style={styles.addButtonSquare}
            onClick={handleOpenModal} // Opens modal when clicked
          >
            <h3>+</h3>
          </button>
        </div>
          <table style={styles.table}>
            <thead>
              <tr>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Item Name</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td>
                    <img src={item.image} alt={item.name} style={styles.image} />
                  </td>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>
                    <div style={styles.actionContainer}>
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        onChange={(e) => item.quantity = parseInt(e.target.value) || 0} // Temporary quantity value
                        style={styles.quantityInput}
                      />
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity || 1)} // Default to 1 if no value is input
                        style={styles.actionButton}
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -(item.quantity || 1))}
                        style={styles.actionButton}
                      >
                        -
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      {/* Modal Popup for Add New Item */}
      {isModalOpen && (
        <>
          <div style={styles.modalOverlay} onClick={handleCloseModal}></div>
          <div style={styles.modalContainer}>
            <h3 style={{ fontWeight: 'bold', fontSize: '32px', color: 'black', textAlign: 'center', marginBottom: '20px'}}>Add New Item</h3>
            <label style={styles.label}> Item Name </label>
            <input
              type="text"
              placeholder="Enter Item Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={styles.input}
            />
            <label style={styles.label}> Quantity </label>
            <input
              type="number"
              placeholder="Enter Quantity"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              style={styles.input}
            />
            <label style={styles.label}> Image URL </label>
            <input
              type="text"
              placeholder="Enter Image URL"
              value={newItemImage}
              onChange={(e) => setNewItemImage(e.target.value)}
              style={styles.input}
            />

            {/* Button container */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' , gap: '20px'}}>
      
            <button onClick={handleOpenModal} style={{
                width: '80%',
                padding: '15px',
                backgroundColor: '#555555',
                borderRadius: '25px',
                color: 'white',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '40px',
                marginBottom: '20px', // Space between buttons
                margin: '0 auto', /* Centers the button horizontally */
                display: 'block',
              }}>
              Add Item
            </button>
            <button onClick={handleCloseModal} style={{
                width: '80%',
                padding: '15px',
                backgroundColor: '#FF6347',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '25px',
                margin: '0 auto', /* Centers the button horizontally */
                display: 'block',
              }}>
              Close
            </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  boldTitle: {
    fontWeight: 'bold',
  },
  button: {
    display: 'flex',
    justifyContent: 'flex-end', /* Aligns button to the right */
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '300px',
    height: '100%',
    backgroundColor: '#30368A',
    color: 'white',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    zIndex: 1000,
    transition: 'transform 0.3s ease',
    overflowY: 'auto',
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    marginBottom: '20px',
    fontWeight: 'bold',
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
    width: '100%',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px',
  },
  openSidebarButton: {
    padding: '10px 15px',
    backgroundColor: '#30368A',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '30px',
    display: 'inline-block',
    marginRight: '0',
    float: 'right',
  },
  input: {
    width: '100%',
    padding: '5px',
    border: 'none',
    borderBottom: '2px solid gray',
    marginTop: '5px',
    marginBottom: '20px',
    fontSize: '16px',
    color: 'black',
  },
  addButtonSquare: {
    width: '30px',  
    height: '30px', 
    backgroundColor: 'green', 
    color: 'white', 
    fontSize: '20px', 
    border: 'none',
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginLeft: '10px', 
    borderRadius: '4px',
  },
  tableContainer: {
    marginTop: '30px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'center',
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: '#30368A',
    color: '#fff',
    padding: '10px 15px',
  },
  tableCell: {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
  },
  tableRow: {
    borderBottom: '1px solid #ddd', // Add a horizontal line after each row
  },
  td: {
    padding: '12px 15px',
    border: 'none', // No border for table data, only the bottom border
    color: '#555',
  },
  th: {
    backgroundColor: '#f0f0f0',
    padding: '12px 15px',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
    color: '#333',
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
    display: 'block',
    margin: '0 auto',
  },
  // Styles for Modal/Popup
  modalContainer: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '35px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1100,
    width: '400px',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modalHeader: {
    fontSize: '1.5rem',
    marginBottom: '20px',
  },
  label: {
    color: 'black', 
    fontSize: '16px',
  },
  actionContainer: {
    display: 'flex',
    justifyContent: 'center', // Centers horizontally
    alignItems: 'center', // Centers vertically
    gap: '10px', // Space between elements
  },
  quantityInput: {
    width: '50px',
    padding: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '14px',
    height: '32px', // Ensures uniform height with buttons
  },
  actionButton: {
    padding: '5px 10px',
    backgroundColor: '#30368A',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    height: '32px', // Matches height with input
    display: 'flex',
    alignItems: 'center', // Centers text inside the button
    justifyContent: 'center', // Centers text horizontally
  },
};


export default InventoryManagement;
