const CACHE='sltimer-v1';const ASSETS=['./','./ index.html','./menu.html','./slalom-config.html','./slalom-session.html','./historial.html','./athletes.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})));});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
