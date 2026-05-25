
// ── PATCH: Sheet editar configuración de sesión ──────────────────────────────
// Estas funciones estaban referenciadas en el HTML pero no implementadas.

function openCfgSheet() {
  if (!_cfg) return;
  _cfgEditPal = _cfg.nPal;
  _cfgEditTra = _cfg.nTra;
  // Clonar estado actual de palistas
  _cfgEditPalState = _cfg.palistas.map(p => ({
    id: p.id || null,
    name: p.name || '',
    category: p.category || null,
    isTemp: p.isTemp || false
  }));
  document.getElementById('cfg-edit-name').value  = _cfg.name  || '';
  document.getElementById('cfg-edit-lugar').value = _cfg.lugar || '';
  document.getElementById('cfg-edit-val-pal').textContent = _cfgEditPal;
  document.getElementById('cfg-edit-val-tra').textContent = _cfgEditTra;
  buildCfgEditPalList();
  document.getElementById('cfg-sheet-backdrop').classList.add('open');
  document.getElementById('cfg-sheet').classList.add('open');
}

function closeCfgSheet() {
  document.getElementById('cfg-sheet-backdrop').classList.remove('open');
  document.getElementById('cfg-sheet').classList.remove('open');
}

function adjCfgEdit(key, delta) {
  if (key === 'pal') {
    _cfgEditPal = Math.min(MAX.pal, Math.max(MIN.pal, _cfgEditPal + delta));
    document.getElementById('cfg-edit-val-pal').textContent = _cfgEditPal;
    // Ajustar array de estado de palistas
    while (_cfgEditPalState.length < _cfgEditPal)
      _cfgEditPalState.push({ id: null, name: '', category: null, isTemp: false });
    _cfgEditPalState = _cfgEditPalState.slice(0, _cfgEditPal);
    buildCfgEditPalList();
  } else {
    _cfgEditTra = Math.min(MAX.tra, Math.max(MIN.tra, _cfgEditTra + delta));
    document.getElementById('cfg-edit-val-tra').textContent = _cfgEditTra;
  }
}

function buildCfgEditPalList() {
  const container = document.getElementById('cfg-edit-pal-list');
  container.innerHTML = '';
  for (let i = 0; i < _cfgEditPal; i++) {
    renderCfgEditPalRow(i, container);
  }
}

function renderCfgEditPalRow(i, container) {
  const s = _cfgEditPalState[i] || { id: null, name: '', category: null, isTemp: false };
  const row = document.createElement('div');
  row.className = 'pal-row';
  row.id = 'cfg-pal-row-' + i;
  row.innerHTML =
    `<div class="pal-row-top">` +
      `<div class="pal-num">${i + 1}</div>` +
      `<div class="pal-search-wrap">` +
        `<input class="pal-input${s.name && !s.isTemp ? ' matched' : ''}" ` +
               `id="cfg-pal-input-${i}" type="text" placeholder="Buscar palista\u2026" ` +
               `value="${(s.name || '').replace(/"/g, '&quot;')}" ` +
               `autocomplete="off" autocorrect="off" spellcheck="false" ` +
               `oninput="onCfgPalInput(${i})" onfocus="openCfgDropdown(${i})" onblur="delayCfgClose(${i})">` +
        `<button class="pal-clear${s.name ? ' show' : ''}" id="cfg-pal-clear-${i}" onclick="clearCfgPal(${i})">\u2715</button>` +
        `<div class="pal-dropdown" id="cfg-pal-dd-${i}"></div>` +
      `</div>` +
    `</div>` +
    `<div id="cfg-pal-cat-wrap-${i}" style="display:${s.name ? 'flex' : 'none'};flex-direction:column;gap:4px">` +
      `<div class="cat-label">Categor\u00eda</div>` +
      `<div class="cat-selector">` +
        `<button class="cat-btn K1${s.category === 'K1' ? ' active' : ''}" onclick="setCfgCat(${i},'K1')">K1</button>` +
        `<button class="cat-btn C1${s.category === 'C1' ? ' active' : ''}" onclick="setCfgCat(${i},'C1')">C1</button>` +
      `</div>` +
    `</div>`;
  container.appendChild(row);
}

function onCfgPalInput(i) {
  const val = document.getElementById('cfg-pal-input-' + i).value;
  _cfgEditPalState[i].name = val;
  _cfgEditPalState[i].id = null;
  _cfgEditPalState[i].isTemp = true;
  document.getElementById('cfg-pal-clear-' + i).classList.toggle('show', val.length > 0);
  const wrap = document.getElementById('cfg-pal-cat-wrap-' + i);
  if (wrap) wrap.style.display = val.length > 0 ? 'flex' : 'none';
  openCfgDropdown(i);
}

