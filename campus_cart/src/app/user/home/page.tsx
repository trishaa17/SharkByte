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
    setIsModalOpen(true); // Show the modal when "Buy" is clicked
  };

  const handlePreOrderClick = (product: Product) => {
    const quantity = quantities[product.id] || 0;
    const totalPrice = quantity * product.price;

    setFinalPrice(totalPrice);
    setSelectedProduct(product);
    setIsPreOrderModalOpen(true); // Open pre-order modal
  };

  const handleConfirmPurchase = async () => {
    const user = auth.currentUser;
    if (user && selectedProduct) {
      const quantity = quantities[selectedProduct.id || ''] || 0;
      const totalPrice = finalPrice;

      if (userCredits < totalPrice) {
        // Insufficient credits
        setErrorMessage('Insufficient credits for this purchase.');
        setTimeout(() => setErrorMessage(''), 2000);
        return;
      }

      if (quantity > selectedProduct.quantity) {
        // Insufficient product quantity
        setErrorMessage('Not enough stock for the requested quantity.');
        setTimeout(() => setErrorMessage(''), 2000);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const productRef = doc(db, 'inventory', selectedProduct.id);

        // Fetch the user details (firstName and lastName)
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();
        const firstName = userData?.firstName || 'Unknown';
        const lastName = userData?.lastName || 'Unknown';

        // Proceed with the purchase
        const purchaseRef = collection(db, 'buyRequest');

        await addDoc(purchaseRef, {
                productName: selectedProduct.name,
                quantity,
                totalAmount: totalPrice,
                userEmail: user.email || 'Unknown',
                userFirstName: firstName, // Assuming these fields exist in preorder
                userLastName: lastName,   // Assuming these fields exist in preorder
                status: 'pending', // Set the initial status to default
                purchasedAt: new Date(), // Save current date as timestamp
              });
          

        // Deduct credits and update the user
        await updateDoc(userRef, {
          credits: userCredits - totalPrice,
        });

        // Reduce product quantity in the inventory
        await updateDoc(productRef, {
          quantity: selectedProduct.quantity - quantity,
        });

        // Update local state for UI
        setUserCredits(userCredits - totalPrice);
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === selectedProduct.id
              ? { ...product, quantity: product.quantity - quantity }
              : product
          )
        );

        // Show success message
        setSuccessMessage('Purchase successful!');
        setTimeout(() => {
          setSuccessMessage('');
          setIsModalOpen(false);
        }, 2000);
      } catch (error) {
        console.error('Error confirming purchase:', error);
        setErrorMessage('An error occurred while processing your purchase.');
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

  const handleConfirmPreOrder = async () => {
    const user = auth.currentUser;
    if (user && selectedProduct) {
      const quantity = quantities[selectedProduct.id || ''] || 0;
      const totalPrice = finalPrice;

      try {
        const userRef = doc(db, 'users', user.uid);

        // Fetch the user details (firstName and lastName)
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();
        const firstName = userData?.firstName || 'Unknown';
        const lastName = userData?.lastName || 'Unknown';

        // Proceed with the pre-order
        const preOrderRef = collection(db, 'preorders');
        await addDoc(preOrderRef, {
          productName: selectedProduct.name,
          quantity,
          totalAmount: totalPrice,
          userEmail: user.email || 'Unknown',
          userFirstName: firstName,
          userLastName: lastName,
          preorderedOn: new Date().toISOString(),
          status: 'pending',
        });

        // Show success message
        setSuccessMessage('Pre-order successful!');
        setTimeout(() => {
          setSuccessMessage('');
          setIsPreOrderModalOpen(false);
        }, 2000);
      } catch (error) {
        console.error('Error confirming pre-order:', error);
        setErrorMessage('An error occurred while processing your pre-order.');
        setTimeout(() => setErrorMessage(''), 2000);
      }
    }
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
            <h3 style={styles.productName}>{product.name}</h3>
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
                  onChange={(e) =>
                    setQuantities((prevQuantities) => ({
                      ...prevQuantities,
                      [product.id]: Math.max(Number(e.target.value), 0),
                    }))
                  }
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
                  style={{ ...styles.buyButton, backgroundColor: '#FFD700' }}
                  onClick={() => handlePreOrderClick(product)}
                >
                  Pre-order Now
                </button>
              ) : (
                <button
                  style={styles.buyButton}
                  onClick={() => handleBuyClick(product)}
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedProduct && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Confirm Purchase</h3>
            <p>
              <strong>{selectedProduct.name}</strong>
            </p>
            <p>Price: {finalPrice} credits</p>
            <p>Are you sure you want to proceed with this purchase?</p>
            <div style={styles.modalButtons}>
              <button style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button style={styles.confirmButton} onClick={handleConfirmPurchase}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreOrderModalOpen && selectedProduct && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Confirm Pre-order</h3>
            <p>
              <strong>{selectedProduct.name}</strong>
            </p>
            <p>Price: {finalPrice} credits</p>
            <p>Are you sure you want to place a pre-order?</p>
            <div style={styles.modalButtons}>
              <button style={styles.cancelButton} onClick={handleCancelPreOrder}>
                Cancel
              </button>
              <button style={styles.confirmButton} onClick={handleConfirmPreOrder}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
      {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
};

// Styling
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    margin: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    borderBottom: '2px solid #ccc',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  creditsContainer: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
  },
  creditsText: {
    margin: 0,
    fontWeight: 'bold',
  },
  inventoryContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginTop: '20px',
  },
  productCard: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    width: '200px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // Distribute content evenly, ensuring buttons are at the bottom
    minHeight: '350px', // Set a minimum height for the container to make sure buttons are not out of view
  },
   
  productImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  productName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  buySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    justifyContent: 'flex-end',  // Align buttons to the bottom
    height: '100%',  // Ensure that the section fills the container to push buttons down
  }, 
  quantityButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
  },
  plusMinusButton: {
    padding: '5px 10px',
    fontSize: '18px',
    cursor: 'pointer',
  },
  quantityInput: {
    width: '50px',
    textAlign: 'center',
    fontSize: '16px',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    width: '300px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: '20px',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  successMessage: {
    marginTop: '20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: '20px',
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'center',
  },
};

export default ProductHome;
