/* Fehlerbild: macht die App offline nutzbar. Es werden nur App-Dateien und Schriften gespeichert, keine Nutzerdaten. */
const CACHE='fehlerbild-v1';
const CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url),own=u.origin===location.origin,font=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!own&&!font)return;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE),hit=await c.match(r,{ignoreSearch:own});
    const net=()=>fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){if(own)e.waitUntil(net());return hit}   // sofort aus dem Speicher, im Hintergrund aktualisieren
    const res=await net();if(res)return res;
    if(r.mode==='navigate'){const idx=await c.match('index.html');if(idx)return idx}
    return Response.error();
  })());
});
