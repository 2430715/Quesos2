import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onIdTokenChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// protect.js (módulo) - incluir como: <script type="module" src="./protect.js"></script>

// Configuración de Firebase (misma que en auth/login)
const firebaseConfig = {
  apiKey: "AIzaSyC-OSUp0PyYZH7nUPmTrjcMNB2DDoyDv6o",
  authDomain: "quesos2-app.firebaseapp.com",
  projectId: "quesos2-app",
  storageBucket: "quesos2-app.firebasestorage.app",
  messagingSenderId: "188236663328",
  appId: "1:188236663328:web:5852e21efd7fcffec9ca45",
  databaseURL: "https://quesos2-app-default-rtdb.firebaseio.com"
};

// Inicializa la app si no existe
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Redirige a login si no hay usuario autenticado o token expira
onIdTokenChanged(auth, (user) => {
  if (!user) {
    if (!location.pathname.endsWith('login.html')) {
      location.href = 'login.html';
    }
  }
});

// Función global para cerrar sesión
window.signOutUser = function() {
  signOut(auth)
    .then(() => {
      location.href = 'login.html';
    })
    .catch((err) => {
      console.error('Error cerrando sesión:', err);
      alert('Error al cerrar sesión. Intenta de nuevo.');
    });
};
