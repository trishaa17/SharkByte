'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from "../../../lib/firebase"; // Your Firebase initialization file

const auth = getAuth();
const db = firestore;

const ProductHome = () => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});  // State to hold quantities for each product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [userCredits, setUserCredits] = useState(0); // State to hold user credits

  useEffect(() => {
    // Fetch products from Firestore
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'inventory'); // Fetch collection (not a document)
        const productSnapshot = await getDocs(productsRef);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList); // Set products data
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    // Fetch user credits from Firestore
    const fetchUserCredits = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();
        setUserCredits(userData?.credits || 0); // Set user credits
      }
    };

    fetchProducts();
    fetchUserCredits();
  }, []);

  const handleQuantityChange = (id, increment) => {
    setQuantities((prevQuantities) => {
      const newQuantity = prevQuantities[id] + increment;
      return { ...prevQuantities, [id]: newQuantity >= 0 ? newQuantity : 0 };
    });
  };

  const handleBuyClick = (product) => {
    const quantity = quantities[product.id] || 0;
    const totalPrice = quantity * product.price; // Calculate total price

    setFinalPrice(totalPrice);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
      const currentCredits = userData?.credits || 0;
  
      if (currentCredits >= finalPrice) {
        // Deduct credits from user account
        await updateDoc(userRef, {
          credits: currentCredits - finalPrice,
        });
  
        // Store purchase details in buyRequest collection
        const buyRequestRef = collection(db, 'buyRequest');
        await addDoc(buyRequestRef, {
          productName: selectedProduct.name,
          quantity: quantities[selectedProduct.id] || 0,
          totalAmount: finalPrice,
          userFirstName: userData?.firstName,
          userLastName: userData?.lastName,
          userEmail: userData?.email,
          purchasedAt: new Date(), 
        });
  
        // Proceed with buying the product (you can further update product inventory or other actions)
        console.log('Purchase confirmed:', selectedProduct.name);
        setUserCredits(currentCredits - finalPrice); // Update the credits state
      } else {
        alert('Insufficient credits');
      }
    }
    setIsModalOpen(false);
  };
  

  const handlePreOrder = async (product) => {
    const preOrderRef = doc(db, 'preorders', product.id);
    await updateDoc(preOrderRef, {
      productId: product.id,
      name: product.name,
      price: product.price,
      preOrderedBy: auth.currentUser?.uid,
      status: 'preordered',
    });
    alert('Item has been preordered!');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Product Inventory</h1>
        <div style={styles.creditsContainer}>
          <p style={styles.creditsText}>Credits: {userCredits}</p>
        </div>
      </div>
      <div style={styles.inventoryContainer}>
        {products.map((product) => (
          <div key={product.id} style={styles.productCard}>
            <img src={product.image} alt={product.name} style={styles.productImage} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: {product.price}</p>

            <div style={styles.buySection}>
              <div style={styles.quantityButtons}>
                <button
                  style={styles.plusMinusButton}
                  onClick={() => handleQuantityChange(product.id, -1)}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantities[product.id] || 0}
                  readOnly
                  style={styles.quantityInput}
                />
                <button
                  style={styles.plusMinusButton}
                  onClick={() => handleQuantityChange(product.id, 1)}
                >
                  +
                </button>
              </div>
              {product.stock === 0 ? (
                <button
                  style={styles.preOrderButton}
                  onClick={() => handlePreOrder(product)}
                >
                  Pre-order
                </button>
              ) : (
                <button
                  style={styles.buyButton}
                  onClick={() => handleBuyClick(product)}
                >
                  Buy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <h3>Confirm Purchase</h3>
            <p>Final price: {finalPrice}</p>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleConfirmPurchase}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px 20px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  creditsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  creditsText: {
    marginRight: '10px',
  },
  inventoryContainer: {
    display: 'flex',
    overflowX: 'auto',
    gap: '20px',
    padding: '10px 0',
  },
  productCard: {
    width: '250px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: '100%',
    height: 'auto',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  buySection: {
    marginTop: '10px',
  },
  quantityInput: {
    width: '50px',
    textAlign: 'center',
    marginRight: '10px',
    padding: '5px',
    fontSize: '16px',
  },
  quantityButtons: {
    display: 'inline-block',
  },
  plusMinusButton: {
    padding: '10px',
    fontSize: '16px',
    margin: '5px',
    cursor: 'pointer',
    backgroundColor: '#30368A',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
  },
  buyButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  preOrderButton: {
    padding: '10px 20px',
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
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
  modalContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '300px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  confirmButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default ProductHome;