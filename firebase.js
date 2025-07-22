// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5JRNEPkGaXsctWDWodcPGqIKSs8z-OTY",
  authDomain: "mteacc-4a1d3.firebaseapp.com",
  projectId: "mteacc-4a1d3",
  storageBucket: "mteacc-4a1d3.appspot.com",
  messagingSenderId: "920334438085",
  appId: "1:920334438085:web:2908e138097ccd7eaa6aac"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // 🔥 EZ kell az exporthoz

export { db }; // 🔥 Ezt exportálod
