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
          loadedItems.push({ id: doc.id, ...doc.data() });
        });
        setItems(loadedItems);
      }, (err) => {
        console.error('Errore caricamento:', err);
        setError('Errore nel caricamento dei dati');
      });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await window.firebase.auth().createUserWithEmailAndPassword(email, password);
      } else {
        await window.firebase.auth().signInWithEmailAndPassword(email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Email già registrata');
          break;
        case 'auth/invalid-email':
          setError('Email non valida');
          break;
        case 'auth/user-not-found':
          setError('Utente non trovato');
          break;
        case 'auth/wrong-password':
          setError('Password errata');
          break;
        case 'auth/weak-password':
          setError('Password troppo debole (min 6 caratteri)');
          break;
        default:
          setError('Errore di autenticazione');
      }
    }
  };

  const handleLogout = async () => {
    await window.firebase.auth().signOut();
  };

  const addItem = async () => {
    if (!user) return;
    
    try {
      const db = window.firebase.firestore();
      await db.collection('users').doc(user.uid).collection('items').add({
        ...formData,
        addedDate: formData.addedDate || new Date().toISOString().split('T')[0],
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });
      resetForm();
    } catch (err) {
      console.error('Errore aggiunta:', err);
      setError('Errore nell\'aggiunta del prodotto');
    }
  };

  const updateItem = async () => {
    if (!user) return;
    
    try {
      const db = window.firebase.firestore();
      await db.collection('users').doc(user.uid).collection('items').doc(editingId).update(formData);
      resetForm();
    } catch (err) {
      console.error('Errore modifica:', err);
      setError('Errore nella modifica del prodotto');
    }
  };

  const deleteItem = async (id) => {
    if (!user) return;
    
    try {
      const db = window.firebase.firestore();
      await db.collection('users').doc(user.uid).collection('items').doc(id).delete();
    } catch (err) {
      console.error('Errore eliminazione:', err);
      setError('Errore nell\'eliminazione del prodotto');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      addedDate: item.addedDate,
      expiryDate: item.expiryDate || ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 1,
      unit: 'pezzi',
      category: 'carne',
      addedDate: new Date().toISOString().split('T')[0],
      expiryDate: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const categories = {
    carne: '🥩',
    pesce: '🐟',
    verdure: '🥦',
    frutta: '🍓',
    pane: '🍞',
    preparati: '🍲',
    altro: '📦'
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryColor = (days) => {
    if (days === null) return '';
    if (days < 0) return 'text-red-600';
    if (days <= 7) return 'text-orange-600';
    if (days <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Snowflake className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Snowflake className="w-10 h-10 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-800">Inventario Freezer</h1>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              {isSignUp ? 'Registrati' : 'Accedi'}
            </button>
          </form>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="w-full mt-4 text-blue-500 hover:text-blue-600 text-sm"
          >
            {isSignUp ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Snowflake className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Inventario Freezer</h1>
                <p className="text-gray-600">{items.length} prodotti totali</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg mr-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showAddForm ? 'Annulla' : 'Aggiungi'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? 'Modifica prodotto' : 'Nuovo prodotto'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome prodotto</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Es. Pollo a pezzi"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantità</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unità</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pezzi">pezzi</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="confezioni">confezioni</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.keys(categories).map(cat => (
                    <option key={cat} value={cat}>
                      {categories[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data inserimento</label>
                <input
                  type="date"
                  value={formData.addedDate}
                  onChange={(e) => setFormData({...formData, addedDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Data scadenza (opzionale)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={editingId ? updateItem : addItem}
                disabled={!formData.name}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-5 h-5" />
                {editingId ? 'Salva modifiche' : 'Aggiungi al freezer'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        )}

        {Object.keys(groupedItems).length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Il tuo freezer è vuoto</p>
            <p className="text-gray-400 text-sm">Aggiungi il primo prodotto per iniziare</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <span className="text-2xl">{categories[category]}</span>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    <span className="ml-auto bg-white/20 px-2 py-1 rounded text-sm">
                      {categoryItems.length}
                    </span>
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {categoryItems.map(item => {
                    const daysLeft = getDaysUntilExpiry(item.expiryDate);
                    return (
                      <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">{item.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span className="font-medium">
                                {item.quantity} {item.unit}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(item.addedDate).toLocaleDateString('it-IT')}
                              </span>
                              {item.expiryDate && (
                                <span className={`font-medium ${getExpiryColor(daysLeft)}`}>
                                  {daysLeft < 0 ? 'Scaduto' : 
                                   daysLeft === 0 ? 'Scade oggi' :
                                   `Scade tra ${daysLeft} giorni`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
