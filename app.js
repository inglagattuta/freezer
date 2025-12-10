import React, { useState, useEffect } from 'react';
import { Snowflake, Plus, Trash2, Edit2, Check, X, Calendar, Package, LogIn, LogOut, User } from 'lucide-react';

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBmWi-5wQ97PA4TanAC5mHFAqmsNR9aUpE",
  authDomain: "lista-spesa-famiglia-95127.firebaseapp.com",
  databaseURL: "https://lista-spesa-famiglia-95127-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lista-spesa-famiglia-95127",
  storageBucket: "lista-spesa-famiglia-95127.firebasestorage.app",
  messagingSenderId: "131762886904",
  appId: "1:131762886904:web:04b14e5c7567c78de9c30d"
};

export default function FreezerInventory() {
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pezzi',
    category: 'carne',
    addedDate: new Date().toISOString().split('T')[0],
    expiryDate: ''
  });

  // Inizializza Firebase
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
    script1.async = true;

    const script2 = document.createElement('script');
    script2.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';
    script2.async = true;

    const script3 = document.createElement('script');
    script3.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
    script3.async = true;

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 3) {
        try {
          window.firebase.initializeApp(firebaseConfig);
          setFirebaseReady(true);
          
          window.firebase.auth().onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
          });
        } catch (err) {
          console.error('Errore inizializzazione Firebase:', err);
          setError('Errore configurazione Firebase. Verifica le credenziali.');
          setLoading(false);
        }
      }
    };

    script1.onload = onLoad;
    script2.onload = onLoad;
    script3.onload = onLoad;

    document.head.appendChild(script1);
    document.head.appendChild(script2);
    document.head.appendChild(script3);

    return () => {
      try {
        document.head.removeChild(script1);
        document.head.removeChild(script2);
        document.head.removeChild(script3);
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (user && firebaseReady) {
      loadItems();
    } else {
      setItems([]);
    }
  }, [user, firebaseReady]);

  const loadItems = () => {
    if (!user) return;
    
    const db = window.firebase.firestore();
    db.collection('users').doc(user.uid).collection('items')
      .orderBy('addedDate', 'desc')
      .onSnapshot((snapshot) => {
        const loadedItems = [];
        snapshot.forEach((doc) => {
          lo
