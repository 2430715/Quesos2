import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC-OSUp0PyYZH7nUPmTrjcMNB2DDoyDv6o",
  authDomain: "quesos2-app.firebaseapp.com",
  projectId: "quesos2-app",
  storageBucket: "quesos2-app.firebasestorage.app",
  messagingSenderId: "188236663328",
  appId: "1:188236663328:web:5852e21efd7fcffec9ca45",
  databaseURL: "https://quesos2-app-default-rtdb.firebaseio.com"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Manejo del formulario de login
const form = document.getElementById('loginForm');
const errEl = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errEl.textContent = '';
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirigir al panel protegido
    window.location.href = 'estadistica.html';
  } catch (err) {
    console.error(err);
    
    // Mensajes de error personalizados
    let mensaje = 'Error al iniciar sesión';
    if (err.code === 'auth/user-not-found') {
      mensaje = 'Usuario no encontrado';
    } else if (err.code === 'auth/wrong-password') {
      mensaje = 'Contraseña incorrecta';
    } else if (err.code === 'auth/invalid-email') {
      mensaje = 'Correo electrónico inválido';
    }
    
    errEl.textContent = mensaje;
  }
});
