/* Loki One — official third-party app bridge
 * Loads the public registry and exposes approved external services through
 * their official websites. No proprietary APK/binary is redistributed.
 */
(function () {
  'use strict';

  const registryUrl = new URL('./loki-apps.json', document.baseURI).href;
  const externalApps = [];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function addRegistryApps(apps) {
    if (!Array.isArray(apps) || typeof catalog === 'undefined') return;

    for (const item of apps) {
      if (!item || !item.id || !item.name || !item.url) continue;
      if (item.type !== 'external') continue;
      if (catalog.some(app => app.id === item.id)) continue;

      const app = {
        id: item.id,
        name: item.name,
        desc: 'Serviço oficial • abre no navegador',
        emoji: item.id === 'tiktok' ? '♪' : '▶',
        external: true,
        provider: item.provider || '',
        url: item.url,
        integration: item.integration || 'official-web'
      };
      catalog.push(app);
      externalApps.push(app);
    }
  }

  function renderExternalStore() {
    const host = document.getElementById('storeList');
    if (!host || !externalApps.length) return;

    for (const app of externalApps) {
      if (host.querySelector(`[data-loki-external="${CSS.escape(app.id)}"]`)) continue;
      const installedNow = Array.isArray(installed) && installed.includes(app.id);
      const row = document.createElement('div');
      row.className = 'row glass';
      row.dataset.lokiExternal = app.id;
      row.innerHTML = `
        <div class="appIcon" style="flex:0 0 52px;width:52px;height:52px;font-size:24px">${escapeHtml(app.emoji)}</div>
        <div class="grow">
          <b>${escapeHtml(app.name)}</b>
          <div class="muted">${escapeHtml(app.desc)}</div>
          <div class="muted">${escapeHtml(app.provider)} • oficial</div>
        </div>
        <button class="btn ${installedNow ? '' : 'primary'}" data-action="${installedNow ? 'open' : 'install'}">
          ${installedNow ? 'Abrir' : 'Instalar'}
        </button>`;
      row.querySelector('button').addEventListener('click', () => {
        if (installedNow) openApp(app.id);
        else if (typeof install === 'function') install(app.id);
      });
      host.appendChild(row);
    }
  }

  function patchOpenApp() {
    if (typeof openApp !== 'function' || window.__lokiExternalOpenPatched) return;
    const originalOpenApp = openApp;
    window.__lokiExternalOpenPatched = true;
    window.openApp = function (id) {
      const app = externalApps.find(item => item.id === id);
      if (app) {
        window.open(app.url, '_blank', 'noopener,noreferrer');
        if (typeof notify === 'function') notify(`${app.name} aberto`);
        return;
      }
      return originalOpenApp(id);
    };
  }

  function refresh() {
    try {
      if (typeof renderApps === 'function') renderApps();
      if (typeof renderStore === 'function') renderStore();
      renderExternalStore();
    } catch (error) {
      console.warn('[Loki One] third-party bridge:', error);
    }
  }

  fetch(registryUrl, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`registry HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      addRegistryApps(data.apps);
      patchOpenApp();
      refresh();
    })
    .catch(error => console.warn('[Loki One] registry unavailable:', error));
})();
