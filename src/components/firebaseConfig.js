import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBAL6dBWuuqAYoDVtCzimJz5cZssIIxLzc",
    authDomain: "physiq-8c1d0.firebaseapp.com",
    projectId: "physiq-8c1d0",
    storageBucket: "physiq-8c1d0.firebasestorage.app",
    messagingSenderId: "877965642931",
    appId: "1:877965642931:web:b2a1aa36ba45a968aaf4c6",
    measurementId: "G-K22SE3F1LJ"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
