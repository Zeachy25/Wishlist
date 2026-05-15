import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPueEJEKPLGy1imXg68SrPiyybMYcje74",
  authDomain: "itmsd-78c0a.firebaseapp.com",
  projectId: "itmsd-78c0a",
  storageBucket: "itmsd-78c0a.firebasestorage.app",
  messagingSenderId: "78618300848",
  appId: "1:78618300848:web:948f53443d4a8577db0675",
  measurementId: "G-642RYQS1PB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with persistence based on platform
let firebaseAuth;

if (Platform.OS === 'web') {
  firebaseAuth = getAuth(app);
} else {
  // @ts-ignore
  firebaseAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export const auth = firebaseAuth;
export default app;
