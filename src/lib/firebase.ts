import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjUGtm8agPMichnAWFlo0xGe5t1psrSU4",
  authDomain: "lamp-study.firebaseapp.com",
  projectId: "lamp-study",
  storageBucket: "lamp-study.firebasestorage.app",
  messagingSenderId: "780238179625",
  appId: "1:780238179625:web:03a7997d95ec3460d5bb38",
  measurementId: "G-L2XR4643QH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
