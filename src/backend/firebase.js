// firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeuNHOd96qSCeEeDNsS7JPVY9rF_ZMR8Y",
  authDomain: "taskflow-affe5.firebaseapp.com",
  projectId: "taskflow-affe5",
  storageBucket: "taskflow-affe5.firebasestorage.app",
  messagingSenderId: "855951482555",
  appId: "1:855951482555:web:0619e911339f59eedb939e",
  measurementId: "G-Q855K0647R",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);
export { db, auth };
