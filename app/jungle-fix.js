(() => {
  let installed = false;
  const GROUND_RATIO = 0.69;
  const GRAVITY = 2200;
  const JUMP_VELOCITY = -850;

  function install(game) {
    if (!game || installed) return;
    installed = true;
    const state = { runner: null, y: 0, vy: 0, jumping: false, last: performance.now() };

    function getRunner() {
      const runner = game.querySelector('.runner');
      if (runner) state.runner = runner;
      return state.runner;
    }
    function groundY() {
      const runner = getRunner();
      if (!runner) return 0;
      return Math.max(0, game.clientHeight * GROUND_RATIO - (runner.getBoundingClientRect().height || 78));
    }
    function placeRunner() {
      const runner = getRunner();
      if (!runner) return;
      if (!state.jumping) state.y = groundY();
      runner.style.top = `${state.y}px`;
      runner.style.bottom = 'auto';
      runner.style.left = '14%';
      runner.style.transform = 'none';
    }
    function jump() {
      if (!getRunner() || state.jumping) return;
      state.jumping = true;
      state.vy = JUMP_VELOCITY;
    }
    function frame(now) {
      const dt = Math.min(Math.max((now - state.last) / 1000, 0), 0.032);
      state.last = now;
      const runner = getRunner();
      if (runner && game.isConnected) {
        const ground = groundY();
        if (state.jumping) {
          state.vy += GRAVITY * dt;
          state.y += state.vy * dt;
          if (state.y >= ground) {
            state.y = ground;
            state.vy = 0;
            state.jumping = false;
          }
        } else state.y = ground;
        runner.style.top = `${state.y}px`;
        runner.style.bottom = 'auto';
        runner.style.transform = 'none';
      }
      requestAnimationFrame(frame);
    }
    function activate(event) {
      if (event.target?.closest?.('button, input, textarea, a')) return;
      if (event.cancelable) event.preventDefault();
      jump();
    }
    game.addEventListener('pointerdown', activate, { passive: false });
    game.addEventListener('touchstart', activate, { passive: false });
    game.addEventListener('keydown', event => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        jump();
      }
    });
    addEventListener('resize', () => { if (!state.jumping) placeRunner(); });
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
