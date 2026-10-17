/* =========================================================
   Ascend: parallax scrolling
   ---------------------------------------------------------
   Every element with a data-speed attribute is a parallax layer.

     data-speed   vertical depth.
                   0     scrolls with the page
                   > 0   moves slower than the page (looks far away)
                   < 0   moves faster than the page (looks close)
     data-x       optional sideways drift per pixel of scroll
     data-fade    optional: fades the element out as it leaves the
                   screen (value is the fraction of the screen height)

   Scroll position is smoothed with a small ease so layers glide
   instead of snapping, and only sections near the screen are updated.
   ========================================================= */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Collect sections and their layers ---------- */
  const scenes = Array.from(document.querySelectorAll('[data-scene]')).map((el) => ({
    el,
    id: el.id,
    name: el.dataset.name || '',
    top: 0,
    height: 0,
    layers: Array.from(el.querySelectorAll('[data-speed]')).map((layer) => ({
      el: layer,
      speed: parseFloat(layer.dataset.speed) || 0,
      x: parseFloat(layer.dataset.x) || 0,
      fade: layer.dataset.fade ? parseFloat(layer.dataset.fade) : 0,
    })),
  }));

  const progressBar = document.getElementById('progressBar');
  const altitudeEl = document.getElementById('altitude');
  const altUnitEl = document.getElementById('altUnit');
  const sceneLabel = document.getElementById('sceneLabel');
  const dots = Array.from(document.querySelectorAll('.dots a'));
  const hint = document.querySelector('.scroll-hint');
  const hero = document.getElementById('ground');
  const spaceScene = scenes.find((s) => s.id === 'space');

  let vh = window.innerHeight;
  let docMax = 1;
  let activeIndex = -1;

  /* ---------- Measure section positions ---------- */
  function measure() {
    vh = window.innerHeight;
    const scrollY = window.scrollY;
    scenes.forEach((s) => {
      const rect = s.el.getBoundingClientRect();
      s.top = rect.top + scrollY;
      s.height = rect.height;
    });
    docMax = Math.max(1, document.documentElement.scrollHeight - vh);
  }

  /* ---------- Star fields (one element, many box-shadows) ---------- */
  function buildStars() {
    document.querySelectorAll('.starfield').forEach((field) => {
      const box = field.parentElement;
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      const count = parseInt(field.dataset.count, 10) || 60;
      const size = parseInt(field.dataset.size, 10) || 1;
      const shadows = [];
      for (let i = 0; i < count; i++) {
        const x = Math.round(Math.random() * w);
        const y = Math.round(Math.random() * h);
        const a = (0.45 + Math.random() * 0.55).toFixed(2);
        shadows.push(`${x}px ${y}px 0 0 rgba(255,255,255,${a})`);
      }
      field.style.setProperty('--s', size + 'px');
      field.style.boxShadow = shadows.join(',');
    });
  }

  /* ---------- Move the layers ---------- */
  function render(y) {
    const mid = y + vh / 2;
    for (const s of scenes) {
      // skip sections that are far off screen
      if (y > s.top + s.height + vh * 0.25 || y + vh < s.top - vh * 0.25) continue;

      // distance from the middle of the section to the middle of the screen
      const offset = s.top + s.height / 2 - mid;

      for (const l of s.layers) {
        const ty = -offset * l.speed;
        const tx = offset * l.x;
        l.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
        if (l.fade) {
          l.el.style.opacity = clamp(1 - Math.abs(offset) / (vh * l.fade), 0, 1).toFixed(3);
        }
      }
    }
  }

  /* ---------- Progress bar, altitude and active section ---------- */
  function formatAltitude(m) {
    if (m < 10000) return { value: Math.round(m).toLocaleString('en-US'), unit: 'm' };
    return { value: (m / 1000).toFixed(1), unit: 'km' };
  }

  function updateHud(y) {
    const progress = clamp(y / docMax, 0, 1);
    progressBar.style.transform = `scaleX(${progress})`;

    // altitude reaches 100 km (the edge of space) when the space section arrives
    const edge = spaceScene ? Math.max(1, spaceScene.top) : docMax;
    const alt = formatAltitude((y / edge) * 100000);
    altitudeEl.textContent = alt.value;
    altUnitEl.textContent = alt.unit;

    const mid = y + vh / 2;
    let index = scenes.findIndex((s) => mid >= s.top && mid < s.top + s.height);
    if (index === -1) index = mid < scenes[0].top ? 0 : scenes.length - 1;
    if (index !== activeIndex) {
      activeIndex = index;
      sceneLabel.textContent = scenes[index].name;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    if (hint) hint.classList.toggle('hide', window.scrollY > 80);
  }

  /* ---------- Animation loop with eased scroll ---------- */
  let current = window.scrollY;
  let lastRendered = -1;

  function tick() {
    const target = window.scrollY;
    current += (target - current) * 0.1;
    if (Math.abs(target - current) < 0.1) current = target;

    if (current !== lastRendered) {
      render(current);
      updateHud(current);
      lastRendered = current;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Mouse parallax on the mountain layers ---------- */
  if (hero && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      hero.style.setProperty('--mx', ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
      hero.style.setProperty('--my', ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));
    }, { passive: true });
  }

  /* ---------- Start ---------- */
  measure();
  buildStars();

  if (reduceMotion) {
    // no moving layers; just keep the progress bar and altitude up to date
    const update = () => updateHud(window.scrollY);
    window.addEventListener('scroll', update, { passive: true });
    update();
  } else {
    render(current);
    updateHud(current);
    requestAnimationFrame(tick);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      buildStars();
      lastRendered = -1;
    }, 150);
  });

  // re-measure when fonts or images change the page height
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { measure(); lastRendered = -1; }).observe(document.body);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); lastRendered = -1; });
  }
  window.addEventListener('load', () => { measure(); lastRendered = -1; });
})();
