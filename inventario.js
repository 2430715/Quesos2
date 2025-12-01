import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

let currentUid = null;
const auth = getAuth();
const db = getDatabase();

onAuthStateChanged(auth, (user) => {
  if (!user) return; // protect.js hace la redirección, aquí solo doble comprobación
  currentUid = user.uid;
  startSync();
});

function startSync() {
  if (!currentUid) return;
  const invRef = ref(db, `inventario/${currentUid}`);
  onValue(invRef, (snap) => {
    const data = snap.val() || {};
    renderTables(data);
  }, (err) => {
    console.error('Error sincronizando inventario:', err);
  });

  wireAddButtons();
}

function renderTables(data) {
  const quesos = data.quesos || {};
  const materia = data.materia || {};
  populateTable('table-quesos', quesos, 'quesos');
  populateTable('table-materia', materia, 'materia');
}

function populateTable(tableId, itemsObj, category) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;
  tbody.innerHTML = '';
  Object.entries(itemsObj).forEach(([key, item]) => {
    const tr = document.createElement('tr');
    tr.dataset.key = key;
    const cantidad = item.cantidad ?? '';
    const stockMin = item.stockMin ?? '';
    const low = cantidad !== '' && stockMin !== '' && Number(cantidad) < Number(stockMin);
    tr.innerHTML = `
      <td contenteditable="true" data-field="producto">${escapeHtml(item.producto ?? '')}</td>
      <td contenteditable="true" data-field="cantidad">${escapeHtml(cantidad)}</td>
      <td contenteditable="true" data-field="unidad">${escapeHtml(item.unidad ?? '')}</td>
      <td contenteditable="true" data-field="stockMin">${escapeHtml(stockMin)}</td>
      <td class="${low ? 'low-stock' : ''}">${low ? 'Bajo Stock' : 'Normal'}</td>
      <td>
        <button class="btn-action btn-save">Guardar</button>
        <button class="btn-action btn-delete">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);

    tr.querySelector('.btn-save').addEventListener('click', () => saveRow(category, key, tr));
    tr.querySelector('.btn-delete').addEventListener('click', () => deleteRow(category, key));
  });
}

function saveRow(category, key, tr) {
  if (!currentUid) return alert('Usuario no autenticado');
  const producto = tr.querySelector('[data-field="producto"]').textContent.trim();
  const cantidad = tr.querySelector('[data-field="cantidad"]').textContent.trim();
  const unidad = tr.querySelector('[data-field="unidad"]').textContent.trim();
  const stockMin = tr.querySelector('[data-field="stockMin"]').textContent.trim();
  const itemRef = ref(db, `inventario/${currentUid}/${category}/${key}`);
  set(itemRef, { producto, cantidad, unidad, stockMin }).catch(err => console.error('Error guardando fila:', err));
}

function deleteRow(category, key) {
  if (!currentUid) return alert('Usuario no autenticado');
  const itemRef = ref(db, `inventario/${currentUid}/${category}/${key}`);
  remove(itemRef).catch(err => console.error('Error eliminando fila:', err));
}

function wireAddButtons() {
  const addButtons = Array.from(document.querySelectorAll('.btn-add'));
  if (addButtons.length >= 1) {
    // Asumir orden: primer botón -> quesos, segundo -> materia
    addButtons.forEach((btn, idx) => {
      const category = idx === 0 ? 'quesos' : 'materia';
      btn.addEventListener('click', () => addNewItem(category));
    });
  }
}

function addNewItem(category) {
  if (!currentUid) return alert('Usuario no autenticado');
  const listRef = ref(db, `inventario/${currentUid}/${category}`);
  // item por defecto
  push(listRef, { producto: 'Nuevo', cantidad: '0', unidad: 'kg', stockMin: '0' }).catch(err => console.error('Error agregando item:', err));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>\"']/g, (s) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}
