import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

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
  
  // Escuchar cambios en inventario
  const inventarioRef = ref(db, `inventario/${currentUid}`);
  onValue(inventarioRef, (snap) => {
    const inv = snap.val() || {};
    updateInventarioKPIs(inv);
  }, (err) => console.error('Error inventario:', err));

  // Escuchar cambios en pedidos (opcional, si existe esa rama)
  const pedidosRef = ref(db, `pedidos/${currentUid}`);
  onValue(pedidosRef, (snap) => {
    const ped = snap.val() || {};
    updatePedidosKPIs(ped);
  }, (err) => console.error('Error pedidos:', err));

  // Escuchar estadísticas directas
  const estadisticasRef = ref(db, `estadistica/${currentUid}`);
  onValue(estadisticasRef, (snap) => {
    const stats = snap.val() || {};
    updateStatsKPIs(stats);
  }, (err) => console.error('Error estadísticas:', err));
}

function updateInventarioKPIs(inventario) {
  // Calcular bajo stock
  let lowStockCount = 0;
  const quesos = inventario.quesos || {};
  const materia = inventario.materia || {};

  Object.values(quesos).forEach((item) => {
    const cantidad = Number(item.cantidad || 0);
    const minimo = Number(item.stockMin || 0);
    if (cantidad < minimo) lowStockCount++;
  });

  Object.values(materia).forEach((item) => {
    const cantidad = Number(item.cantidad || 0);
    const minimo = Number(item.stockMin || 0);
    if (cantidad < minimo) lowStockCount++;
  });

  // Buscar leche cruda
  let lecheCruda = 0;
  Object.values(materia).forEach((item) => {
    if (item.producto && item.producto.toLowerCase().includes('leche')) {
      lecheCruda += Number(item.cantidad || 0);
    }
  });

  // Actualizar DOM
  const kpiAlerta = document.querySelector('.kpi-grid .kpi-card:nth-child(3) .value');
  if (kpiAlerta) kpiAlerta.textContent = lowStockCount + ' Tipos';

  const kpiLeche = document.querySelector('.kpi-grid .kpi-card:nth-child(2) .value');
  if (kpiLeche) kpiLeche.textContent = lecheCruda + ' L';
}

function updatePedidosKPIs(pedidos) {
  // Contar pedidos pendientes
  let pendientes = 0;
  Object.values(pedidos).forEach((pedido) => {
    if (pedido.estado && pedido.estado.toLowerCase() === 'pendiente') {
      pendientes++;
    }
  });

  // Actualizar DOM
  const kpiPedidos = document.querySelector('.kpi-grid .kpi-card:nth-child(1) .value');
  if (kpiPedidos) kpiPedidos.textContent = pendientes;
}

function updateStatsKPIs(stats) {
  // Si hay un lote próximo a caducar en estadísticas
  const loteCaducaKpi = document.querySelector('.kpi-grid .kpi-card:nth-child(4) .value');
  if (loteCaducaKpi && stats.loteCaduca) {
    loteCaducaKpi.textContent = stats.loteCaduca;
  }
}
