// ── PATCH: Añadir palistas de un grupo ───────────────────────────────────────
// Inyecta el botón «Añadir grupo» en la pantalla de configuración
// y en el sheet de edición de sesión en curso.

/* ── Variables de grupo ──────────────────────────────────────── */
let _teams = [];          // [{id, name, athletes:[{id,name,surname,categories}]}]
let _groupSheetTarget = null; // 'config' | 'cfgedit'

/* ── Cargar grupos desde Supabase ────────────────────────────── */
async function loadTeams() {
  try {
    // 1. Grupos en los que el usuario es miembro
    const members = await api(
      '/rest/v1/team_members?select=team_id,teams(id,name)&user_id=eq.' + _uid
    );
    if (!members || !members.length) { _teams = []; return; }

    // 2. Para cada grupo, cargar sus palistas
    const results = [];
    for (const m of members) {
      const team = m.teams;
      if (!team) continue;
      const rows = await api(
        '/rest/v1/team_athletes?select=athletes(id,name,surname,categories)&team_id=eq.' + team.id
      );
      const athletes = (rows || [])
        .map(r => r.athletes)
        .filter(Boolean);
      results.push({ id: team.id, name: team.name, athletes });
    }
    _teams = results;
  } catch (e) {
    console.warn('loadTeams error:', e);
    _teams = [];
  }
}

/* ── Inyectar botón en pantalla de configuración ─────────────── */
function injectGroupButton() {
  // Botón principal (pantalla config)
  const palListLabel = document.querySelector('#screen-config .section-label:last-of-type');
  // Buscamos el label «Palistas» que precede al #pal-list
  const allLabels = document.querySelectorAll('#screen-config .section-label');
  let targetLabel = null;
  allLabels.forEach(l => {
    if (l.textContent.trim().toLowerCase().includes('palista')) targetLabel = l;
  });
  if (targetLabel && !document.getElementById('btn-add-group-config')) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:0';
    const clone = targetLabel.cloneNode(true);
    wrap.appendChild(clone);
    const btn = document.createElement('button');
    btn.id = 'btn-add-group-config';
    btn.className = 'btn-add-group';
    btn.innerHTML = '&#128101; A&#241;adir grupo';
    btn.onclick = () => openGroupSheet('config');
    wrap.appendChild(btn);
    targetLabel.replaceWith(wrap);
  }
}

/* ── Inyectar botón en el sheet de edición de sesión ─────────── */
function injectGroupButtonInCfgSheet() {
  if (document.getElementById('btn-add-group-cfgedit')) return;
  // Buscamos el section «Palistas» dentro del cfg-sheet
  const cfgSheet = document.getElementById('cfg-sheet');
  if (!cfgSheet) return;
  const sections = cfgSheet.querySelectorAll('.sheet-section');
  let palistasSection = null;
  sections.forEach(s => {
    if (s.textContent.trim().toLowerCase().includes('palista')) palistasSection = s;
  });
  if (!palistasSection) return;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:14px;margin-bottom:0';
  const lbl = palistasSection.cloneNode(true);
  lbl.style.margin = '0';
  wrap.appendChild(lbl);
  const btn = document.createElement('button');
  btn.id = 'btn-add-group-cfgedit';
  btn.className = 'btn-add-group';
  btn.innerHTML = '&#128101; A&#241;adir grupo';
  btn.onclick = () => openGroupSheet('cfgedit');
  wrap.appendChild(btn);
  palistasSection.replaceWith(wrap);
}

