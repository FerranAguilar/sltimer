/* cfg-sheet-patch.js – Editar configuración de sesión desde la pantalla del cronómetro */

/* Variables locales del sheet */
let _cfgTmpTra = 3;
let _cfgTmpPals = []; // [{name, category, id, isTemp}]

/* Hacer clicable el display del cronómetro */
document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('chrono-display');
  if (display) {
    display.style.cursor = 'pointer';
    display.title = 'Editar configuración de sesión';
    display.addEventListener('click', () => {
      if (!_cfg) return;
      openCfgSheet();
    });
  }
});

/* ── ABRIR SHEET ── */
function openCfgSheet() {
  if (!_cfg) return;

  // Cargar valores actuales
  document.getElementById('cfg-edit-name').value = _cfg.name || '';
  document.getElementById('cfg-edit-lugar').value = _cfg.lugar || '';
  _cfgTmpTra = _cfg.nTra;
  document.getElementById('cfg-edit-val-tra').textContent = _cfgTmpTra;

  // Clonar palistas para editar sin mutar _cfg
  _cfgTmpPals = _cfg.palistas.map(p => ({ ...p }));
  renderCfgPalList();

  document.getElementById('cfg-sheet-backdrop').classList.add('open');
  setTimeout(() => document.getElementById('cfg-sheet').classList.add('open'), 10);
}

/* ── CERRAR SHEET ── */
function closeCfgSheet() {
  document.getElementById('cfg-sheet').classList.remove('open');
  document.getElementById('cfg-sheet-backdrop').classList.remove('open');
}

/* ── AJUSTAR TRAMOS ── */
function adjCfgEdit(key, delta) {
  if (key === 'tra') {
    _cfgTmpTra = Math.min(12, Math.max(1, _cfgTmpTra + delta));
    document.getElementById('cfg-edit-val-tra').textContent = _cfgTmpTra;
  }
}

