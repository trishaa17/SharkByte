import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import './Home.css';

const Home = () => {
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const auth = getAuth();
  const db = getFirestore();

  const items = [
    { id: 1, name: 'Notebook', price: 10 },
    { id: 2, name: 'Pen', price: 2 },
    { id: 3, name: 'Backpack',
      { id: 4, name: 'Water Bottle', price: 15 },
    ];
  
    const currentUser = auth.currentUser;
  
    const handleBuyClick = (itemName: string) => {
      setSelectedItem(itemName);
      setShowConfirmation(true);
    };
  
    const handleConfirmPurchase = async () => {
      if (!currentUser) {
        setPopupMessage('You must be logged in to make a purchase.');
        setShowConfirmation(false);
        return;
      }
  
      const { displayName, email } = currentUser;
  
      try {
        const userProductsRef = doc(collection(db, 'userProducts'), email as string);
        
        await setDoc(
          userProductsRef,
          { 
            fullName: displayName,
            email: email,
            purchasedItems: arrayUnion(selectedItem),
          },
          { merge: true }
        );
  
        setPopupMessage(`${selectedItem} has been added to your products.`);
      } catch (error) {
        setPopupMessage('Error saving purchase. Please try again.');
      }
  
      setShowConfirmation(false);
      setSelectedItem(null);
    };
  
    const handleCancelPurchase = () => {
      setShowConfirmation(false);
      setSelectedItem(null);
    };
  
    const handlePreorderClick = (itemName: string) => {
      setPopupMessage(`${itemName} preordered`);
    };
  
    const handleClosePopup = () => {
      setPopupMessage(null);
    };
  
    return (
      <div className="home-page">
        <h1 className="header">Campus Cart</h1>
  
        <div className="items-container">
          {items.map((item) => (
            <div className="item-box" key={item.id}>
              <h3>{item.name}</h3>
              <p>Price: ${item.price}</p>
              <div className="button-container">
                <button className="buy-button" onClick={() => handleBuyClick(item.name)}>
                  Buy
                </button>
                <button className="preorder-button" onClick={() => handlePreorderClick(item.name)}>
                  Preorder
                </button>
              </div>
            </div>
          ))}
        </div>
  
        {/* Confirmation Popup */}
        {showConfirmation && (
          <div className="popup-overlay">
            <div className="popup">
              <p>Do you confirm you want to purchase {selectedItem}?</p>
              <div className="popup-buttons">
                <button className="yes-button" onClick={handleConfirmPurchase}>
                  Yes
                </button>
                <button className="no-button" onClick={handleCancelPurchase}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Message Popup */}
        {popupMessage && (
          <div className="popup-overlay">
            <div className="popup">
              <p>{popupMessage}</p>
              <button className="close-popup-button" onClick={handleClosePopup}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
export default Home;
  