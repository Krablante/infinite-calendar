import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type Auth, type User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmIpBptHzskwsoAMTf18Ko2eRrnOl3G7o",
  authDomain: "infinite-calendar.firebaseapp.com",
  projectId: "infinite-calendar",
  storageBucket: "infinite-calendar.firebasestorage.app",
  messagingSenderId: "333007857994",
  appId: "1:333007857994:web:84942e8ed6538dba2c79b3"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc };
export type { FirebaseUser };
