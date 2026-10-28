/* Loki One — official third-party app bridge.
 * Uses the existing catalog format and opens only official service websites.
 */
(function () {
  'use strict';
  const registryUrl = new URL('./loki-apps.json', document.baseURI).href;
  const externalApps = [];

  function addRegistryApps(apps) {
    if (!Array.isArray(apps) || typeof catalog === 'undefined') return;
    for (const item of apps) {
      if (!item || !item.id || !item.name || !item.url || item.type !== 'external') continue;
      if (catalog.some(app => app[0] === item.id)) continue;
      const emoji = item.id === 'tiktok' ? '♪' : '▶';
      catalog.push([item.id, emoji, item.name, 'Serviço oficial • abre no navegador']);
      externalApps.push({
        id: item.id,
        name: item.name,
        provider: item.provider || '',
        url: item.url,
        integration: item.integration || 'official-web'
      });
    }
  }

  function patchOpenApp() {
    if (typeof openApp !== 'function' || window.__lokiExternalOpenPatched) return;
    const originalOpenApp = openApp;
    window.__lokiExternalOpenPatched = true;
    window.openApp = function (id) {
      const app = externalApps.find(item => item.id === id);
      if (app) {
        const popup = window.open(app.url, '_blank');
        if (!popup) {
          if (typeof toast === 'function') toast('Permita a abertura do site no navegador');
        } else {
          try { popup.opener = null; } catch (_) {}
          if (typeof notify === 'function') notify(app.name, 'Serviço oficial aberto');
        }
        return;
      }
      return originalOpenApp(id);
    };
  }

  fetch(registryUrl, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Registry HTTP ' + response.status);
      return response.json();
    })
    .then(data => {
      addRegistryApps(data.apps);
      patchOpenApp();
      if (typeof renderApps === 'function') renderApps();
      if (typeof renderStore === 'function') renderStore();
    })
    .catch(error => console.warn('[Loki One] registry unavailable:', error));
})();
