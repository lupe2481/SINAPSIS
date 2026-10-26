(() => {
  const audio = document.createElement('audio');
  audio.src = 'recursos/audio/cinematic-ambient-drone.wav';
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.22;
  document.body.append(audio);
  const button = document.querySelector('.ambient-audio-toggle');
  const read = key => { try { return sessionStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { sessionStorage.setItem(key, value); } catch {} };
  let enabled = read('sinapsis-audio-enabled') !== 'false';
  let pending = false;
  let stainVisible = false, stainAppearing = false, stainPending = false;
  const stain = new Audio('recursos/audio/deep-haunting-drone.mp3');
  stain.preload = 'auto';
  stain.loop = true;
  stain.volume = 0.12;
  const playStain = async () => {
    if (!enabled || !stainAppearing || document.hidden || stainPending || !stain.paused) return;
    stainPending = true;
    try { await stain.play(); if (!enabled || !stainAppearing || document.hidden) stain.pause(); }
    catch {} finally { stainPending = false; }
  };
  document.addEventListener('sinapsis:stain', ({detail}) => {
    const wasVisible = stainVisible, wasAppearing = stainAppearing;
    stainVisible = detail.visible;
    stainAppearing = detail.appearing;
    if (stainVisible) { audio.pause(); effect.pause(); }
    stain.volume = 0.12 * Math.min(1, Math.max(0, (1-detail.progress)/0.2));
    if (stainAppearing && !wasAppearing) { stain.currentTime = 0; void playStain(); }
    if (!stainAppearing) { stain.pause(); }
    if (wasVisible && !stainVisible) void play();
  });
  const effect = new Audio('recursos/audio/soft-notification.mp3');
  effect.preload = 'auto';
  effect.volume = 0.12;
  let lastEffect = -Infinity;
  document.addEventListener('sinapsis:filter-change', () => {
    const now = performance.now();
    if (!enabled || stainVisible || document.hidden || now - lastEffect < 350) return;
    lastEffect = now;
    effect.pause();
    effect.currentTime = 0;
    effect.play().catch(() => {});
  });
  const update = () => {
    const label = enabled ? 'Silenciar todos los sonidos' : 'Activar sonidos';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/>' + (enabled ? '<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>' : '<path d="m16 9 6 6m0-6-6 6"/>') + '</svg>';
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', label);
    button.title = label;
  };
  const play = async () => {
    if (!enabled || pending || stainVisible || document.hidden) return;
    pending = true;
    try { await audio.play(); if (!enabled || stainVisible || document.hidden) audio.pause(); }
    catch { /* A blocked autoplay can be retried with the sound button. */ }
    finally { pending = false; update(); }
  };
  audio.addEventListener('loadedmetadata', () => {
    const position = Number(read('sinapsis-audio-position'));
    if (Number.isFinite(position) && position > 0 && Number.isFinite(audio.duration)) {
      audio.currentTime = position % audio.duration;
    }
  }, { once: true });
  audio.addEventListener('play', update);
  audio.addEventListener('pause', update);
  audio.addEventListener('error', update);
  button.addEventListener('click', () => {
    enabled = !enabled;
    save('sinapsis-audio-enabled', String(enabled));
    if (enabled) { void play(); void playStain(); } else { audio.pause(); effect.pause(); stain.pause(); }
    update();
  });
  const start = event => {
    if (!event.target.closest('.ambient-audio-toggle') && enabled) { if(audio.paused) void play(); void playStain(); }
  };
  document.addEventListener('pointerdown', start);
  document.addEventListener('pointerup', start);
  document.addEventListener('touchend', start, { passive: true });
  document.addEventListener('click', start);
  document.addEventListener('keydown', event => {
    if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.repeat) start(event);
  });
  const remember = () => save('sinapsis-audio-position', String(audio.currentTime));
  window.addEventListener('pagehide', () => { remember(); audio.pause(); effect.pause(); stain.pause(); });
  window.addEventListener('pageshow', () => { if (enabled) void play(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { remember(); audio.pause(); effect.pause(); stain.pause(); } else if (enabled) { void play(); void playStain(); }
  });
  update();
  // Try immediately; gesture listeners retry if autoplay is blocked.
  if (enabled) void play();
})();
