
// ── PATCH: Sheet editar configuración de sesión ──────────────────────────────
// Estas funciones estaban referenciadas en el HTML pero no implementadas.

// ── Estilos extra para el modal de grupos ────────────────────────────────────
(function injectGroupStyles() {
  const s = document.createElement('style');
  s.textContent = `
    #load-group-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      padding: 10px;
      border: 2px dashed #b0cdb0;
      border-radius: 10px;
      background: transparent;
      color: #0d5c3a;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: border-color .2s, background .2s;
    }
    #load-group-btn:hover { border-color: #0d5c3a; background: #f0f8f0; }

    #load-group-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,.45);
      z-index: 99999;
      align-items: flex-end;
      justify-content: center;
    }
    #load-group-overlay.open { display: flex; }

    #load-group-modal {
      background: #fff;
      border-radius: 20px 20px 0 0;
      padding: 24px 20px 36px;
      width: 100%;
      max-width: 480px;
      max-height: 72vh;
      overflow-y: auto;
      box-shadow: 0 -4px 24px rgba(0,0,0,.18);
      animation: lgSlideUp .25s ease;
    }
    @keyframes lgSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

    #load-group-modal h2 {
      font-size: 17px; font-weight: 700; color: #1a2e1a; margin-bottom: 4px;
    }
    #load-group-modal .lg-subtitle {
      font-size: 13px; color: #888; margin-bottom: 16px;
    }
    .lg-mode-row {
      display: flex; gap: 8px; margin-bottom: 14px;
    }
    .lg-mode-btn {
      flex: 1; padding: 8px 4px; border-radius: 9px; border: 1.5px solid #ddd;
      background: #fff; font-size: 13px; font-weight: 600; color: #555;
      cursor: pointer; font-family: inherit; transition: border-color .2s, background .2s;
    }
    .lg-mode-btn.active { border-color: #0d5c3a; background: #f0f8f0; color: #0d5c3a; }

    .lg-team-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; border: 1.5px solid #d0ddd0;
      border-radius: 12px; margin-bottom: 10px; cursor: pointer;
      transition: border-color .2s, background .2s;
    }
    .lg-team-item:hover { border-color: #0d5c3a; background: #f0f8f0; }
    .lg-team-icon {
      width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, #1a3a2a, #0d5c3a);
      display: flex; align-items: center; justify-content: center; font-size: 20px;
    }
    .lg-team-name { font-size: 15px; font-weight: 600; color: #1a2e1a; }
    .lg-team-count { font-size: 13px; color: #666; margin-top: 2px; }
    .lg-status { text-align: center; color: #999; padding: 20px 0; font-size: 14px; }
    .lg-close-btn {
      width: 100%; padding: 13px; background: #f0f0f0; border: none;
      border-radius: 12px; font-size: 15px; font-weight: 600; color: #444;
      cursor: pointer; margin-top: 4px; font-family: inherit; transition: background .2s;
    }
    .lg-close-btn:hover { background: #e0e0e0; }
  `;
  document.head.appendChild(s);
})();

// ── Estado interno del patch ─────────────────────────────────────────────────
let _cfgEditPal = 0;
let _cfgEditTra = 0;
let _cfgEditPalState = [];
let _athletes = [];

const MIN = { pal: 1, tra: 1 };
const MAX = { pal: 30, tra: 10 };

