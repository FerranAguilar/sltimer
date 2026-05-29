// cfg-sheet-patch.js — bottom sheet for slalom-config settings
(function(){'use strict';
  const style=document.createElement('style');
  style.textContent=`
  #cfg-sheet-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9997;align-items:flex-end;justify-content:center}
  #cfg-sheet-overlay.open{display:flex}
  #cfg-sheet{background:white;border-radius:20px 20px 0 0;padding:24px 20px 32px;width:100%;max-width:480px;box-shadow:0 -4px 24px rgba(0,0,0,0.18);animation:cfgSlideUp 0.25s ease}
  @keyframes cfgSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  #cfg-sheet h2{font-size:17px;font-weight:700;color:#1a2e1a;margin-bottom:16px}
  .cfg-option{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0}
  .cfg-option:last-of-type{border-bottom:none}
  .cfg-option-label{font-size:15px;color:#1a2e1a;font-weight:500}
  .cfg-option-desc{font-size:13px;color:#888;margin-top:2px}
  .cfg-toggle{width:44px;height:26px;border-radius:13px;border:none;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0}
  .cfg-toggle.on{background:#0d5c3a}
  .cfg-toggle.off{background:#ccc}
  .cfg-toggle::after{content:'';position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:white;transition:left 0.2s}
  .cfg-toggle.on::after{left:21px}
  .cfg-toggle.off::after{left:3px}
  .cfg-close{width:100%;padding:13px;background:#f0f0f0;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#444;cursor:pointer;margin-top:12px;font-family:inherit}
  `;
  document.head.appendChild(style);

  function onReady(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}

  onReady(function(){
    const overlay=document.createElement('div');
    overlay.id='cfg-sheet-overlay';
    overlay.innerHTML=`<div id="cfg-sheet">
      <h2>⚙️ Opciones de sesión</h2>
      <div class="cfg-option">
        <div><div class="cfg-option-label">Auto-avance</div><div class="cfg-option-desc">Pasar al siguiente tramo automáticamente</div></div>
        <button class="cfg-toggle on" id="toggle-autoadvance"></button>
      </div>
      <div class="cfg-option">
        <div><div class="cfg-option-label">Vibrar al parar</div><div class="cfg-option-desc">Haptic al registrar tiempo</div></div>
        <button class="cfg-toggle on" id="toggle-haptic"></button>
      </div>
      <div class="cfg-option">
        <div><div class="cfg-option-label">Sonido</div><div class="cfg-option-desc">Pitido al iniciar y parar</div></div>
        <button class="cfg-toggle off" id="toggle-sound"></button>
      </div>
      <button class="cfg-close" onclick="document.getElementById('cfg-sheet-overlay').classList.remove('open')">Cerrar</button>
    </div>`;
    overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.classList.remove('open');});
    document.body.appendChild(overlay);

    ['toggle-autoadvance','toggle-haptic','toggle-sound'].forEach(id=>{
      const btn=document.getElementById(id);
      btn.addEventListener('click',function(){
        this.classList.toggle('on');
        this.classList.toggle('off');
      });
    });
  });
})();
