// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:   import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "grubgo-caihoanglong03.firebaseapp.com",
  projectId: "grubgo-caihoanglong03",
  storageBucket: "grubgo-caihoanglong03.firebasestorage.app",
  messagingSenderId: "1009649546587",
  appId: "1:1009649546587:web:6cb2f73659602a2a11167e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app, auth};