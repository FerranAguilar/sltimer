// Active session bar – shows the current running session at the bottom of every page
// Loaded via <script src="active-session-bar.js"></script> on menu.html and other pages

(function () {
  'use strict';

  const SUPA_URL = 'https://bazprdygkbhvdlzsmhxh.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenByZHlna2JodmRsenNtaHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDMwNzgsImV4cCI6MjA2MjM3OTA3OH0.8ARKHgGvWFfFSAhf_bG3qRYh1YDy9kkUXGNXvxXt3_Q';

  function tok() {
    return localStorage.getItem('sb_access_token');
  }

  function uid() {
    try { return JSON.parse(localStorage.getItem('sb_user') || '{}').id || null; }
    catch { return null; }
  }

  async function fetchActiveSession(userId, token) {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/slalom_sessions?user_id=eq.${userId}&status=eq.active&order=created_at.desc&limit=1`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;
  }

  function buildBar(session) {
    const bar = document.createElement('div');
    bar.id = 'active-session-bar';
    bar.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:9999',
      'background:linear-gradient(135deg,#1a3a2a 0%,#0d5c3a 100%)',
      'color:#fff', 'display:flex', 'align-items:center', 'justify-content:space-between',
      'padding:10px 16px', 'box-shadow:0 -2px 12px rgba(0,0,0,.35)',
      'font-family:system-ui,sans-serif', 'font-size:14px', 'cursor:pointer',
      'border-top:2px solid #2ecc71'
    ].join(';');

    const info = document.createElement('div');
    info.style.cssText = 'display:flex;align-items:center;gap:10px;';

    const dot = document.createElement('span');
    dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#2ecc71;display:inline-block;box-shadow:0 0 6px #2ecc71;animation:pulse-dot 1.5s ease-in-out infinite;';

    const text = document.createElement('span');
    const cfg = session.config || {};
    const lugar = cfg.lugar || session.location || 'Sesión activa';
    const palistas = Array.isArray(cfg.palistas) ? cfg.palistas.length : '?';
    text.textContent = `🏄 ${lugar} · ${palistas} palista${palistas !== 1 ? 's' : ''}`;

    const btn = document.createElement('button');
    btn.textContent = 'Continuar →';
    btn.style.cssText = [
      'background:#2ecc71', 'color:#0d5c3a', 'border:none', 'border-radius:6px',
      'padding:6px 14px', 'font-weight:700', 'font-size:13px', 'cursor:pointer',
      'white-space:nowrap'
    ].join(';');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `slalom-session.html?id=${session.id}`;
    });

    info.appendChild(dot);
    info.appendChild(text);
    bar.appendChild(info);
    bar.appendChild(btn);

    bar.addEventListener('click', () => {
      window.location.href = `slalom-session.html?id=${session.id}`;
    });

    // Pulse animation
    if (!document.getElementById('asb-style')) {
      const st = document.createElement('style');
      st.id = 'asb-style';
      st.textContent = '@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.3)}}';
      document.head.appendChild(st);
    }

    return bar;
  }

  async function init() {
    const t = tok();
    const u = uid();
    if (!t || !u) return;

    // Don't show on slalom-session page itself
    if (window.location.pathname.includes('slalom-session')) return;

    const session = await fetchActiveSession(u, t);
    if (!session) return;

    // Add bottom padding to body so content isn't hidden behind bar
    document.body.style.paddingBottom = '60px';

    const bar = buildBar(session);
    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
