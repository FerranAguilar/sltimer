// add-group-patch.js — adds the "Añadir grupo" flow to slalom-config
// Injects a modal that loads the user's teams and lets the coach
// add all athletes from a team at once.

(function () {
  'use strict';

  const SUPA_URL = 'https://bazprdygkbhvdlzsmhxh.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenByZHlna2JodmRsenNtaHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDMwNzgsImV4cCI6MjA2MjM3OTA3OH0.8ARKHgGvWFfFSAhf_bG3qRYh1YDy9kkUXGNXvxXt3_Q';

  function tok() { return localStorage.getItem('sb_access_token'); }
  function uid() {
    try { return JSON.parse(localStorage.getItem('sb_user') || '{}').id || null; }
    catch { return null; }
  }

  // ── Inject styles ──────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #add-group-btn {
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
      margin-top: 8px;
      transition: border-color 0.2s, background 0.2s;
      font-family: inherit;
    }
    #add-group-btn:hover { border-color: #0d5c3a; background: #f0f8f0; }

    #group-modal-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 9998;
      align-items: flex-end;
      justify-content: center;
    }
    #group-modal-overlay.open { display: flex; }

    #group-modal {
      background: white;
      border-radius: 20px 20px 0 0;
      padding: 24px 20px 32px;
      width: 100%;
      max-width: 480px;
      max-height: 70vh;
      overflow-y: auto;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.18);
      animation: slideUp 0.25s ease;
    }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

    #group-modal h2 {
      font-size: 17px;
      font-weight: 700;
      color: #1a2e1a;
      margin-bottom: 16px;
    }
    .group-team-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border: 1.5px solid #d0ddd0;
      border-radius: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .group-team-item:hover { border-color: #0d5c3a; background: #f0f8f0; }
    .group-team-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #1a3a2a, #0d5c3a);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .group-team-name { font-size: 15px; font-weight: 600; color: #1a2e1a; }
    .group-team-count { font-size: 13px; color: #666; margin-top: 2px; }
    .group-modal-close {
      width: 100%;
      padding: 13px;
      background: #f0f0f0;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #444;
      cursor: pointer;
      margin-top: 4px;
      font-family: inherit;
      transition: background 0.2s;
    }
    .group-modal-close:hover { background: #e0e0e0; }
    #group-modal-loading { text-align: center; color: #666; padding: 20px 0; font-size: 14px; }
    #group-modal-empty { text-align: center; color: #999; padding: 20px 0; font-size: 14px; }
  `;
  document.head.appendChild(style);

  // ── Wait for DOM ready ─────────────────────────────────────────────────────
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    // Find the palistas section card
    const addPalistaBtn = document.getElementById('add-palista-btn');
    if (!addPalistaBtn) return;

    // Inject "Añadir grupo" button after the add-palista button
    const groupBtn = document.createElement('button');
    groupBtn.id = 'add-group-btn';
    groupBtn.textContent = '👥 Añadir grupo';
    groupBtn.addEventListener('click', openGroupModal);
    addPalistaBtn.parentNode.insertBefore(groupBtn, addPalistaBtn.nextSibling);

    // Inject modal
    const overlay = document.createElement('div');
    overlay.id = 'group-modal-overlay';
    overlay.innerHTML = `
      <div id="group-modal">
        <h2>👥 Añadir grupo</h2>
        <div id="group-modal-body"><div id="group-modal-loading">Cargando equipos…</div></div>
        <button class="group-modal-close" onclick="document.getElementById('group-modal-overlay').classList.remove('open')">Cancelar</button>
      </div>
    `;
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });
    document.body.appendChild(overlay);
  });

  async function openGroupModal() {
    const overlay = document.getElementById('group-modal-overlay');
    const body = document.getElementById('group-modal-body');
    overlay.classList.add('open');
    body.innerHTML = '<div id="group-modal-loading">Cargando equipos…</div>';

    const t = tok();
    const u = uid();
    if (!t || !u) {
      body.innerHTML = '<div id="group-modal-empty">No se pudo autenticar.</div>';
      return;
    }

    try {
      // Load teams where user is a member
      const tmRes = await fetch(
        `${SUPA_URL}/rest/v1/team_members?user_id=eq.${u}&select=team_id`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${t}` } }
      );
      const memberships = await tmRes.json();
      if (!memberships.length) {
        body.innerHTML = '<div id="group-modal-empty">No perteneces a ningún equipo.</div>';
        return;
      }

      const teamIds = memberships.map(m => m.team_id);
      const teamRes = await fetch(
        `${SUPA_URL}/rest/v1/teams?id=in.(${teamIds.join(',')})&select=id,name`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${t}` } }
      );
      const teams = await teamRes.json();

      if (!teams.length) {
        body.innerHTML = '<div id="group-modal-empty">No se encontraron equipos.</div>';
        return;
      }

      // For each team, count athletes
      const athleteCounts = await Promise.all(teams.map(async team => {
        const r = await fetch(
          `${SUPA_URL}/rest/v1/team_athletes?team_id=eq.${team.id}&select=athlete_id`,
          { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${t}` } }
        );
        const data = await r.json();
        return { ...team, count: data.length };
      }));

      body.innerHTML = athleteCounts.map(team => `
        <div class="group-team-item" onclick="window._addGroupTeam('${team.id}')">
          <div class="group-team-icon">⛵</div>
          <div>
            <div class="group-team-name">${team.name}</div>
            <div class="group-team-count">${team.count} palista${team.count !== 1 ? 's' : ''}</div>
          </div>
        </div>
      `).join('');

    } catch (e) {
      body.innerHTML = `<div id="group-modal-empty">Error: ${e.message}</div>`;
    }
  }

  window._addGroupTeam = async function (teamId) {
    const t = tok();
    if (!t) return;

    // Close modal
    document.getElementById('group-modal-overlay').classList.remove('open');

    try {
      const r = await fetch(
        `${SUPA_URL}/rest/v1/team_athletes?team_id=eq.${teamId}&select=athlete_id,athletes(name,surname,categories)`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${t}` } }
      );
      const rows = await r.json();

      rows.forEach(row => {
        const a = row.athletes;
        if (!a) return;
        const nombre = [a.name, a.surname].filter(Boolean).join(' ');
        const cats = a.categories || [];
        const cat = cats.includes('K1') ? 'K1' : cats.includes('C1') ? 'C1' : cats.includes('C2') ? 'C2' : 'K1';
        if (typeof window.addPalista === 'function') {
          window.addPalista(nombre, cat);
        }
      });
    } catch (e) {
      alert('Error cargando atletas: ' + e.message);
    }
  };

})();