// ── cfg-sheet HTML (inyectado dinámicamente) ──────────────────────────────────
(function buildCfgSheetHTML() {
  // Estilos del cfg-sheet
  const s = document.createElement('style');
  s.textContent = `
    #cfg-sheet-backdrop {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,.35); z-index: 300;
    }
    #cfg-sheet-backdrop.open { display: block; }
    #cfg-sheet {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #fff; border-radius: 20px 20px 0 0;
      padding: 20px 20px 40px; max-height: 90vh; overflow-y: auto;
      z-index: 301; display: none; flex-direction: column; gap: 14px;
      transform: translateY(100%); transition: transform .3s ease;
    }
    #cfg-sheet.open { display: flex; transform: translateY(0); }
    .cfg-handle { width: 36px; height: 4px; border-radius: 2px; background: #ddd; margin: 0 auto -4px; }
    .cfg-section-title { font-size: 16px; font-weight: 800; color: #111; }
    .cfg-field-wrap { display: flex; flex-direction: column; gap: 4px; }
    .cfg-field-label { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: .06em; }
    .cfg-field-input {
      width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 10px;
      font-size: 14px; font-weight: 600; background: #fff; color: #111; font-family: inherit;
    }
    .cfg-field-input:focus { outline: none; border-color: #185FA5; }
    .cfg-counter-row { display: flex; align-items: center; gap: 10px; }
    .cfg-counter-label { font-size: 13px; font-weight: 700; color: #333; flex: 1; }
    .cfg-counter-val { font-size: 17px; font-weight: 800; color: #185FA5; min-width: 28px; text-align: center; }
    .cfg-counter-btn {
      width: 34px; height: 34px; border-radius: 8px; border: 1px solid #ddd;
      background: #fff; font-size: 20px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; color: #444; line-height: 1;
    }
    .cfg-counter-btn:active { background: #f0f0f0; }
    .cfg-divider { height: .5px; background: #eee; }
    .pal-row { display: flex; flex-direction: column; gap: 6px; padding: 10px 0; border-bottom: .5px solid #f0f0f0; }
    .pal-row:last-child { border-bottom: none; }
    .pal-row-top { display: flex; align-items: center; gap: 8px; }
    .pal-num { font-size: 13px; font-weight: 700; color: #999; min-width: 20px; }
    .pal-search-wrap { flex: 1; position: relative; }
    .pal-input {
      width: 100%; padding: 9px 30px 9px 10px; border: 1px solid #ddd; border-radius: 9px;
      font-size: 14px; font-family: inherit; color: #111; background: #fff;
    }
    .pal-input.matched { border-color: #0F6E56; background: #f0fbf7; }
    .pal-input:focus { outline: none; border-color: #185FA5; }
    .pal-clear {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: #999; font-size: 15px; cursor: pointer;
      display: none; padding: 2px;
    }
    .pal-clear.show { display: block; }
    .pal-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; background: #fff;
      border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,.12);
      z-index: 400; display: none; max-height: 200px; overflow-y: auto;
    }
    .pal-dropdown.open { display: block; }
    .pal-option {
      padding: 10px 12px; cursor: pointer; display: flex; align-items: center;
      justify-content: space-between; gap: 8px;
    }
    .pal-option:hover { background: #f5f5f5; }
    .pal-option-name { font-size: 14px; font-weight: 600; color: #111; }
    .pal-option-cats { display: flex; gap: 4px; }
    .cat-badge { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 100px; }
    .cat-badge.K1 { background: #E6F1FB; color: #0C447C; }
    .cat-badge.C1 { background: #E1F5EE; color: #085041; }
    .cat-label { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: .06em; }
    .cat-selector { display: flex; gap: 8px; }
    .cat-btn {
      flex: 1; padding: 6px; border-radius: 8px; border: 1.5px solid #ddd;
      background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
    }
    .cat-btn.K1.active { border-color: #0C447C; background: #E6F1FB; color: #0C447C; }
    .cat-btn.C1.active { border-color: #085041; background: #E1F5EE; color: #085041; }
    .cfg-save-btn {
      width: 100%; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 700;
      cursor: pointer; border: none; background: #185FA5; color: #fff; font-family: inherit;
    }
    .cfg-save-btn:active { opacity: .85; }
  `;
  document.head.appendChild(s);

  // HTML del sheet
  const backdrop = document.createElement('div');
  backdrop.id = 'cfg-sheet-backdrop';
  backdrop.addEventListener('click', closeCfgSheet);
  document.body.appendChild(backdrop);

  const sheet = document.createElement('div');
  sheet.id = 'cfg-sheet';
  sheet.innerHTML = `
    <div class="cfg-handle"></div>
    <div class="cfg-section-title">⚙️ Editar sesión</div>

    <div class="cfg-field-wrap">
      <div class="cfg-field-label">Nombre</div>
      <input class="cfg-field-input" id="cfg-edit-name" type="text" placeholder="Nombre de la sesión">
    </div>
    <div class="cfg-field-wrap">
      <div class="cfg-field-label">Lugar</div>
      <input class="cfg-field-input" id="cfg-edit-lugar" type="text" placeholder="Ubicación">
    </div>

    <div class="cfg-divider"></div>

    <div class="cfg-counter-row">
      <span class="cfg-counter-label">Palistas</span>
      <button class="cfg-counter-btn" onclick="adjCfgEdit('pal',-1)">−</button>
      <span class="cfg-counter-val" id="cfg-edit-val-pal">0</span>
      <button class="cfg-counter-btn" onclick="adjCfgEdit('pal',1)">+</button>
    </div>
    <div class="cfg-counter-row">
      <span class="cfg-counter-label">Tramos</span>
      <button class="cfg-counter-btn" onclick="adjCfgEdit('tra',-1)">−</button>
      <span class="cfg-counter-val" id="cfg-edit-val-tra">0</span>
      <button class="cfg-counter-btn" onclick="adjCfgEdit('tra',1)">+</button>
    </div>

    <div class="cfg-divider"></div>
    <div class="cfg-section-title" style="font-size:14px">Palistas</div>

    <button id="load-group-btn" onclick="openLoadGroupModal()">👥 Cargar grupo</button>

    <div id="cfg-edit-pal-list"></div>

    <button class="cfg-save-btn" onclick="applyCfgEdit()">💾 Guardar cambios</button>
  `;
  document.body.appendChild(sheet);

  // Modal de grupos
  const overlay = document.createElement('div');
  overlay.id = 'load-group-overlay';
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  overlay.innerHTML = `
    <div id="load-group-modal">
      <h2>👥 Cargar grupo</h2>
      <p class="lg-subtitle">Selecciona el modo y el grupo a cargar.</p>
      <div class="lg-mode-row">
        <button class="lg-mode-btn active" id="lg-mode-replace" onclick="setLgMode('replace')">🔄 Reemplazar lista</button>
        <button class="lg-mode-btn" id="lg-mode-append" onclick="setLgMode('append')">➕ Añadir a lista</button>
      </div>
      <div id="load-group-body"><div class="lg-status">Cargando grupos…</div></div>
      <button class="lg-close-btn" onclick="document.getElementById('load-group-overlay').classList.remove('open')">Cancelar</button>
    </div>
  `;
  document.body.appendChild(overlay);
})();

