'use client';

import React, { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from "../../../lib/firebase";

// Define the Product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

const auth = getAuth();
const db = firestore;

const ProductHome = () => {
  const [products, setProducts] = useState<Product[]>([]); // Products state
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false); // New modal for Pre-order
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [userCredits, setUserCredits] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch products and user credits on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'inventory');
        const productSnapshot = await getDocs(productsRef);
        const productList: Product[] = productSnapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Product, 'id'>; // Exclude 'id' from Product type
          return { id: doc.id, ...data }; // Merge Firestore ID with the rest of the data
        });

        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    const fetchUserCredits = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUserCredits(userData?.credits || 0); // Set user credits
          } else {
            console.warn('User data does not exist.');
          }
        } catch (error) {
          console.error("Error fetching user credits: ", error);
        }
      }
    };

    fetchProducts();
    fetchUserCredits();
  }, []);

  const handleQuantityChange = (id: string, increment: number) => {
    setQuantities((prevQuantities) => {
      const newQuantity = (prevQuantities[id] || 0) + increment;
      return { ...prevQuantities, [id]: newQuantity >= 0 ? newQuantity : 0 };
    });
  };

  const handleBuyClick = (product: Product) => {
    const quantity = quantities[product.id] || 0;
    const totalPrice = quantity * product.price;

    setFinalPrice(totalPrice);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handlePreOrderClick = (product: Product) => {
    const quantity = quantities[product.id] || 0;
    const totalPrice = quantity * product.price;

    setFinalPrice(totalPrice);
    setSelectedProduct(product);
    setIsPreOrderModalOpen(true); // Open pre-order modal
  };

  const handleConfirmPreOrder = async () => {
    const user = auth.currentUser;
    if (user && selectedProduct) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          // Store pre-order details in the 'preorders' collection
          const preOrderRef = collection(db, 'preorders');
          await addDoc(preOrderRef, {
            productName: selectedProduct.name,
            quantity: quantities[selectedProduct.id || ''] || 0,
            totalAmount: finalPrice,
            userEmail: userData?.email || 'Unknown',
            userFirstName: userData?.firstName || 'Unknown',
            userLastName: userData?.lastName || 'Unknown',
            preorderedOn: new Date().toISOString(), // Save the timestamp in ISO format
            status: 'pending',
          });

          // Set success message and close modal
          setSuccessMessage('Pre-order placed successfully!');
          setTimeout(() => {
            setSuccessMessage('');
            setIsPreOrderModalOpen(false); // Close modal
          }, 2000);
        }
      } catch (error) {
        console.error('Error placing pre-order:', error);
        setErrorMessage('An error occurred while placing the pre-order.');
        setTimeout(() => setErrorMessage(''), 2000);
      }
    } else {
      setErrorMessage('No user is logged in.');
      setTimeout(() => setErrorMessage(''), 2000);
    }
  };

  const handleCancelPreOrder = () => {
    setIsPreOrderModalOpen(false); // Close modal
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
            <p>Credits required: {product.price}</p>
            <p>Qty left: {product.quantity}</p>

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
              {product.quantity === 0 ? (
                <button
                  style={styles.preOrderButton}
                  onClick={() => handlePreOrderClick(product)}
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

      {/* Pre-order confirmation modal */}
      {isPreOrderModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            {successMessage && <p style={styles.successMessageModal}>{successMessage}</p>}
            {errorMessage && <p style={styles.errorMessageModal}>{errorMessage}</p>}
            <h3>Confirm Pre-order</h3>
            <p>Product: {selectedProduct?.name}</p>
            <p>Quantity: {quantities[selectedProduct?.id || ''] || 0}</p>
            <p>Total credits required: {finalPrice}</p>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={handleCancelPreOrder}
              >
                Cancel
              </button>
              <button
                style={styles.confirmButton}
                onClick={handleConfirmPreOrder}
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
  successMessageModal: {
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '15px',
  },
  errorMessageModal: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '15px',
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
    marginLeft: '10px',
    padding: '5px',
    fontSize: '16px',
  },
  quantityButtons: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  plusMinusButton: {
    fontSize: '18px',
    width: '30px',
    height: '30px',
    border: 'none',
    backgroundColor: '#ddd',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '4px',
  },
  preOrderButton: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    marginRight: '10px',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};

export default ProductHome;
