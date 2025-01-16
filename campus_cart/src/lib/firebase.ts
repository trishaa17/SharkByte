import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth'; // Import auth functions
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDh8lfaKhWBeCBG_Zya2H88k6ZGFaDqycg",
  authDomain: "campuscart-94eea.firebaseapp.com",
  projectId: "campuscart-94eea",
  storageBucket: "campuscart-94eea.firebasestorage.app",
  messagingSenderId: "277210928267",
  appId: "1:277210928267:web:8c5756ea7cc9107995308e",
  measurementId: "G-6M8ZY84579"
};

const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

// Reauthenticate User
const reauthenticateUser = async (user, currentPassword) => {
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
};

// Update Password
const updateUserPassword = async (user, newPassword) => {
  await updatePassword(user, newPassword);
};

export { auth, firestore, analytics, signInWithEmailAndPassword, createUserWithEmailAndPassword, setDoc, doc, sendPasswordResetEmail, reauthenticateUser, updateUserPassword };
