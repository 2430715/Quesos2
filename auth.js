import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

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
const db = getDatabase(app);

// Manejo del formulario
const form = document.getElementById('registerForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const factory_name = document.getElementById('factory_name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const street = document.getElementById('street').value.trim();
  const city = document.getElementById('city').value.trim();
  const postal = document.getElementById('postal').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm_password').value;

  if (password !== confirm) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guarda datos adicionales en Realtime Database
    await set(ref(db, 'admins/' + user.uid), {
      name,
      factory_name,
      phone,
      address: {
        street,
        city,
        postal
      },
      email,
      createdAt: new Date().toISOString()
    });

    alert('¡Cuenta creada exitosamente!');
    // Redirige a estadistica.html
    window.location.href = 'estadistica.html';
  } catch (err) {
    console.error(err);
    alert('Error: ' + err.message);
  }
});