function openCfgDropdown(i) {
  const inp = document.getElementById('cfg-pal-input-' + i);
  const dd  = document.getElementById('cfg-pal-dd-' + i);
  if (!inp || !dd) return;
  const q = (inp.value || '').toLowerCase().trim();
  if (!q) { dd.classList.remove('open'); dd.innerHTML = ''; return; }
  const matches = _athletes.filter(a =>
    ((a.name || '') + ' ' + (a.surname || '')).toLowerCase().includes(q)
  ).slice(0, 8);
  if (!matches.length) { dd.classList.remove('open'); dd.innerHTML = ''; return; }
  dd.innerHTML = matches.map(a => {
    const fn   = a.name + (a.surname ? ' ' + a.surname : '');
    const cats = (a.categories || []).filter(c => c === 'K1' || c === 'C1')
      .map(c => `<span class="cat-badge ${c}">${c}</span>`).join('');
    const safeName = fn.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const catArr = (a.categories || []).filter(c => c === 'K1' || c === 'C1').map(c => `'${c}'`).join(',');
    return `<div class="pal-option" onmousedown="selectCfgAthlete(${i},'${a.id}','${safeName}',[${catArr}])">` +
             `<span class="pal-option-name">${fn}</span>` +
             `<span class="pal-option-cats">${cats}</span>` +
           `</div>`;
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
  _cfgEditPalState[i] = {
    id,
    name,
    isTemp: false,
    category: cats.length === 1 ? cats[0] : (_cfgEditPalState[i].category || null)
  };
  const inp = document.getElementById('cfg-pal-input-' + i);
  inp.value = name;
  inp.classList.add('matched');
  document.getElementById('cfg-pal-clear-' + i).classList.add('show');
  document.getElementById('cfg-pal-dd-' + i).classList.remove('open');
  const wrap = document.getElementById('cfg-pal-cat-wrap-' + i);
  if (wrap) wrap.style.display = 'flex';
  setCfgCatUI(i, cats.length === 1 ? cats[0] : _cfgEditPalState[i].category);
}

function clearCfgPal(i) {
  _cfgEditPalState[i] = { id: null, name: '', category: null, isTemp: false };
  const inp = document.getElementById('cfg-pal-input-' + i);
  inp.value = '';
  inp.classList.remove('matched');
  document.getElementById('cfg-pal-clear-' + i).classList.remove('show');
  document.getElementById('cfg-pal-dd-' + i).classList.remove('open');
  const wrap = document.getElementById('cfg-pal-cat-wrap-' + i);
  if (wrap) wrap.style.display = 'none';
}

function setCfgCat(i, cat) {
  _cfgEditPalState[i].category = cat;
  setCfgCatUI(i, cat);
}

function setCfgCatUI(i, cat) {
  const wrap = document.getElementById('cfg-pal-cat-wrap-' + i);
  if (!wrap) return;
  wrap.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.classList.contains(cat)));
}

function applyCfgEdit() {
  const newName  = document.getElementById('cfg-edit-name').value.trim();
  const newLugar = document.getElementById('cfg-edit-lugar').value.trim();
  if (!newName) { toast('El nombre no puede estar vacío', 'err'); return; }

  const newPalistas = _cfgEditPalState.map((s, i) => ({
    name:     (s.name || '').trim() || 'Palista ' + (i + 1),
    category: s.category || null,
    id:       s.id || null,
    isTemp:   s.isTemp || false
  }));

  const oldNPal = _cfg.nPal;
  const oldNTra = _cfg.nTra;
  const newNPal = _cfgEditPal;
  const newNTra = _cfgEditTra;

  // Preservar tiempos y mangas existentes, expandir/recortar según nueva dimensión
  const newTimes = Array.from({ length: newNPal }, (_, pi) =>
    Array.from({ length: newNTra }, (_, ti) =>
      (pi < oldNPal && ti < oldNTra) ? (_times[pi][ti] || []) : []
    )
  );
  const newMangas = Array.from({ length: newNPal }, (_, pi) =>
    Array.from({ length: newNTra }, (_, ti) =>
      (pi < oldNPal && ti < oldNTra) ? (_mangas[pi][ti] || 1) : 1
    )
  );

  // Aplicar cambios
  _cfg = { ..._cfg, name: newName, lugar: newLugar, nPal: newNPal, nTra: newNTra, palistas: newPalistas };
  _times  = newTimes;
  _mangas = newMangas;

  // Ajustar selección activa si queda fuera de rango
  if (_selPal  >= newNPal) _selPal  = newNPal  - 1;
  if (_selTramo >= newNTra) _selTramo = newNTra - 1;

  // Refrescar UI de sesión
  document.getElementById('topbar-title').textContent = _cfg.name;
  document.getElementById('ses-title').textContent    = _cfg.name;
  const parts = [];
  if (_cfg.lugar) parts.push(_cfg.lugar);
  if (_cfg.fecha) parts.push(new Date(_cfg.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }));
  document.getElementById('ses-meta').textContent = parts.join(' · ');

  buildSelPal(_cfg);
  buildSelTra(_cfg);
  document.getElementById('sel-pal').value = _selPal;
  document.getElementById('sel-tra').value = _selTramo;
  syncMangaVal();
  updateChronoCtx();
  buildTimesTable(_cfg);

  closeCfgSheet();
  toast('Sesión actualizada', 'ok');
}
