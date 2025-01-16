'use client';
<<<<<<< Updated upstream

import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import './Home.css';
=======
>>>>>>> Stashed changes

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../lib/firebase'; // Adjust path as needed.

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  image: string;
}

<<<<<<< Updated upstream
  const items = [
    { id: 1, name: 'Notebook', price: 10 },
    { id: 2, name: 'Pen', price: 2 },
    { id: 3, name: 'Backpack'},
    { id: 4, name: 'Water Bottle', price: 15 },
    ];
  
    const currentUser = auth.currentUser;
  
    const handleBuyClick = (itemName: string) => {
      setSelectedItem(itemName);
      setShowConfirmation(true);
=======
const ProductHomePage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({}); // Key is item id, value is quantity in cart.

  const inventoryCollection = collection(firestore, 'inventory');

  // Fetch inventory data on page load
  useEffect(() => {
    const fetchInventory = async () => {
      const inventorySnapshot = await getDocs(inventoryCollection);
      const items = inventorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];
      setInventory(items);
>>>>>>> Stashed changes
    };

    fetchInventory();
  }, []);

  const handleAddToCart = (id: string, quantity: number) => {
    setCart((prevCart) => {
      const currentQuantity = prevCart[id] || 0;
      return { ...prevCart, [id]: currentQuantity + quantity };
    });
  };

  const handleRemoveFromCart = (id: string, quantity: number) => {
    setCart((prevCart) => {
      const currentQuantity = prevCart[id] || 0;
      const newQuantity = currentQuantity - quantity;
      if (newQuantity <= 0) {
        const { [id]: _, ...rest } = prevCart;
        return rest;
      }
      return { ...prevCart, [id]: newQuantity };
    });
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout');
    // Here you can handle the checkout process (e.g., creating an order)
    console.log(cart);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Products</h1>

      <div style={styles.productsGrid}>
        {inventory.map((item) => (
          <div key={item.id} style={styles.productCard}>
            <img src={item.image} alt={item.name} style={styles.productImage} />
            <h3>{item.name}</h3>
            <p>Quantity Available: {item.quantity}</p>

            <div style={styles.cartActions}>
              <button
                onClick={() => handleAddToCart(item.id, 1)}
                style={styles.addButton}
                disabled={item.quantity <= 0}
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleRemoveFromCart(item.id, 1)}
                style={styles.removeButton}
                disabled={cart[item.id] <= 0}
              >
                Remove from Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.cartSummary}>
        <h2>Cart Summary</h2>
        <ul style={styles.cartList}>
          {Object.entries(cart).map(([itemId, quantity]) => {
            const item = inventory.find((item) => item.id === itemId);
            return (
              item && (
                <li key={item.id} style={styles.cartItem}>
                  {item.name}: {quantity} {quantity > 1 ? 'items' : 'item'}
                </li>
              )
            );
          })}
        </ul>
        <button onClick={handleCheckout} style={styles.checkoutButton}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '30px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    marginBottom: '10px',
  },
  cartActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  removeButton: {
    padding: '10px 20px',
    backgroundColor: '#FF6347',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cartSummary: {
    marginTop: '50px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  cartList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '20px',
  },
  cartItem: {
    marginBottom: '10px',
    fontSize: '16px',
  },
  checkoutButton: {
    padding: '15px 30px',
    backgroundColor: '#30368A',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
  },
};

export default ProductHomePage;
