const CACHE='loki-one-v6';
const ASSETS=['./','./app/','./app/loki-apps.json','./app/loki-third-party.js','./loki-icon.svg','./loki-icon.webp','./manifest.webmanifest'];
const THIRD_PARTY_SCRIPT='<script src="./loki-third-party.js?v=1" defer></script>';

self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

async function injectThirdParty(response){
  if(!response || !response.ok) return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html')) return response;
  const url=new URL(response.url);
  if(!url.pathname.endsWith('/app/') && !url.pathname.endsWith('/app/index.html')) return response;
  const html=await response.text();
  if(html.includes('loki-third-party.js')) return new Response(html,{status:response.status,headers:response.headers});
  const patched=html.replace('</body>',`${THIRD_PARTY_SCRIPT}</body>`);
  return new Response(patched,{status:response.status,statusText:response.statusText,headers:response.headers});
}

self.addEventListener('fetch',e=>e.respondWith((async()=>{
  const cached=await caches.match(e.request);
  const response=cached||await fetch(e.request);
  return injectThirdParty(response);
})()));