// ── Modo reemplazar / añadir ──────────────────────────────────────────────────
let _lgMode = 'replace'; // 'replace' | 'append'
function setLgMode(mode) {
  _lgMode = mode;
  document.getElementById('lg-mode-replace').classList.toggle('active', mode === 'replace');
  document.getElementById('lg-mode-append').classList.toggle('active', mode === 'append');
}

// ── Credenciales Supabase (mismas que slalom-session.html) ───────────────────
const _CFG_SUPA_URL = 'https://xorblwcvlkbhpzcegkoh.supabase.co';
const _CFG_SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvcmhsd2N2bGtiaHB6Y2Vna29oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NzU4NzgsImV4cCI6MjA2MTI1MTg3OH0.wbLkIqPr6X_aQv_7hjCCgcnFN4GEaxvvJT2F8mBwgPA';

async function _cfgApi(path) {
  const tok = typeof _tok !== 'undefined' ? _tok : null;
  const h = {
    apikey: _CFG_SUPA_KEY,
    Authorization: 'Bearer ' + (tok || _CFG_SUPA_KEY)
  };
  const r = await fetch(_CFG_SUPA_URL + path, { headers: h });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ── Abrir modal de grupos ─────────────────────────────────────────────────────
async function openLoadGroupModal() {
  const overlay = document.getElementById('load-group-overlay');
  const body = document.getElementById('load-group-body');
  overlay.classList.add('open');
  body.innerHTML = '<div class="lg-status">Cargando grupos…</div>';
  setLgMode('replace');

  const uid = typeof _uid !== 'undefined' ? _uid : null;
  if (!uid) {
    body.innerHTML = '<div class="lg-status">No se pudo identificar al usuario.</div>';
    return;
  }

  try {
    // Obtener equipos del entrenador (owner) y también donde es miembro
    const [ownedTeams, memberTeams] = await Promise.all([
      _cfgApi(`/rest/v1/teams?coach_id=eq.${uid}&select=id,name`),
      _cfgApi(`/rest/v1/team_members?user_id=eq.${uid}&select=team_id,teams(id,name)`)
    ]);

    // Unir y deduplicar
    const teamMap = {};
    ownedTeams.forEach(t => { teamMap[t.id] = t; });
    memberTeams.forEach(m => {
      if (m.teams) teamMap[m.teams.id] = m.teams;
    });
    const teams = Object.values(teamMap);

    if (!teams.length) {
      body.innerHTML = '<div class="lg-status">No tienes ningún grupo guardado.</div>';
      return;
    }

    // Contar atletas por equipo
    const withCounts = await Promise.all(teams.map(async t => {
      try {
        const rows = await _cfgApi(`/rest/v1/team_athletes?team_id=eq.${t.id}&select=athlete_id`);
        return { ...t, count: rows.length };
      } catch { return { ...t, count: 0 }; }
    }));

    body.innerHTML = withCounts.map(t => `
      <div class="lg-team-item" onclick="_lgSelectTeam('${t.id}','${(t.name||'').replace(/'/g,"\\'")}')">
        <div class="lg-team-icon">⛵</div>
        <div>
          <div class="lg-team-name">${t.name}</div>
          <div class="lg-team-count">${t.count} palista${t.count !== 1 ? 's' : ''}</div>
        </div>
      </div>
    `).join('');

  } catch (e) {
    body.innerHTML = `<div class="lg-status">Error: ${e.message}</div>`;
  }
}

// ── Seleccionar equipo → cargar palistas ──────────────────────────────────────
window._lgSelectTeam = async function (teamId, teamName) {
  document.getElementById('load-group-overlay').classList.remove('open');

  try {
    const rows = await _cfgApi(
      `/rest/v1/team_athletes?team_id=eq.${teamId}&select=athlete_id,athletes(name,surname,categories)`
    );

    const incoming = rows
      .filter(r => r.athletes)
      .map(r => {
        const a = r.athletes;
        const name = [a.name, a.surname].filter(Boolean).join(' ');
        const cats = a.categories || [];
        const category = cats.includes('K1') ? 'K1' : cats.includes('C1') ? 'C1' : 'K1';
        return { id: null, name, category, isTemp: false };
      });

    if (!incoming.length) {
      if (typeof toast === 'function') toast('El grupo no tiene palistas', 'err');
      return;
    }

    if (_lgMode === 'replace') {
      // Reemplazar toda la lista de palistas
      _cfgEditPalState = incoming;
      _cfgEditPal = incoming.length;
      document.getElementById('cfg-edit-val-pal').textContent = _cfgEditPal;
    } else {
      // Añadir a la lista existente (evitar duplicados por nombre)
      const existingNames = new Set(_cfgEditPalState.map(p => p.name.toLowerCase()));
      const toAdd = incoming.filter(p => !existingNames.has(p.name.toLowerCase()));
      _cfgEditPalState = [..._cfgEditPalState, ...toAdd];
      _cfgEditPal = _cfgEditPalState.length;
      document.getElementById('cfg-edit-val-pal').textContent = _cfgEditPal;
    }

    buildCfgEditPalList();

    const msg = _lgMode === 'replace'
      ? `Grupo "${teamName}" cargado (${incoming.length} palistas)`
      : `${incoming.length} palistas añadidos de "${teamName}"`;
    if (typeof toast === 'function') toast(msg, 'ok');

  } catch (e) {
    if (typeof toast === 'function') toast('Error cargando grupo', 'err');
    console.error(e);
  }
};

// ── openCfgSheet ──────────────────────────────────────────────────────────────
function openCfgSheet() {
  if (!_cfg) return;
  _cfgEditPal = _cfg.nPal;
  _cfgEditTra = _cfg.nTra;
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

  // Cargar atletas para el autocomplete si no están cargados aún
  if (!_athletes.length && typeof _uid !== 'undefined' && _uid) {
    _cfgApi(`/rest/v1/athletes?coach_id=eq.${_uid}&select=id,name,surname,categories`)
      .then(rows => { _athletes = rows || []; })
      .catch(() => {});
  }

  buildCfgEditPalList();
  document.getElementById('cfg-sheet-backdrop').classList.add('open');
  document.getElementById('cfg-sheet').classList.add('open');
}

function closeCfgSheet() {
  document.getElementById('cfg-sheet-backdrop').classList.remove('open');
  document.getElementById('cfg-sheet').classList.remove('open');
}

// ── Contadores ────────────────────────────────────────────────────────────────
function adjCfgEdit(key, delta) {
  if (key === 'pal') {
    _cfgEditPal = Math.min(MAX.pal, Math.max(MIN.pal, _cfgEditPal + delta));
    document.getElementById('cfg-edit-val-pal').textContent = _cfgEditPal;
    while (_cfgEditPalState.length < _cfgEditPal)
      _cfgEditPalState.push({ id: null, name: '', category: null, isTemp: false });
    _cfgEditPalState = _cfgEditPalState.slice(0, _cfgEditPal);
    buildCfgEditPalList();
  } else {
    _cfgEditTra = Math.min(MAX.tra, Math.max(MIN.tra, _cfgEditTra + delta));
    document.getElementById('cfg-edit-val-tra').textContent = _cfgEditTra;
  }
}

// ── Lista de palistas ─────────────────────────────────────────────────────────
function buildCfgEditPalList() {
  const container = document.getElementById('cfg-edit-pal-list');
  container.innerHTML = '';
  for (let i = 0; i < _cfgEditPal; i++) renderCfgEditPalRow(i, container);
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

// ── Aplicar cambios ───────────────────────────────────────────────────────────
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

  _cfg = { ..._cfg, name: newName, lugar: newLugar, nPal: newNPal, nTra: newNTra, palistas: newPalistas };
  _times  = newTimes;
  _mangas = newMangas;

  if (_selPal  >= newNPal) _selPal  = newNPal  - 1;
  if (_selTramo >= newNTra) _selTramo = newNTra - 1;

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
