'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../../lib/firebase";

interface InventoryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface BuyRequest {
  id: string;
  productName: string;
  purchasedAt: string;
  quantity: number;
  status: string;
  totalAmount: number;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
}

interface PreOrder {
  id: string;
  productName: string;
  preorderedOn: string;
  quantity: number;
  status: string;
  totalAmount: number;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
}

const GeneralReport: React.FC = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [averageSpend, setAverageSpend] = useState(0);

  const buyRequestsCollection = collection(firestore, 'buyRequest');
  const preordersCollection = collection(firestore, 'preorders');
  const inventoryCollection = collection(firestore, 'inventory');

  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([]);
  const [preorders, setPreorders] = useState<PreOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [topRequestedProducts, setTopRequestedProducts] = useState<{ productName: string, totalQuantity: number }[]>([]);
  const [topPreOrderedProducts, setTopPreOrderedProducts] = useState<{ productName: string, totalQuantity: number }[]>([]);


  useEffect(() => {
    const fetchInventory = async () => {
        const inventorySnapshot = await getDocs(inventoryCollection);
        const items = inventorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InventoryItem[];
        setInventory(items);
      };
    
    const fetchBuyRequests = async () => {
      const buyRequestsSnapshot = await getDocs(buyRequestsCollection);
      const requests = buyRequestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BuyRequest[];
      setBuyRequests(requests);
    };

    const fetchPreOrders = async () => {
        const preordersSnapshot = await getDocs(preordersCollection);
        const preorders = preordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PreOrder[];
    setTopPreOrderedProducts(calculateTopPreOrdered(preorders)); // Calculate top 10 pre-ordered products
    };

    fetchInventory();
    fetchBuyRequests();
    fetchPreOrders();
  }, []);

  // Calculate the aggregate summary
  const totalQuantity = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const totalCredits = inventory.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length; // Count out-of-stock products

  // Calculate the top requested products
  useEffect(() => {
    const productRequests = buyRequests.reduce((acc: Record<string, number>, request) => {
      acc[request.productName] = (acc[request.productName] || 0) + request.quantity;
      return acc;
    }, {});

    const sortedProducts = Object.entries(productRequests)
      .map(([productName, totalQuantity]) => ({ productName, totalQuantity }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10); // Top 10 products

    setTopRequestedProducts(sortedProducts);
  }, [buyRequests]);

  // Function to calculate top 10 pre-ordered products
  const calculateTopPreOrdered = (preorders: PreOrder[]) => {
    const productPreOrders = preorders.reduce((acc: Record<string, number>, preorder) => {
      acc[preorder.productName] = (acc[preorder.productName] || 0) + preorder.quantity;
      return acc;
    }, {});

    const sortedPreOrders = Object.entries(productPreOrders)
      .map(([productName, totalQuantity]) => ({ productName, totalQuantity }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10); // Top 10 pre-ordered products

    return sortedPreOrders;
  };

  useEffect(() => {
    const completedBuyRevenue = buyRequests
      .filter((req) => req.status === "completed")
      .reduce((acc, req) => acc + req.totalAmount, 0);

    const completedPreorderRevenue = preorders
      .filter((req) => req.status === "available")
      .reduce((acc, req) => acc + req.totalAmount, 0);

    setTotalRevenue(completedBuyRevenue + completedPreorderRevenue);

    const pendingBuyRevenue = buyRequests
      .filter((req) => req.status === "pending")
      .reduce((acc, req) => acc + req.totalAmount, 0);

    const pendingPreorderRevenue = preorders
      .filter((req) => req.status === "pending")
      .reduce((acc, req) => acc + req.totalAmount, 0);

    setPendingRevenue(pendingBuyRevenue + pendingPreorderRevenue);

    const totalUsers = new Set([
      ...buyRequests.map((req) => req.userEmail),
      ...preorders.map((req) => req.userEmail),
    ]).size;

    const totalSpend = completedBuyRevenue + completedPreorderRevenue;
    setAverageSpend(totalUsers ? totalSpend / totalUsers : 0);
  }, [buyRequests, preorders]);

  const renderGeneralReport = () => (
    <div style={styles.summaryContainer}>
      <h2 style={styles.summaryTitle}>General Report</h2>
      <div style={styles.summaryItem}>
        <strong>Total Revenue:</strong> {totalRevenue.toFixed(2)} credits
      </div>
      <div style={styles.summaryItem}>
        <strong>Pending Revenue:</strong> {pendingRevenue.toFixed(2)} credits
      </div>
      <div style={styles.summaryItem}>
        <strong>Average Spend Per User:</strong> {averageSpend.toFixed(2)} credits
      </div>

      <br></br>
        
        {/* Inventory Summary */}
        <h2 style={styles.summaryTitle}>Inventory Summary</h2>
        <div style={styles.summaryItem}>
            <strong>Total Items:</strong> {inventory.length}
        </div>
        <div style={styles.summaryItem}>
            <strong>Total Quantity:</strong> {totalQuantity}
        </div>
        <div style={styles.summaryItem}>
            <strong>Total Credits:</strong> {totalCredits.toFixed(2)}
        </div>
        <div style={styles.summaryItem}>
            <strong>Out-of-Stock Products:</strong> {outOfStockCount}
        </div>

        <div style={styles.topSectionContainer}>
        {/* Top Requested Products */}
        <div style={styles.topRequestedContainer}>
            <h2 style={styles.summaryTitle}>Top 10 Requested Products</h2>
            <table style={styles.table}>
            <thead>
                <tr>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Total Quantity Requested</th>
                </tr>
            </thead>
            <tbody>
                {topRequestedProducts.map((product, index) => (
                <tr key={index} style={styles.tableRow}>
                    <td style={styles.td}>{product.productName}</td>
                    <td style={styles.td}>{product.totalQuantity}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* Top Pre-Ordered Products */}
        <div style={styles.topRequestedContainer}>
            <h2 style={styles.summaryTitle}>Top 10 Pre-Ordered Products</h2>
            <table style={styles.table}>
            <thead>
                <tr>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Total Quantity Pre-Ordered</th>
                </tr>
            </thead>
            <tbody>
                {topPreOrderedProducts.map((product, index) => (
                <tr key={index} style={styles.tableRow}>
                    <td style={styles.td}>{product.productName}</td>
                    <td style={styles.td}>{product.totalQuantity}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        
        </div>

        <br></br>
        {/* Inventory Content */}
        <h1 style={styles.summaryTitle}>Inventory Management</h1>

        <table style={styles.table}>
            <thead>
            <tr>
                <th style={styles.th}>Item Name</th>
                <th style={styles.th}>Credits</th>
                <th style={styles.th}>Quantity</th>
            </tr>
            </thead>
            <tbody>
            {inventory.map((item) => (
                <tr key={item.id} style={styles.tableRow}>
                <td style={styles.td}>{item.name}</td>
                <td style={styles.td}>{item.price}</td>
                <td style={styles.td}>{item.quantity}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
  );

  return <>{renderGeneralReport()}</>;
};

const WeeklyReport: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [buyRequests, setBuyRequests] = useState<BuyRequest[]>([]);
  const [preorders, setPreorders] = useState<PreOrder[]>([]);
  const [inventoryStart, setInventoryStart] = useState(0);
  const [inventoryEnd, setInventoryEnd] = useState(0);

  const inventoryCollection = collection(firestore, 'inventory');
  const buyRequestsCollection = collection(firestore, 'buyRequest');
  const preordersCollection = collection(firestore, 'preorders');

  useEffect(() => {
    const fetchInventory = async () => {
      const inventorySnapshot = await getDocs(inventoryCollection);
      const items = inventorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];
      setInventory(items);
    };

    const fetchBuyRequests = async () => {
      const buyRequestsSnapshot = await getDocs(buyRequestsCollection);
      const requests = buyRequestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BuyRequest[];
      setBuyRequests(requests);
    };

    const fetchPreorders = async () => {
      const preordersSnapshot = await getDocs(preordersCollection);
      const preordersData = preordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PreOrder[];
      setPreorders(preordersData);
    };

    fetchInventory();
    fetchBuyRequests();
    fetchPreorders();
  }, []);

  useEffect(() => {
    const initialInventoryQuantity = 1000;
    const currentInventoryQuantity = inventory.reduce((acc, item) => acc + item.quantity, 0);

    setInventoryStart(initialInventoryQuantity);
    setInventoryEnd(currentInventoryQuantity);
  }, [inventory]);

  const topPreorders = preorders
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const topBuyRequests = buyRequests
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

    const renderWeeklyReport = () => (
        <>
          <div style={styles.summaryContainer}>
            <h2 style={styles.summaryTitle}>Weekly Report</h2>
            <div style={styles.summaryItem}>
              <strong>Weekly Inventory Changes:</strong> 
              <p>Start of the Week: {inventoryStart}</p> 
              <p>End of the Week: {inventoryEnd}</p>
            </div>
          </div>
        </>
      );
    
      return <>{renderWeeklyReport()}</>;
    };

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'weekly'>('general');

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Reports</h1>
      <div style={styles.tabs}>
        <button
          style={activeTab === 'general' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('general')}
        >
          General Report
        </button>
        <button
          style={activeTab === 'weekly' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly Report
        </button>
      </div>
      {activeTab === 'general' ? <GeneralReport /> : <WeeklyReport />}
    </div>
  );
};

const styles = {
    container: { padding: "20px", fontFamily: "Arial, sans-serif" },
    title: { fontSize: "2rem", textAlign: "center", marginBottom: "20px", fontWeight: "bold", },
    tabs: { display: "flex", justifyContent: "center", marginBottom: "20px" },
      tabButton: {
        padding: '10px 20px',
        backgroundColor: '#30368A',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        borderRadius: '5px',
      },
      tabContent: {
        paddingTop: '20px',
      },
      summaryContainer: {
        width: '100%',
        padding: '20px',
        backgroundColor: '#f7f7f7',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      },
      summaryTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '10px',
      },
      summaryItem: {
        fontSize: '1.2rem',
        margin: '5px 0',
      },
      topSectionContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        marginTop: '40px',
      },
      topRequestedContainer: {
        flex: 1,
        width: '48%',
      },
      content: {
        width: '100%',
        padding: '20px',
      },
      table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'center',
        marginTop: '20px',
      },
      tableRow: {
        borderBottom: '1px solid #ddd',
      },
      td: {
        padding: '12px 15px',
        border: 'none',
        color: '#555',
      },
      th: {
        backgroundColor: '#f0f0f0',
        padding: '12px 15px',
        borderBottom: '1px solid #ddd',
        fontWeight: 'bold',
        color: '#333',
      },
      image: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        display: 'block',
        margin: '0 auto',
      },
      actionContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
      },
      quantityInput: {
        width: '50px',
        padding: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        textAlign: 'center',
        fontSize: '14px',
      },
      actionButton: {
        padding: '5px 10px',
        backgroundColor: '#30368A',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
      },
      statusLabel: (status: string) => ({
        padding: '5px 10px',
        borderRadius: '5px',
        backgroundColor: status === 'available' ? '#28a745' : '#dc3545',
        color: 'white',
      }),
      buyRequestsContainer: {
        width: '100%',
        marginTop: '40px',
      },
      buyRequestsTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '20px',
      },
    tab: {
      padding: "10px 20px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      backgroundColor: "#f1f1f1",
      cursor: "pointer",
      marginRight: "10px",
    },
    activeTab: {
      padding: "10px 20px",
      border: "1px solid #000",
      borderRadius: "4px",
      backgroundColor: "#30368A",
      color: 'white',
      cursor: "pointer",
      marginRight: "10px",
      fontWeight: "bold",
    },
    dataContainer: { display: "flex", justifyContent: "space-between", gap: "20px" },
    section: {
      flex: 1,
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    sectionTitle: { fontSize: "1.5rem", marginBottom: "10px" },
    tableHeader: {
      backgroundColor: "#f1f1f1",
    },
    tableHeaderCell: {
      padding: "10px",
      border: "1px solid #ddd",
      borderBottom: '2px solid gray',
      
    },
    tableCell: {
      padding: "10px",
      border: "1px solid #ddd",
      borderBottom: '2px solid gray',
    },
};

export default Reports;