/* ── Sheet selector de grupo ─────────────────────────────────── */
function buildGroupSheetDOM() {
  if (document.getElementById('group-sheet')) return;
  const backdrop = document.createElement('div');
  backdrop.id = 'group-sheet-backdrop';
  backdrop.className = 'sheet-backdrop';
  backdrop.onclick = closeGroupSheet;
  document.body.appendChild(backdrop);

  const sheet = document.createElement('div');
  sheet.id = 'group-sheet';
  sheet.className = 'sheet';
  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-title">&#128101; A&#241;adir palistas del grupo</div>
    <div class="sheet-subtitle">Selecciona un grupo para a&#241;adir todos sus palistas de golpe.</div>
    <div id="group-list" style="display:flex;flex-direction:column;gap:8px;max-height:55vh;overflow-y:auto"></div>
    <div style="margin-top:16px">
      <button class="btn-primary" style="background:#185FA5" onclick="closeGroupSheet()">Cancelar</button>
    </div>
  `;
  document.body.appendChild(sheet);
}

function openGroupSheet(target) {
  _groupSheetTarget = target;
  buildGroupSheetDOM();
  const list = document.getElementById('group-list');
  list.innerHTML = '';

  if (!_teams || !_teams.length) {
    list.innerHTML = `<div style="text-align:center;padding:24px 0;color:#aaa;font-size:14px">
      No perteneces a ning&#250;n grupo a&#250;n.<br>
      <span style="font-size:12px">Crea o &#250;nete a un grupo desde el men&#250;.</span>
    </div>`;
  } else {
    _teams.forEach(team => {
      const card = document.createElement('div');
      card.style.cssText = 'background:#f7f9fc;border:0.5px solid #e8eef5;border-radius:12px;padding:12px 14px;cursor:pointer;transition:background .15s';
      card.onmousedown = () => addGroupAthletes(team);
      card.ontouchstart = () => {}; // enable :active on iOS
      const count = team.athletes.length;
      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:14px;font-weight:700;color:#1B3A5C">${team.name}</div>
            <div style="font-size:12px;color:#aaa;margin-top:2px">${count} palista${count !== 1 ? 's' : ''}</div>
          </div>
          <div style="font-size:22px">&#43;</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">
          ${team.athletes.slice(0, 8).map(a => {
            const fn = a.name + (a.surname ? ' ' + a.surname : '');
            const cats = (a.categories || []).filter(c => c === 'K1' || c === 'C1');
            return `<span style="font-size:11px;font-weight:600;background:#E6F1FB;color:#0C447C;padding:2px 7px;border-radius:100px">${fn}${cats.length ? ' · ' + cats[0] : ''}</span>`;
          }).join('')}
          ${count > 8 ? `<span style="font-size:11px;color:#aaa">+${count - 8} m&#225;s</span>` : ''}
        </div>
      `;
      list.appendChild(card);
    });
  }

  document.getElementById('group-sheet-backdrop').classList.add('open');
  document.getElementById('group-sheet').classList.add('open');
}

function closeGroupSheet() {
  const bd = document.getElementById('group-sheet-backdrop');
  const sh = document.getElementById('group-sheet');
  if (bd) bd.classList.remove('open');
  if (sh) sh.classList.remove('open');
}

/* ── Añadir atletas del grupo al estado actual ───────────────── */
function addGroupAthletes(team) {
  closeGroupSheet();
  let added = 0;
  let skipped = 0;

  team.athletes.forEach(a => {
    const fn = a.name + (a.surname ? ' ' + a.surname : '');
    const cats = (a.categories || []).filter(c => c === 'K1' || c === 'C1');
    const cat = cats.length === 1 ? cats[0] : null;
    const newEntry = { id: a.id, name: fn, category: cat, isTemp: false };

    if (_groupSheetTarget === 'config') {
      // Evitar duplicados
      const exists = _palState.some(p => p.id && p.id === a.id);
      if (exists) { skipped++; return; }
      if (_palState.length >= MAX.pal) { skipped++; return; }
      _palState.push(newEntry);
      CFG.pal = _palState.length;
      added++;
    } else if (_groupSheetTarget === 'cfgedit') {
      const exists = _cfgEditPalState.some(p => p.id && p.id === a.id);
      if (exists) { skipped++; return; }
      if (_cfgEditPalState.length >= MAX.pal) { skipped++; return; }
      _cfgEditPalState.push(newEntry);
      _cfgEditPal = _cfgEditPalState.length;
      added++;
    }
  });

  // Refrescar lista
  if (_groupSheetTarget === 'config') {
    buildPalList();
  } else {
    document.getElementById('cfg-edit-val-pal').textContent = _cfgEditPal;
    buildCfgEditPalList();
  }

  if (added > 0 && skipped > 0) {
    toast(added + ' palista' + (added !== 1 ? 's' : '') + ' a&#241;adido' + (added !== 1 ? 's' : '') + ' (' + skipped + ' ya estaban)', 'ok');
  } else if (added > 0) {
    toast(added + ' palista' + (added !== 1 ? 's' : '') + ' a&#241;adido' + (added !== 1 ? 's' : '') + ' ✓', 'ok');
  } else {
    toast('Todos los palistas ya estaban en la lista');
  }
}

/* ── Estilo del botón ────────────────────────────────────────── */
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .btn-add-group {
      background: #E6F1FB;
      border: 0.5px solid #B5D4F4;
      border-radius: 8px;
      color: #0C447C;
      font-size: 12px;
      font-weight: 700;
      padding: 5px 10px;
      cursor: pointer;
      white-space: nowrap;
      font-family: inherit;
      transition: background .15s;
    }
    .btn-add-group:active { background: #cde3f6; }
  `;
  document.head.appendChild(style);
})();

/* ── Inicialización: esperar a que el DOM esté listo ─────────── */
document.addEventListener('DOMContentLoaded', async function () {
  // loadTeams se llama después de que init() cargue _uid y _tok.
  // Esperamos a que init() haya terminado antes de inyectar los botones.
  const waitForInit = () => new Promise(resolve => {
    const check = () => { if (_uid) resolve(); else setTimeout(check, 100); };
    check();
  });
  await waitForInit();
  await loadTeams();
  injectGroupButton();
});

// openCfgSheet del patch original llama a buildCfgEditPalList.
// Necesitamos inyectar el botón cada vez que se abre el sheet.
const _origOpenCfgSheet = typeof openCfgSheet === 'function' ? openCfgSheet : null;
function openCfgSheet() {
  if (_origOpenCfgSheet) _origOpenCfgSheet();
  // Dar un tick para que el DOM del sheet se actualice
  setTimeout(injectGroupButtonInCfgSheet, 50);
}
