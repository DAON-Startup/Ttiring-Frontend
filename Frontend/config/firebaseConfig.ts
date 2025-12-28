// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration (daon-47f9c - Backend 프로젝트와 동일)
const firebaseConfig = {
  apiKey: "AIzaSyCk0ypuopTg4nBdjZeq6xn6p0zj91SRHFQ",
  authDomain: "ttringincampus.firebaseapp.com",
  projectId: "ttringincampus",
  storageBucket: "ttringincampus.firebasestorage.app",
  messagingSenderId: "739614253674",
  appId: "1:739614253674:web:0dce0aac5b5ac648716013",
  measurementId: "G-X2M3S8W5Z7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication 초기화
const auth = getAuth(app);

// FCM 메시징 초기화
const messaging = getMessaging(app);

export { auth, messaging, getToken };
