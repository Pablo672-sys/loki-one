(() => {
  let gameState = null;
  const GROUND_RATIO = 0.69;

  function install(game) {
    if (!game || game.dataset.jungleFix === '1') return;
    game.dataset.jungleFix = '1';

    const state = {
      runner: null,
      y: 0,
      vy: 0,
      jumping: false,
      last: performance.now()
    };
    gameState = state;

    function placeRunner() {
      const runner = game.querySelector('.runner');
      if (!runner) return false;
      state.runner = runner;
      const h = game.clientHeight;
      const rh = runner.getBoundingClientRect().height || 78;
      state.y = Math.max(0, h * GROUND_RATIO - rh);
      runner.style.top = state.y + 'px';
      runner.style.bottom = 'auto';
      runner.style.transform = 'none';
      runner.style.left = '14%';
      return true;
    }

    function jump() {
      if (!state.runner || state.jumping) return;
      state.jumping = true;
      state.vy = -850;
    }

    function frame(now) {
      const dt = Math.min((now - state.last) / 1000, 0.032);
      state.last = now;
      if (state.runner && game.isConnected) {
        const h = game.clientHeight;
        const rh = state.runner.getBoundingClientRect().height || 78;
        const ground = h * GROUND_RATIO - rh;
        if (state.jumping) {
          state.vy += 2200 * dt;
          state.y += state.vy * dt;
          if (state.y >= ground) {
            state.y = ground;
            state.vy = 0;
            state.jumping = false;
          }
          state.runner.style.top = state.y + 'px';
          state.runner.style.bottom = 'auto';
        } else {
          state.y = ground;
          state.runner.style.top = state.y + 'px';
          state.runner.style.bottom = 'auto';
        }
      }
      requestAnimationFrame(frame);
    }

    function activate(e) {
      if (e.target && e.target.closest && e.target.closest('button')) return;
      if (e.cancelable) e.preventDefault();
      jump();
    }

    game.addEventListener('pointerdown', activate, { passive: false });
    game.addEventListener('touchstart', activate, { passive: false });
    game.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    });

    new MutationObserver(() => placeRunner()).observe(game, { childList: true, subtree: true });
    addEventListener('resize', placeRunner);
    placeRunner();
    requestAnimationFrame(frame);
  }

  function scan() {
    const game = document.querySelector('.game');
    if (game) install(game);
  }

  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('load', scan);
  scan();
})();
