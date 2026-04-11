import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBPbi9O2i0d8YHj4i0or8eiCU0HWw2sdHk",
  authDomain: "nusantaraassets-5.firebaseapp.com",
  projectId: "nusantaraassets-5",
  storageBucket: "nusantaraassets-5.firebasestorage.app",
  messagingSenderId: "952451313501",
  appId: "1:952451313501:web:bc7c7f8ae3fb6e1a0e82b4",
};

// Pastikan kodenya seperti ini agar tidak bentrok pas refresh
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
