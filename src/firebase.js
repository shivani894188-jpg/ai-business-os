import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZE-kdyVxLERctHJQrbn3GpHmhAStdvXQ",
  authDomain: "ai-business-os-77929.firebaseapp.com",
  projectId: "ai-business-os-77929",
  storageBucket: "ai-business-os-77929.firebasestorage.app",
  messagingSenderId: "978397034193",
  appId: "1:978397034193:web:cdfcd374c9f318d7f6b7f0",
  measurementId: "G-D9621JEK3N"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);