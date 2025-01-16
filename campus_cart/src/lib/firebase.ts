import { initializeApp } from 'firebase/app';
import { User, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
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
const reauthenticateUser = async (user: User, currentPassword: string) => {
  const credential = EmailAuthProvider.credential(user.email!, currentPassword); // user.email might be null or undefined
  await reauthenticateWithCredential(user, credential);
};

// Update Password
const updateUserPassword = async (user: User, newPassword: string) => {
  await updatePassword(user, newPassword);
};

// Get All Users
const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(firestore, 'users'));
  const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return users;
};

const updatePasswordForUser = async (userId: string, newPassword: string) => {
  try {
    const auth = getAuth();
    const userRef = doc(firestore, 'users', userId); // Firestore reference to the user document
    
    // Assuming user is authenticated as an admin, we can directly update the password
    const user = await auth.getUser(userId); // Get user by ID
    await updatePassword(user, newPassword); // Update password in Firebase Authentication
    
    // Optionally, you can update additional fields in Firestore if needed
    await updateDoc(userRef, {
      passwordLastUpdated: new Date(), // Example: Add a timestamp for when the password was updated
    });
  } catch (error) {
    console.error('Error updating password:', error);
    throw new Error('Failed to update password');
  }
};

// Add User
const addUser = async (userData: { name: string, email: string, role: string }) => {
  const newUserRef = doc(collection(firestore, 'users'));
  await setDoc(newUserRef, userData);
};

// Update User Role (Suspend or change role)
const updateUserRole = async (userId: string, updatedData: { role: string, suspended: boolean }) => {
  const userRef = doc(firestore, 'users', userId);
  await setDoc(userRef, updatedData, { merge: true });
};

// Delete User
const deleteUser = async (userId: string) => {
  const userRef = doc(firestore, 'users', userId);
  await deleteDoc(userRef);
};

export { 
  auth, 
  firestore, 
  analytics, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  setDoc, 
  doc, 
  sendPasswordResetEmail, 
  reauthenticateUser, 
  updateUserPassword, 
  getAllUsers, 
  addUser, 
  updateUserRole, 
  deleteUser,
  updatePasswordForUser, 
};
