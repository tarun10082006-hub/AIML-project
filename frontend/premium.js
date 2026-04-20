/* premium.js — PlantGuard AI physics & advanced interactions */
(function () {
  'use strict';

  const isMobile = () => window.innerWidth <= 768 ||
    /Android|iPhone|iPad/i.test(navigator.userAgent);

  /* ══════════════════════════════════════════════════
     1. MAGNETIC CURSOR + 3D TILT ON BUTTONS
  ══════════════════════════════════════════════════ */
  function initMagnetic() {
    if (isMobile()) return;

    function attachMagnetic(el) {
      if (el.dataset.magnetic) return;
      el.dataset.magnetic = '1';

      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = (e.clientX - cx) / (r.width  / 2);   // -1 → 1
        const dy = (e.clientY - cy) / (r.height / 2);   // -1 → 1
        el.style.setProperty('--mx', dx.toFixed(3));
        el.style.setProperty('--my', dy.toFixed(3));
      });

      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--mx', '0');
        el.style.setProperty('--my', '0');
      });
    }

    function scanButtons() {
      document.querySelectorAll(
        '.btn-primary:not(:disabled), .btn-secondary, .btn-camera'
      ).forEach(attachMagnetic);
    }
    scanButtons();
    new MutationObserver(scanButtons)
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ══════════════════════════════════════════════════
     2. IMAGE PARALLAX TILT
  ══════════════════════════════════════════════════ */
  function initImageTilt() {
    if (isMobile()) return;

    const wrap = document.getElementById('previewWrap');
    const img  = document.getElementById('preview');
    if (!wrap || !img) return;

    wrap.addEventListener('mousemove', (e) => {
      const r  = wrap.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const rx = ((e.clientY - cy) / (r.height / 2)) * -6;  // tilt X axis
      const ry = ((e.clientX - cx) / (r.width  / 2)) *  6;  // tilt Y axis
      const scale = 1.03;
      img.style.transform =
        `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
    });

    wrap.addEventListener('mouseleave', () => {
      img.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  }

  /* ══════════════════════════════════════════════════
     3. STEPPED AI PROGRESS BAR
     Injected inside the analyzing overlay
  ══════════════════════════════════════════════════ */
  const AI_STEPS = [
    { pct: 15, label: 'Loading image…' },
    { pct: 32, label: 'Analyzing texture…' },
    { pct: 54, label: 'Checking patterns…' },
    { pct: 71, label: 'Running neural network…' },
    { pct: 88, label: 'Finalizing result…' },
    { pct: 97, label: 'Almost there…' },
  ];

  let progressTimer = null;
  let progressEl    = null;
  let progressLabel = null;

  function buildProgressBar() {
    const overlay = document.getElementById('analyzingOverlay');
    if (!overlay || overlay.querySelector('.ai-progress-wrap')) return;

    const wrap = document.createElement('div');
    wrap.className = 'ai-progress-wrap';
    wrap.style.cssText = 'width:70%;position:relative;z-index:13;';
    wrap.innerHTML = `
      <div class="ai-progress-track">
        <div class="ai-progress-fill" id="aiProgressFill"></div>
      </div>
      <div class="ai-progress-label" id="aiProgressLabel"></div>`;
    overlay.appendChild(wrap);

    progressEl    = document.getElementById('aiProgressFill');
    progressLabel = document.getElementById('aiProgressLabel');
  }

  function startProgress() {
    buildProgressBar();
    if (!progressEl) return;

    let step = 0;
    progressEl.style.width = '0%';
    progressLabel.style.opacity = '1';

    function tick() {
      if (step >= AI_STEPS.length) return;
      const { pct, label } = AI_STEPS[step++];
      progressEl.style.width = pct + '%';
      progressLabel.style.opacity = '0';
      setTimeout(() => {
        if (progressLabel) {
          progressLabel.textContent = label;
          progressLabel.style.opacity = '1';
        }
      }, 180);
      const delay = 400 + Math.random() * 500;
      progressTimer = setTimeout(tick, delay);
    }
    tick();
  }

  function stopProgress() {
    clearTimeout(progressTimer);
    if (progressEl)    { progressEl.style.width = '100%'; }
    if (progressLabel) {
      progressLabel.textContent = 'Complete ✓';
      setTimeout(() => {
        if (progressEl)    progressEl.style.width = '0%';
        if (progressLabel) progressLabel.textContent = '';
      }, 600);
    }
  }

  /* ══════════════════════════════════════════════════
     4. HOOK INTO OVERLAY SHOW / HIDE
     (works alongside interactions.js which already
      patches classList — we use a custom event instead)
  ══════════════════════════════════════════════════ */
  function watchOverlay() {
    const overlay = document.getElementById('analyzingOverlay');
    if (!overlay) return;

    const mo = new MutationObserver(() => {
      if (overlay.classList.contains('show')) {
        startProgress();
      } else {
        stopProgress();
      }
    });
    mo.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }

  /* ══════════════════════════════════════════════════
     5. SUCCESS / ERROR FEEDBACK
  ══════════════════════════════════════════════════ */
  function injectCheckmark() {
    // Prepend animated checkmark into result-header if not already there
    const header = document.querySelector('.result-header');
    if (!header || header.querySelector('.success-check')) return;
    const chk = document.createElement('div');
    chk.className = 'success-check';
    chk.innerHTML = `<svg viewBox="0 0 24 24">
      <polyline points="4,13 9,18 20,7"/>
    </svg>`;
    header.prepend(chk);
  }

  function triggerSuccess() {
    const box = document.querySelector('.result-box');
    if (!box) return;
    box.classList.remove('success-flash');
    void box.offsetWidth;
    box.classList.add('success-flash');
    injectCheckmark();
  }

  function triggerError(targetEl) {
    if (!targetEl) return;
    targetEl.classList.remove('shake-error');
    void targetEl.offsetWidth;
    targetEl.classList.add('shake-error');
    targetEl.addEventListener('animationend', () =>
      targetEl.classList.remove('shake-error'), { once: true });
  }

  /* ══════════════════════════════════════════════════
     6. WATCH resultView FOR SUCCESS / ERROR
  ══════════════════════════════════════════════════ */
  function watchResult() {
    const rv = document.getElementById('resultView');
    if (!rv) return;

    new MutationObserver(() => {
      if (rv.style.display === 'block') {
        // Small delay so result-enter animation starts first
        setTimeout(triggerSuccess, 300);
      }
    }).observe(rv, { attributes: true, attributeFilter: ['style'] });
  }

  /* Expose so index.html toast/error paths can call it */
  window.pgTriggerError = function (el) { triggerError(el); };

  /* ══════════════════════════════════════════════════
     7. PAGE SLIDE TRANSITIONS
     Wraps the existing switchPage function
  ══════════════════════════════════════════════════ */
  function wrapSwitchPage() {
    const orig = window.switchPage;
    if (typeof orig !== 'function') return;

    window.switchPage = function (page) {
      // Find currently active page
      const active = document.querySelector('.page.active');
      if (active) {
        active.classList.add('page-exit');
        setTimeout(() => active.classList.remove('page-exit'), 300);
      }
      orig(page);
      // The newly active page gets page-enter
      const next = document.getElementById(
        'page' + page.charAt(0).toUpperCase() + page.slice(1)
      );
      if (next) {
        next.classList.remove('page-enter');
        void next.offsetWidth;
        next.classList.add('page-enter');
        next.addEventListener('animationend', () =>
          next.classList.remove('page-enter'), { once: true });
      }
    };
  }

  /* ══════════════════════════════════════════════════
     8. TOAST — patch removeToast for spring-out
     (toast-container is now top-right via CSS)
  ══════════════════════════════════════════════════ */
  function patchToast() {
    const orig = window.removeToast;
    if (typeof orig !== 'function') return;
    window.removeToast = function (el) {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 320);
    };
  }

  /* ══════════════════════════════════════════════════
     9. INIT — wait for DOM + existing scripts
  ══════════════════════════════════════════════════ */
  window.addEventListener('load', () => {
    initMagnetic();
    initImageTilt();
    watchOverlay();
    watchResult();
    wrapSwitchPage();
    patchToast();
  });

  // Re-init image tilt when a new preview is shown
  const origShowPreview = window.showPreview;
  if (typeof origShowPreview === 'function') {
    window.showPreview = function (file) {
      origShowPreview(file);
      // Re-bind tilt after image src is set
      requestAnimationFrame(initImageTilt);
    };
  } else {
    // showPreview defined later — observe
    window.addEventListener('load', () => {
      const sp = window.showPreview;
      if (typeof sp === 'function' && !sp._tiltWrapped) {
        window.showPreview = function (file) {
          sp(file);
          requestAnimationFrame(initImageTilt);
        };
        window.showPreview._tiltWrapped = true;
      }
    });
  }

})();
