/* interactions.js — PlantGuard AI premium micro-interactions */
(function () {
  'use strict';

  /* ── Ripple on all action buttons ─────────────────── */
  function addRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  function attachRipples() {
    document.querySelectorAll(
      '.btn-primary, .btn-secondary, .btn-camera, .btn-export, .btn-copy, .btn-logout, .pg-btn'
    ).forEach(btn => {
      if (!btn.dataset.ripple) {
        btn.addEventListener('click', addRipple);
        btn.dataset.ripple = '1';
      }
    });
  }
  attachRipples();

  // Re-attach after dynamic content (history/stats load)
  const observer = new MutationObserver(attachRipples);
  observer.observe(document.body, { childList: true, subtree: true });

  /* ── Scan text cycling ─────────────────────────────── */
  const SCAN_MESSAGES = [
    'Analyzing leaf…',
    'Detecting patterns…',
    'Running AI model…',
    'Classifying disease…',
    'Almost done…',
  ];
  let scanInterval = null;

  function startScanText() {
    const el = document.querySelector('.scan-text');
    if (!el) return;
    let i = 0;
    el.textContent = SCAN_MESSAGES[0];
    scanInterval = setInterval(() => {
      i = (i + 1) % SCAN_MESSAGES.length;
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = SCAN_MESSAGES[i];
        el.style.opacity = '1';
      }, 220);
    }, 1800);
  }

  function stopScanText() {
    clearInterval(scanInterval);
    scanInterval = null;
    const el = document.querySelector('.scan-text');
    if (el) el.style.opacity = '1';
  }

  /* ── Patch overlay show/hide ───────────────────────── */
  const overlay = document.getElementById('analyzingOverlay');
  if (overlay) {
    const origAdd = overlay.classList.add.bind(overlay.classList);
    const origRemove = overlay.classList.remove.bind(overlay.classList);

    overlay.classList.add = function (...args) {
      origAdd(...args);
      if (args.includes('show')) startScanText();
    };
    overlay.classList.remove = function (...args) {
      origRemove(...args);
      if (args.includes('show')) stopScanText();
    };
  }

  /* ── Confidence bar: reset to 0 then animate ──────── */
  function animateConfBar(targetPct) {
    const bar = document.getElementById('confBar');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    // Force reflow then animate
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.style.transition = 'width 1.1s cubic-bezier(0.22, 1, 0.36, 1)';
      bar.style.width = targetPct + '%';
    }));
  }

  /* ── Result card entrance ──────────────────────────── */
  function triggerResultEntrance() {
    const rv = document.getElementById('resultView');
    if (!rv) return;
    rv.classList.remove('result-enter');
    void rv.offsetWidth; // reflow
    rv.classList.add('result-enter');
  }

  /* ── Preview fade-in ───────────────────────────────── */
  function triggerPreviewEntrance() {
    const pw = document.getElementById('previewWrap');
    if (!pw) return;
    pw.classList.remove('preview-enter');
    void pw.offsetWidth;
    pw.classList.add('preview-enter');
  }

  /* ── Intercept showPreview to add animation ────────── */
  // Wait for index.html script to define showPreview, then wrap it
  window.addEventListener('load', () => {
    // Wrap showPreview
    if (typeof window.showPreview === 'function') {
      const orig = window.showPreview;
      window.showPreview = function (file) {
        orig(file);
        triggerPreviewEntrance();
      };
    }

    // Wrap predictBtn click result display
    // We hook into resultView display changes via MutationObserver
    const resultView = document.getElementById('resultView');
    if (resultView) {
      const ro = new MutationObserver(() => {
        if (resultView.style.display === 'block') {
          triggerResultEntrance();
          // Animate confidence bar
          const bar = document.getElementById('confBar');
          if (bar) {
            const pct = parseFloat(bar.style.width) || 0;
            animateConfBar(pct);
          }
        }
      });
      ro.observe(resultView, { attributes: true, attributeFilter: ['style'] });
    }
  });

  /* ── Upload zone: enhanced drag feedback ───────────── */
  const uploadZone = document.getElementById('uploadZone');
  if (uploadZone) {
    let dragCounter = 0;
    uploadZone.addEventListener('dragenter', () => {
      dragCounter++;
      uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
      dragCounter--;
      if (dragCounter <= 0) { dragCounter = 0; uploadZone.classList.remove('dragover'); }
    });
    uploadZone.addEventListener('drop', () => { dragCounter = 0; });
  }

  /* ── Navbar active indicator smooth switch ─────────── */
  // Already handled by switchPage in index.html; just ensure transitions
  document.querySelectorAll('.topbar-nav a').forEach(a => {
    a.style.transition = 'background 0.2s ease, color 0.2s ease';
  });

})();