/* ── RENDERIZAR LISTA DE PALISTAS EDITABLES ── */
function renderCfgPalList() {
  const container = document.getElementById('cfg-edit-pal-list');
  container.innerHTML = '';

  _cfgTmpPals.forEach((pal, i) => {
    const row = document.createElement('div');
    row.className = 'pal-row';
    row.id = 'cfg-pal-row-' + i;
    row.innerHTML = `
      <div class="pal-row-top">
        <div class="pal-num">${i + 1}</div>
        <div class="pal-search-wrap">
          <input
            class="pal-input${pal.name && !pal.isTemp ? ' matched' : ''}"
            id="cfg-pal-input-${i}"
            type="text"
            placeholder="Buscar palista\u2026"
            value="${(pal.name || '').replace(/"/g, '&quot;')}"
            autocomplete="off" autocorrect="off" spellcheck="false"
            oninput="onCfgPalInput(${i})"
            onfocus="openCfgDropdown(${i})"
            onblur="delayCfgClose(${i})"
          >
          <button class="pal-clear${pal.name ? ' show' : ''}" id="cfg-pal-clear-${i}" onclick="clearCfgPal(${i})">&#x2715;</button>
          <div class="pal-dropdown" id="cfg-pal-dd-${i}"></div>
        </div>
      </div>
      <div id="cfg-pal-cat-wrap-${i}" style="display:${pal.name ? 'flex' : 'none'};flex-direction:column;gap:4px">
        <div class="cat-label">Categor&#237;a</div>
        <div class="cat-selector">
          <button class="cat-btn K1${pal.category === 'K1' ? ' active' : ''}" onclick="setCfgCat(${i},'K1')">K1</button>
          <button class="cat-btn C1${pal.category === 'C1' ? ' active' : ''}" onclick="setCfgCat(${i},'C1')">C1</button>
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}

/* ── INPUT PALISTA ── */
function onCfgPalInput(i) {
  const val = document.getElementById('cfg-pal-input-' + i).value;
  _cfgTmpPals[i].name = val;
  _cfgTmpPals[i].id = null;
  _cfgTmpPals[i].isTemp = true;
  document.getElementById('cfg-pal-clear-' + i).classList.toggle('show', val.length > 0);
  showCfgCatSelector(i, val.length > 0);
  openCfgDropdown(i);
}

function openCfgDropdown(i) {
  const q = (document.getElementById('cfg-pal-input-' + i).value || '').toLowerCase().trim();
  const dd = document.getElementById('cfg-pal-dd-' + i);
  if (!q || !_athletes) { dd.classList.remove('open'); dd.innerHTML = ''; return; }
  const matches = _athletes.filter(a =>
    ((a.name || '') + ' ' + (a.surname || '')).toLowerCase().includes(q)
  ).slice(0, 8);
  if (!matches.length) { dd.classList.remove('open'); dd.innerHTML = ''; return; }
  dd.innerHTML = matches.map(a => {
    const fn = a.name + (a.surname ? ' ' + a.surname : '');
    const cats = (a.categories || []).filter(c => c === 'K1' || c === 'C1')
      .map(c => `<span class="cat-badge ${c}">${c}</span>`).join('');
    return `<div class="pal-option" onmousedown="selectCfgAthlete(${i},'${a.id}','${fn.replace(/'/g, "\\'")}',[${(a.categories || []).filter(c => c === 'K1' || c === 'C1').map(c => `'${c}'`).join(',')}])">
      <span class="pal-option-name">${fn}</span>
      <span class="pal-option-cats">${cats}</span>
    </div>`;
  }).join('');
  dd.classList.add('open');
}

function delayCfgClose(i) {
  setTimeout(() => {
    const dd = document.getElementById('cfg-pal-dd-' + i);
    if (dd) dd.classList.remove('open');
  }, 150);
}

function selectCfgAthlete(i, id, name, cats) {
  _cfgTmpPals[i] = { id, name, isTemp: false, category: cats.length === 1 ? cats[0] : (_cfgTmpPals[i].category || null) };
  const inp = document.getElementById('cfg-pal-input-' + i);
  inp.value = name;
  inp.classList.add('matched');
  document.getElementById('cfg-pal-clear-' + i).classList.add('show');
  document.getElementById('cfg-pal-dd-' + i).classList.remove('open');
  showCfgCatSelector(i, true);
  if (cats.length === 1) setCfgCatUI(i, cats[0]);
  else setCfgCatUI(i, _cfgTmpPals[i].category);
}

function clearCfgPal(i) {
  _cfgTmpPals[i] = { id: null, name: '', category: null, isTemp: false };
  const inp = document.getElementById('cfg-pal-input-' + i);
  inp.value = '';
  inp.classList.remove('matched');
  document.getElementById('cfg-pal-clear-' + i).classList.remove('show');
  document.getElementById('cfg-pal-dd-' + i).classList.remove('open');
  showCfgCatSelector(i, false);
}

function showCfgCatSelector(i, show) {
  const el = document.getElementById('cfg-pal-cat-wrap-' + i);
  if (el) el.style.display = show ? 'flex' : 'none';
}

function setCfgCat(i, cat) {
  _cfgTmpPals[i].category = cat;
  setCfgCatUI(i, cat);
}

function setCfgCatUI(i, cat) {
  const w = document.getElementById('cfg-pal-cat-wrap-' + i);
  if (!w) return;
  w.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.classList.contains(cat)));
}

/* ── APLICAR CAMBIOS ── */
function applyCfgEdit() {
  const newName = document.getElementById('cfg-edit-name').value.trim();
  const newLugar = document.getElementById('cfg-edit-lugar').value.trim();
  if (!newName) { toast('Introduce un nombre para la sesi\u00f3n', 'err'); return; }

  const newNTra = _cfgTmpTra;
  const newPalistas = _cfgTmpPals.map((p, i) => ({
    name: (p.name || '').trim() || ('Palista ' + (i + 1)),
    category: p.category || null,
    id: p.id || null,
    isTemp: p.isTemp
  }));

  /* Ajustar la matriz _times y _mangas si cambia nTra */
  if (newNTra !== _cfg.nTra) {
    for (let pi = 0; pi < _cfg.nPal; pi++) {
      // Añadir columnas si hay más tramos
      while (_times[pi].length < newNTra) { _times[pi].push([]); _mangas[pi].push(1); }
      // Recortar si hay menos (preguntar si hay datos)
      if (newNTra < _cfg.nTra) {
        _times[pi] = _times[pi].slice(0, newNTra);
        _mangas[pi] = _mangas[pi].slice(0, newNTra);
      }
    }
  }

  /* Actualizar _cfg */
  _cfg.name = newName;
  _cfg.lugar = newLugar;
  _cfg.nTra = newNTra;
  _cfg.palistas = newPalistas;

  /* Refrescar UI */
  document.getElementById('topbar-title').textContent = newName;
  document.getElementById('ses-title').textContent = newName;
  const parts = [];
  if (newLugar) parts.push(newLugar);
  if (_cfg.fecha) parts.push(new Date(_cfg.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }));
  document.getElementById('ses-meta').textContent = parts.join(' \u00b7 ');

  // Reconstruir chips de palistas
  _chipsSeen = newPalistas.map((_, i) => i);
  renderChips(_cfg);

  // Reconstruir selector de tramos
  buildSelTra(_cfg);

  // Reconstruir tabla
  buildTimesTable(_cfg);

  // Si el palista/tramo activo ya no es válido, reset
  if (_selPal >= _cfg.nPal) { _selPal = 0; }
  if (_selTramo >= _cfg.nTra) { _selTramo = 0; document.getElementById('sel-tra').value = 0; }
  syncMangaVal();
  updateChronoCtx();

  closeCfgSheet();
  toast('Configuraci\u00f3n actualizada \u2713', 'ok');
}
