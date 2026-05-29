// active-session-bar.js
// Muestra una pestaña flotante en la parte inferior cuando hay una sesión de entrenamiento activa.
// Para activar desde slalom.html / kayakcross.html al iniciar sesión:
//   ActiveSessionBar.set({ type: 'slalom', name: 'Mi Sesión', url: 'slalom.html', startedAt: Date.now() });
// Para limpiar al guardar / finalizar la sesión:
//   ActiveSessionBar.clear();
// Para inicializar en páginas externas (menu, historial, etc.):
//   ActiveSessionBar.init();

(function(global) {
  'use strict';

  const STORAGE_KEY = 'slt_active_training_session';
  const BAR_ID = 'active-session-bar';

  function getState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function setState(data) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }

  function clearState() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }

  function formatElapsed(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return h + 'h ' + String(m % 60).padStart(2, '0') + 'min';
    return m + ':' + String(s % 60).padStart(2, '0');
  }

  function getTypeEmoji(type) {
    return type === 'kayakcross' ? '🛶' : '🚣';
  }

  function injectStyles() {
    if (document.getElementById('asb-styles')) return;
    const style = document.createElement('style');
    style.id = 'asb-styles';
    style.textContent = [
      '@keyframes asb-pulse{0%,100%{opacity:1}50%{opacity:.3}}',
      '#' + BAR_ID + ':active{opacity:.85}',
      'body.has-active-session{padding-bottom:74px!important}'
    ].join('');
    document.head.appendChild(style);
  }

  function mount(state) {
    if (document.getElementById(BAR_ID)) return;
    injectStyles();

    const bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.setAttribute('role', 'button');
    bar.setAttribute('aria-label', 'Volver a la sesión activa');
    bar.style.cssText =
      'position:fixed;bottom:0;left:50%;z-index:9999;' +
      'width:100%;max-width:480px;' +
      'display:flex;align-items:center;gap:10px;' +
      'padding:12px 16px 20px;' +
      'background:#1B3A5C;' +
      'border-radius:18px 18px 0 0;' +
      'box-shadow:0 -4px 24px rgba(0,0,0,0.22);' +
      'cursor:pointer;user-select:none;' +
      '-webkit-tap-highlight-color:transparent;' +
      'box-sizing:border-box;' +
      'transform:translateX(-50%) translateY(100%);' +
      'transition:transform 0.32s cubic-bezier(0.34,1.46,0.64,1);';

    const safeName = (state.name || 'Sesión activa')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    bar.innerHTML =
      '<div style="width:10px;height:10px;border-radius:50%;background:#22C55E;' +
        'flex-shrink:0;animation:asb-pulse 1.5s infinite;"></div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div id="' + BAR_ID + '-name" style="font-size:13px;font-weight:700;color:#fff;' +
          'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
          getTypeEmoji(state.type) + ' ' + safeName +
        '</div>' +
        '<div id="' + BAR_ID + '-time" style="font-size:11px;color:rgba(255,255,255,0.55);margin-top:2px;">' +
          'En curso · 0:00' +
        '</div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.14);border-radius:10px;padding:8px 14px;' +
        'font-size:13px;font-weight:700;color:#fff;white-space:nowrap;flex-shrink:0;">' +
        'Retomar ›' +
      '</div>';

    document.body.appendChild(bar);
    document.body.classList.add('has-active-session');

    // Animar entrada con resorte
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        bar.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    // Click → navegar a la sesión
    bar.addEventListener('click', function() {
      if (state.url) window.location.href = state.url;
    });

    // Ticker de tiempo transcurrido
    if (state.startedAt) {
      var tick = function() {
        var el = document.getElementById(BAR_ID + '-time');
        if (!el) return;
        el.textContent = 'En curso · ' + formatElapsed(Date.now() - state.startedAt);
      };
      tick();
      setInterval(tick, 1000);
    }
  }

  function unmount() {
    clearState();
    var bar = document.getElementById(BAR_ID);
    if (bar) {
      bar.style.transform = 'translateX(-50%) translateY(100%)';
      setTimeout(function() { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 350);
    }
    document.body.classList.remove('has-active-session');
  }

  global.ActiveSessionBar = {
    /**
     * Activar sesión activa y mostrar la barra.
     * @param {{ type: 'slalom'|'kayakcross', name: string, url: string, startedAt: number }} opts
     */
    set: function(opts) {
      var state = {
        type:      opts.type      || 'slalom',
        name:      opts.name      || 'Sesión activa',
        url:       opts.url       || 'slalom.html',
        startedAt: opts.startedAt || Date.now()
      };
      setState(state);
      var existing = document.getElementById(BAR_ID);
      if (existing) {
        if (existing.parentNode) existing.parentNode.removeChild(existing);
        document.body.classList.remove('has-active-session');
      }
      mount(state);
    },

    /** Limpiar sesión activa y ocultar la barra. Llamar al guardar/finalizar. */
    clear: unmount,

    /**
     * Inicializar en páginas externas.
     * Muestra la barra si hay una sesión activa en sessionStorage.
     */
    init: function() {
      var state = getState();
      if (state) mount(state);
    },

    /** Devuelve true si hay una sesión activa guardada. */
    isActive: function() { return !!getState(); }
  };

})(window);
