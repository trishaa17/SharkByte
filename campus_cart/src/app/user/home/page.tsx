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
        const purchaseRef = collection(db, 'purchases');
        await addDoc(purchaseRef, {
          productName: selectedProduct.name,
          quantity,
          totalAmount: totalPrice,
          userEmail: user.email || 'Unknown',
          userFirstName: firstName,
          userLastName: lastName,
          purchasedOn: new Date().toISOString(),
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
          preOrderDate: new Date().toISOString(),
          status: 'pre-order',  // Set as pre-order
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
                  onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value, 10))}
                  style={styles.quantityInput}
                />
                <button
                  style={styles.plusMinusButton}
                  onClick={() => handleQuantityChange(product.id, 1)}
                >
                  +
                </button>
              </div>

              {product.quantity > 0 ? (
                <button
                  style={styles.buyButton}
                  onClick={() => handleBuyClick(product)}
                >
                  Buy
                </button>
              ) : (
                <button
                  style={styles.preOrderButton}
                  onClick={() => handlePreOrderClick(product)}
                >
                  Pre-order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for purchase confirmation */}
      {isModalOpen && (
        <div style={styles.modal}>
          <h2>Confirm Purchase</h2>
          <p>Product: {selectedProduct?.name}</p>
          <p>Total Price: {finalPrice}</p>
          <p>Quantity: {quantities[selectedProduct?.id || '']}</p>
          <button style={styles.confirmButton} onClick={handleConfirmPurchase}>
            Confirm Purchase
          </button>
          <button style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Modal for Pre-order confirmation */}
      {isPreOrderModalOpen && (
        <div style={styles.modal}>
          <h2>Confirm Pre-order</h2>
          <p>Product: {selectedProduct?.name}</p>
          <p>Total Price: {finalPrice}</p>
          <p>Quantity: {quantities[selectedProduct?.id || '']}</p>
          <button style={styles.confirmButton} onClick={handleConfirmPreOrder}>
            Confirm Pre-order
          </button>
          <button style={styles.cancelButton} onClick={handleCancelPreOrder}>
            Cancel
          </button>
        </div>
      )}

      {/* Display success or error messages */}
      {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
      {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}
    </div>
  );
};

// Add your custom styles here (e.g., for container, inventory, modal, buttons)
const styles = {
  container: {
    padding: '20px',
  },
  header: {
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
  },
  creditsContainer: {
    marginTop: '10px',
  },
  creditsText: {
    fontSize: '1rem',
  },
  inventoryContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  productCard: {
    border: '1px solid #ddd',
    padding: '10px',
    borderRadius: '5px',
    textAlign: 'center',
  },
  productImage: {
    width: '100%',
    height: 'auto',
  },
  buySection: {
    marginTop: '10px',
  },
  quantityButtons: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px',
  },
  plusMinusButton: {
    fontSize: '1.5rem',
    padding: '5px 10px',
    margin: '0 10px',
  },
  quantityInput: {
    width: '50px',
    textAlign: 'center',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    borderRadius: '5px',
  },
  preOrderButton: {
    backgroundColor: '#ff9800',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    borderRadius: '5px',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px',
    borderRadius: '5px',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
  },
  successMessage: {
    color: 'green',
    marginTop: '10px',
    textAlign: 'center',
  },
  errorMessage: {
    color: 'red',
    marginTop: '10px',
    textAlign: 'center',
  },
};

export default ProductHome;
