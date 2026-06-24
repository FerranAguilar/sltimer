// active-session-bar.js
// Barra inferior que indica que hay una sesión compartida activa y permite volver a ella.
// Se carga con <script src="active-session-bar.js"></script> en menu.html (y donde se quiera).
//
// Fuente de verdad:
//   - sessionStorage 'slt_shared'  → { sharedSessionId, sessionId, code, isOwner, cfg }
//   - tabla sessions.is_live       → la sesión sigue abierta mientras sea true
// La sesión solo deja de estar activa cuando el anfitrión pulsa Finalizar (is_live=false).

(function () {
  'use strict';

  const SB  = 'https://duwmhatcqxlwtqdnzhle.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1d21oYXRjcXhsd3RxZG56aGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzIwMDMsImV4cCI6MjA5MzMwODAwM30.CkvnBvuo8rS2cv1Uts6dmUATUMbW9Dgjg4L29HE9Wdo';

  function tok(){ return localStorage.getItem('slt_tok'); }

  function sharedState(){
    try{ return JSON.parse(sessionStorage.getItem('slt_shared') || 'null'); }
    catch{ return null; }
  }

  // Destino correcto del cronómetro según el tipo de sesión.
  function sessionPage(st){
    const type = st && st.cfg && st.cfg.type;
    return type === 'kxc' ? 'sessionkxc.html' : 'slalom-session.html';
  }

  // Confirma contra el servidor que la sesión sigue viva (is_live = true).
  async function isStillLive(sessionId, t){
    try{
      const res = await fetch(
        `${SB}/rest/v1/sessions?id=eq.${sessionId}&select=is_live&limit=1`,
        { headers: { apikey: KEY, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' } }
      );
      if(!res.ok) return false;
      const data = await res.json();
      return !!(data[0] && data[0].is_live);
    }catch{ return false; }
  }

  // Reabrir la sesión: el cronómetro la reconstruye desde slt_shared / *_cfg.
  function resumeSession(st){
    const page = sessionPage(st);
    const cfg = Object.assign({}, st.cfg || {}, { _sessionId: st.sessionId });
    if(page === 'sessionkxc.html'){
      sessionStorage.setItem('kxc_cfg', JSON.stringify(cfg));
      sessionStorage.removeItem('kxc_resume');
    }else{
      sessionStorage.setItem('slalom_cfg', JSON.stringify(cfg));
      sessionStorage.removeItem('slalom_resume');
    }
    window.location.href = page;
  }

  function buildBar(st){
    const bar = document.createElement('div');
    bar.id = 'active-session-bar';
    bar.style.cssText = [
      'position:fixed','bottom:0','left:0','right:0','z-index:9999',
      'background:linear-gradient(135deg,#1B3A5C 0%,#185FA5 100%)',
      'color:#fff','display:flex','align-items:center','justify-content:space-between',
      'padding:10px 16px','box-shadow:0 -2px 12px rgba(0,0,0,.30)',
      'font-family:system-ui,-apple-system,sans-serif','font-size:14px','cursor:pointer',
      'border-top:2px solid #2ecc71','max-width:480px','margin:0 auto'
    ].join(';');

    const info = document.createElement('div');
    info.style.cssText = 'display:flex;align-items:center;gap:10px;min-width:0;';

    const dot = document.createElement('span');
    dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#2ecc71;flex-shrink:0;box-shadow:0 0 6px #2ecc71;animation:asb-pulse 1.5s ease-in-out infinite;';

    const text = document.createElement('span');
    text.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    const cfg = st.cfg || {};
    const nombre = cfg.name || 'Sesión activa';
    const rol = st.isOwner ? 'anfitrión' : 'invitado';
    text.textContent = `🔴 ${nombre} · ${rol}`;

    const btn = document.createElement('button');
    btn.textContent = 'Volver →';
    btn.style.cssText = [
      'background:#2ecc71','color:#0d5c3a','border:none','border-radius:8px',
      'padding:7px 16px','font-weight:700','font-size:13px','cursor:pointer',
      'white-space:nowrap','flex-shrink:0','font-family:inherit'
    ].join(';');

    const go = (e) => { if(e) e.stopPropagation(); resumeSession(st); };
    btn.addEventListener('click', go);
    bar.addEventListener('click', go);

    info.appendChild(dot);
    info.appendChild(text);
    bar.appendChild(info);
    bar.appendChild(btn);

    if(!document.getElementById('asb-style')){
      const s = document.createElement('style');
      s.id = 'asb-style';
      s.textContent = '@keyframes asb-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(1.3)}}';
      document.head.appendChild(s);
    }
    return bar;
  }

  async function init(){
    const t = tok();
    if(!t) return;

    // No mostrar la barra dentro de las propias pantallas de sesión.
    const path = window.location.pathname;
    if(path.includes('slalom-session') || path.includes('sessionkxc')) return;

    const st = sharedState();
    if(!st || !st.sessionId) return;

    // Verificar que la sesión sigue viva; si el anfitrión ya la cerró, limpiar y salir.
    const live = await isStillLive(st.sessionId, t);
    if(!live){
      sessionStorage.removeItem('slt_shared');
      return;
    }

    document.body.style.paddingBottom = '60px';
    document.body.appendChild(buildBar(st));
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
