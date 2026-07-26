// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Replace these placeholder values with your actual Firebase project config credentials from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD1NTm52z5Lju4KRIckt91dl1XGeCr8p2A",
  authDomain: "beejah-stitches.firebaseapp.com",
  projectId: "beejah-stitches",
  storageBucket: "beejah-stitches.firebasestorage.app",
  messagingSenderId: "708611868762",
  appId: "1:708611868762:web:03bc3ad92ad90c9503f063",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the core services you will need for BeeJah Stiches
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
