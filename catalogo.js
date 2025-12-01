import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

let currentUid = null;
const auth = getAuth();
const db = getDatabase();

onAuthStateChanged(auth, (user) => {
  if (!user) return;
  currentUid = user.uid;
  startSync();
});

function startSync() {
  if (!currentUid) return;
  const catalogoRef = ref(db, `catalogo/${currentUid}`);
  onValue(catalogoRef, (snap) => {
    const data = snap.val() || {};
    renderTable(data);
  }, (err) => {
    console.error('Error sincronizando catálogo:', err);
  });

  wireAddButton();
}

function renderTable(itemsObj) {
  const tbody = document.querySelector('#tablaCatalogo tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  Object.entries(itemsObj).forEach(([key, item]) => {
    const tr = document.createElement('tr');
    tr.dataset.key = key;
    tr.innerHTML = `
      <td contenteditable="true" data-field="nombre">${escapeHtml(item.nombre ?? '')}</td>
      <td contenteditable="true" data-field="descripcion">${escapeHtml(item.descripcion ?? '')}</td>
      <td contenteditable="true" data-field="precio">${escapeHtml(item.precio ?? '')}</td>
      <td contenteditable="true" data-field="disponible">${escapeHtml(item.disponible ?? 'Sí')}</td>
      <td>
        <button class="btn-action btn-save">Guardar</button>
        <button class="btn-action btn-delete">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);

    tr.querySelector('.btn-save').addEventListener('click', () => saveRow(key, tr));
    tr.querySelector('.btn-delete').addEventListener('click', () => deleteRow(key));
  });
}

function saveRow(key, tr) {
  if (!currentUid) return alert('Usuario no autenticado');
  const nombre = tr.querySelector('[data-field="nombre"]').textContent.trim();
  const descripcion = tr.querySelector('[data-field="descripcion"]').textContent.trim();
  const precio = tr.querySelector('[data-field="precio"]').textContent.trim();
  const disponible = tr.querySelector('[data-field="disponible"]').textContent.trim();
  const itemRef = ref(db, `catalogo/${currentUid}/${key}`);
  set(itemRef, { nombre, descripcion, precio, disponible }).catch(err => console.error('Error guardando producto:', err));
}

function deleteRow(key) {
  if (!currentUid) return alert('Usuario no autenticado');
  const itemRef = ref(db, `catalogo/${currentUid}/${key}`);
  remove(itemRef).catch(err => console.error('Error eliminando producto:', err));
}

function wireAddButton() {
  const addBtn = document.querySelector('.btn-add');
  if (addBtn) {
    addBtn.addEventListener('click', () => addNewProduct());
  }
}

function addNewProduct() {
  if (!currentUid) return alert('Usuario no autenticado');
  const listRef = ref(db, `catalogo/${currentUid}`);
  push(listRef, { nombre: 'Nuevo Producto', descripcion: '', precio: '$0', disponible: 'Sí' }).catch(err => console.error('Error agregando producto:', err));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}
