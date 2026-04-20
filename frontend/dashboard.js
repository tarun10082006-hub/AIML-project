/* dashboard.js — PlantGuard AI */
'use strict';

const API = 'http://127.0.0.1:8000';
const email = localStorage.getItem('user_email');
if (!email) window.location.href = 'login.html';

/* ── Init lang ── */
initLangSwitcher();

/* ── Dark mode ── */
const darkToggle = document.getElementById('darkToggle');
if (localStorage.getItem('pg_dark') === '1') { document.body.classList.add('dark-mode'); darkToggle.textContent = '☀️'; }
darkToggle.addEventListener('click', () => {
  const on = document.body.classList.toggle('dark-mode');
  darkToggle.textContent = on ? '☀️' : '🌙';
  localStorage.setItem('pg_dark', on ? '1' : '0');
});

/* ── User info ── */
const uname = localStorage.getItem('user_name');
if (uname) {
  const initial = uname.charAt(0).toUpperCase();
  const first = uname.split(' ')[0];
  document.getElementById('sidebarAvatar').textContent = initial;
  document.getElementById('sidebarName').textContent = 'Hi, ' + first;
  const tu = document.getElementById('topbarUser');
  if (tu) {
    tu.style.display = 'flex';
    document.getElementById('topbarAvatar').textContent = initial;
    document.getElementById('topbarName').textContent = 'Hi, ' + first;
  }
}

/* ── Toast ── */
function toast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${msg}</span>`;
  c.appendChild(el);
  el.addEventListener('click', () => removeToast(el));
  setTimeout(() => removeToast(el), 3500);
}
function removeToast(el) {
  el.classList.add('removing');
  setTimeout(() => el.remove(), 280);
}
window.removeToast = removeToast;

/* ── Page switching ── */
const PAGE_ORDER = ['detect', 'history', 'stats'];
const PAGE_TITLES = { detect: '🔬 Detector', history: '📋 History', stats: '📊 Analytics' };

function switchPage(page) {
  const current = PAGE_ORDER.find(p =>
    document.getElementById('page' + cap(p)).classList.contains('active')
  ) || 'detect';
  if (current === page) return;

  const fromIdx = PAGE_ORDER.indexOf(current);
  const toIdx   = PAGE_ORDER.indexOf(page);
  const goRight = toIdx > fromIdx;

  const fromEl = document.getElementById('page' + cap(current));
  const toEl   = document.getElementById('page' + cap(page));

  fromEl.classList.add(goRight ? 'page-exit-left' : 'page-exit-right');
  setTimeout(() => {
    fromEl.classList.remove('active', 'page-exit-left', 'page-exit-right');
    toEl.classList.add('active', goRight ? 'page-enter-right' : 'page-enter-left');
    setTimeout(() => toEl.classList.remove('page-enter-right', 'page-enter-left'), 500);
  }, 260);

  /* update sidebar active */
  PAGE_ORDER.forEach(p => {
    const el = document.getElementById('sNav' + cap(p));
    if (el) el.classList.toggle('active', p === page);
  });

  /* update topbar title */
  const titleEl = document.getElementById('dashPageTitle');
  if (titleEl) {
    titleEl.style.opacity = '0';
    titleEl.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      titleEl.textContent = PAGE_TITLES[page] || '';
      titleEl.style.transition = 'opacity .25s ease, transform .25s ease';
      titleEl.style.opacity = '1';
      titleEl.style.transform = 'translateY(0)';
    }, 180);
  }

  if (page === 'history') setTimeout(() => loadHistory(), 300);
  if (page === 'stats')   setTimeout(() => loadStats(),   300);
}
window.switchPage = switchPage;

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ── Hamburger / Sidebar mobile ── */
const hamburgerBtn   = document.getElementById('hamburgerBtn');
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('show');
  hamburgerBtn.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
  hamburgerBtn.classList.remove('open');
  document.body.style.overflow = '';
}
hamburgerBtn.addEventListener('click', () =>
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar()
);
sidebarOverlay.addEventListener('click', closeSidebar);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });

/* close sidebar on nav link click (mobile) */
document.querySelectorAll('.sidebar-link').forEach(l => {
  l.addEventListener('click', () => { if (window.innerWidth <= 768) closeSidebar(); });
});

/* ── Topbar scroll glass ── */
const dashTopbar = document.getElementById('dashTopbar');
window.addEventListener('scroll', () => {
  dashTopbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ── Logout ── */
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_name');
  window.location.href = 'login.html';
});

/* ══════════════════════════════════════
   DETECT PAGE
══════════════════════════════════════ */
const fileInput   = document.getElementById('fileInput');
const preview     = document.getElementById('preview');
const uploadZone  = document.getElementById('uploadZone');
const predictBtn  = document.getElementById('predictBtn');
const msgEl       = document.getElementById('msg');
const overlay     = document.getElementById('analyzingOverlay');
const previewWrap = document.getElementById('previewWrap');
const uploadView  = document.getElementById('uploadView');
const resultView  = document.getElementById('resultView');

window.showPreview = function (file) {
  preview.src = URL.createObjectURL(file);
  previewWrap.style.display = 'block';
  uploadZone.style.display  = 'none';
  msgEl.textContent = '';
};
window.clearPreview = function () {
  preview.src = '';
  previewWrap.style.display = 'none';
  uploadZone.style.display  = 'block';
  uploadView.style.display  = 'block';
  resultView.style.display  = 'none';
  msgEl.textContent = '';
  fileInput.value = '';
  document.getElementById('confWarning').classList.remove('show');
  document.getElementById('alsoSection').style.display = 'none';
};

fileInput.addEventListener('change', e => { const f = e.target.files[0]; if (f) showPreview(f); });
document.getElementById('removeBtn').addEventListener('click', clearPreview);
document.getElementById('newScanBtn').addEventListener('click', clearPreview);

/* drag & drop */
uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault(); uploadZone.classList.remove('dragover');
  const f = e.dataTransfer.files[0]; if (!f) return;
  fileInput.files = e.dataTransfer.files; showPreview(f);
});

/* camera */
let cameraStream = null;
document.getElementById('cameraBtn').addEventListener('click', async () => {
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    document.getElementById('cameraInput').click(); return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    document.getElementById('cameraStream').srcObject = cameraStream;
    document.getElementById('cameraPreviewWrap').style.display = 'block';
    uploadZone.style.display = 'none';
  } catch { document.getElementById('cameraInput').click(); }
});
document.getElementById('captureBtn').addEventListener('click', () => {
  const video  = document.getElementById('cameraStream');
  const canvas = document.getElementById('captureCanvas');
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  canvas.toBlob(blob => {
    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
    const dt = new DataTransfer(); dt.items.add(file);
    fileInput.files = dt.files;
    showPreview(file); stopCamera();
  }, 'image/jpeg', 0.9);
});
document.getElementById('cancelCameraBtn').addEventListener('click', stopCamera);
document.getElementById('cameraInput').addEventListener('change', e => {
  const f = e.target.files[0]; if (f) { fileInput.files = e.target.files; showPreview(f); }
});
function stopCamera() {
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
  document.getElementById('cameraPreviewWrap').style.display = 'none';
  uploadZone.style.display = 'block';
}

/* severity helpers */
function sevClass(sev) {
  const s = (sev || '').toLowerCase();
  if (['high','critical','very high'].some(w => s.includes(w))) return 'sev-high';
  if (s.includes('moderate')) return 'sev-moderate';
  if (s === 'none') return 'sev-none';
  return 'sev-moderate';
}
function sevIcon(sev) {
  const s = (sev || '').toLowerCase();
  if (['high','critical','very high'].some(w => s.includes(w))) return '🔴';
  if (s.includes('moderate')) return '🟡';
  if (s === 'none') return '🟢';
  return '⚪';
}

/* predict */
predictBtn.addEventListener('click', async () => {
  if (!fileInput.files[0]) { toast(t('detect_no_image'), 'error'); return; }
  predictBtn.disabled = true; predictBtn.textContent = t('detect_analyzing');
  overlay.classList.add('show');
  const form = new FormData();
  form.append('email', email);
  form.append('file', fileInput.files[0]);
  try {
    const res  = await fetch(`${API}/predict`, { method: 'POST', body: form });
    const data = await res.json();
    overlay.classList.remove('show');
    if (res.ok) {
      document.getElementById('resultText').textContent = data.prediction.replace(/_/g, ' ');
      const healthy = data.prediction.toLowerCase().includes('healthy');
      document.getElementById('resultSub').textContent = healthy
        ? 'Your plant looks healthy — no disease detected!'
        : 'Disease detected — see details and recommended actions below.';
      const pct = data.confidence ? (data.confidence * 100).toFixed(1) : null;
      document.getElementById('confBar').style.width  = pct ? pct + '%' : '0%';
      document.getElementById('confText').textContent = pct ? `${t('detect_confidence')} ${pct}%` : '';
      const warn = document.getElementById('confWarning');
      if (data.confidence > 0 && data.confidence < 0.75) {
        document.getElementById('confWarningText').textContent =
          'The AI isn\'t fully confident. Try retaking in better lighting.';
        warn.classList.add('show');
      } else { warn.classList.remove('show'); }
      const top3 = (data.top3 || []).slice(1).filter(x => x.confidence > 0.03);
      const alsoSection = document.getElementById('alsoSection');
      if (top3.length) {
        document.getElementById('alsoList').innerHTML = top3.map(x =>
          `<div class="also-row"><span class="also-name">${x.label.replace(/___/g,' › ').replace(/_/g,' ')}</span><span class="also-conf">${(x.confidence*100).toFixed(1)}%</span></div>`
        ).join('');
        alsoSection.style.display = 'block';
      } else { alsoSection.style.display = 'none'; }
      localStorage.setItem('lastDetectedDisease', data.prediction);
      try {
        const rr = await fetch(`${API}/report?disease=${encodeURIComponent(data.prediction)}`);
        const rd = await rr.json();
        const sev = rd.info?.severity || '';
        document.getElementById('resultSevBadge').innerHTML =
          `<span class="result-sev-badge ${sevClass(sev)}">${sevIcon(sev)} ${sev || 'Unknown severity'}</span>`;
      } catch { document.getElementById('resultSevBadge').innerHTML = ''; }
      uploadView.style.display = 'none';
      resultView.style.display = 'block';
      toast('Diagnosis complete!', 'success');
    } else { toast(data.detail || 'Prediction failed.', 'error'); }
  } catch {
    overlay.classList.remove('show');
    toast(t('detect_error_server'), 'error');
  } finally {
    predictBtn.disabled = false; predictBtn.textContent = t('detect_analyze');
  }
});

/* copy result */
document.getElementById('copyResultBtn').addEventListener('click', () => {
  const text = document.getElementById('resultText').textContent;
  const conf = document.getElementById('confText').textContent;
  navigator.clipboard.writeText(`${text} | ${conf}`).then(() => {
    const btn = document.getElementById('copyResultBtn');
    btn.textContent = '✓ Copied'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
  });
});

/* email report */
document.getElementById('emailReportBtn').addEventListener('click', async () => {
  const disease = localStorage.getItem('lastDetectedDisease'); if (!disease) return;
  const btn = document.getElementById('emailReportBtn');
  btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const form = new FormData();
    form.append('email', email); form.append('disease', disease);
    form.append('confidence', document.getElementById('confText').textContent);
    const res = await fetch(`${API}/email-report`, { method: 'POST', body: form });
    if (res.ok) toast('Report sent to your email!', 'success');
    else toast('Failed to send email.', 'error');
  } catch { toast('Failed to send email.', 'error'); }
  finally { btn.disabled = false; btn.textContent = t('detect_email'); }
});

/* download report */
document.getElementById('downloadReportBtn').addEventListener('click', async () => {
  const disease = localStorage.getItem('lastDetectedDisease'); if (!disease) return;
  const btn = document.getElementById('downloadReportBtn');
  btn.disabled = true; btn.textContent = t('detect_generating');
  try {
    const res  = await fetch(`${API}/report?disease=${encodeURIComponent(disease)}`);
    const data = await res.json();
    const info = data.info;
    const name = info.disease.replace(/___/g, ' › ').replace(/_/g, ' ');
    const conf = document.getElementById('confText').textContent;
    const imgSrc = document.getElementById('preview').src;
    const date = new Date().toLocaleString();
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>PlantGuard Report – ${name}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff;padding:40px;max-width:720px;margin:0 auto}.header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #059669;padding-bottom:20px;margin-bottom:28px}.logo{font-size:2.2rem}.brand{font-size:1.4rem;font-weight:800;color:#059669}.disease-name{font-size:1.6rem;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:capitalize}.meta{font-size:.82rem;color:#64748b;margin-bottom:24px}.img-wrap{text-align:center;margin-bottom:24px}.img-wrap img{max-width:320px;max-height:220px;object-fit:cover;border-radius:12px;border:2px solid #bbf7d0}.section{margin-bottom:20px;padding:16px 20px;border-radius:10px;background:#f8fafc;border-left:4px solid #059669}.section-title{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:6px}.section-body{font-size:.9rem;line-height:1.65;color:#334155}.footer{margin-top:36px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:.75rem;color:#94a3b8;text-align:center}</style></head><body>
<div class="header"><div class="logo">🌿</div><div><div class="brand">PlantGuard AI</div></div></div>
<div class="disease-name">${name}</div>
<div class="meta">Generated: ${date} | ${email}</div>
${imgSrc ? `<div class="img-wrap"><img src="${imgSrc}" alt="leaf"/></div>` : ''}
${conf ? `<p style="margin-bottom:20px;font-weight:700;color:#059669">${conf}</p>` : ''}
<div class="section"><div class="section-title">Severity</div><div class="section-body">${info.severity}</div></div>
<div class="section"><div class="section-title">Cause</div><div class="section-body">${info.cause}</div></div>
<div class="section"><div class="section-title">Symptoms</div><div class="section-body">${info.symptoms}</div></div>
<div class="section"><div class="section-title">Treatment</div><div class="section-body">${info.treatment}</div></div>
<div class="section"><div class="section-title">Prevention</div><div class="section-body">${info.prevention}</div></div>
<div class="footer">PlantGuard AI — AI-generated report. Verify with an agronomist for critical decisions.</div>
</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html); win.document.close();
    win.onload = () => { win.focus(); win.print(); };
    toast('Report ready!', 'success');
  } catch { toast(t('detect_report_error'), 'error'); }
  finally { btn.disabled = false; btn.textContent = t('detect_download'); }
});

/* ══════════════════════════════════════
   HISTORY
══════════════════════════════════════ */
let histPage = 1;
async function loadHistory(page = 1) {
  histPage = page;
  const box = document.getElementById('historyContainer');
  box.innerHTML = '<div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div></div>';
  try {
    const res  = await fetch(`${API}/history?email=${encodeURIComponent(email)}&page=${page}&per_page=10`);
    const data = await res.json();
    if (!data.history || data.history.length === 0) {
      box.innerHTML = `<p class="history-empty">${t('history_empty')}</p>`; return;
    }
    const totalPages = Math.ceil(data.total / 10);
    let html = `<div class="history-toolbar"><button class="btn-export" id="exportCsvBtn">${t('history_export')}</button></div>`;
    html += data.history.map(h => {
      const date = new Date(h.timestamp).toLocaleString();
      const conf = h.confidence ? `<span class="history-conf">${(h.confidence*100).toFixed(1)}%</span>` : '';
      const isHealthy = h.prediction.toLowerCase().includes('healthy');
      const badge = isHealthy
        ? `<span class="sev-none">${t('history_healthy')}</span>`
        : `<span class="sev-high">${t('history_diseased')}</span>`;
      return `<div class="history-row"><div style="flex:1;min-width:0"><div class="history-disease">${h.prediction.replace(/_/g,' ')}</div><div class="history-meta">${h.filename||''} · ${date}</div></div><div class="history-actions">${badge}${conf}<button class="btn-del" data-ts="${h.timestamp}">${t('history_delete')}</button></div></div>`;
    }).join('');
    if (totalPages > 1) {
      html += `<div class="pagination">
        <button class="pg-btn" ${page<=1?'disabled':''} onclick="loadHistory(${page-1})">← Prev</button>
        <span class="pg-info">Page ${page} / ${totalPages}</span>
        <button class="pg-btn" ${page>=totalPages?'disabled':''} onclick="loadHistory(${page+1})">Next →</button>
      </div>`;
    }
    box.innerHTML = html;
    box.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(t('history_delete_confirm'))) return;
        const form = new FormData();
        form.append('email', email); form.append('timestamp', btn.dataset.ts);
        await fetch(`${API}/history/delete`, { method: 'DELETE', body: form });
        toast('Record deleted', 'info'); loadHistory(histPage);
      });
    });
    document.getElementById('exportCsvBtn').addEventListener('click', async () => {
      const allRes  = await fetch(`${API}/history?email=${encodeURIComponent(email)}&page=1&per_page=1000`);
      const allData = await allRes.json();
      const rows = [['Disease','Filename','Confidence','Date']];
      allData.history.forEach(h => rows.push([
        h.prediction.replace(/_/g,' '), h.filename||'',
        h.confidence ? (h.confidence*100).toFixed(1)+'%' : '',
        new Date(h.timestamp).toLocaleString()
      ]));
      const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      const a = document.createElement('a');
      a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      a.download = 'plantguard_history.csv'; a.click();
      toast('CSV exported!', 'success');
    });
  } catch {
    box.innerHTML = `<p class="history-empty" style="color:#ef4444">${t('history_error')}</p>`;
  }
}
window.loadHistory = loadHistory;

/* ══════════════════════════════════════
   STATS
══════════════════════════════════════ */
let trendChart = null;
async function loadStats() {
  const box = document.getElementById('statsContainer');
  box.innerHTML = '<div class="skeleton-list"><div class="skeleton-stat-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div></div>';
  try {
    const res = await fetch(`${API}/stats?email=${encodeURIComponent(email)}`);
    const d   = await res.json();
    const healthyPct  = d.total ? Math.round(d.healthy  / d.total * 100) : 0;
    const diseasedPct = d.total ? Math.round(d.diseased / d.total * 100) : 0;
    const hRes  = await fetch(`${API}/history?email=${encodeURIComponent(email)}&page=1&per_page=1000`);
    const hData = await hRes.json();
    const days  = new Set((hData.history || []).map(h => new Date(h.timestamp).toDateString()));
    const streak = days.size;
    const streakHtml = `<div class="streak-banner"><div class="streak-fire">🔥</div><div class="streak-info"><div class="streak-num">${streak}</div><div class="streak-label">Active scan day${streak!==1?'s':''}</div></div></div>`;
    const topHtml = d.top_diseases.length
      ? d.top_diseases.map((item, i) =>
          `<div class="top-disease-row"><span class="top-rank">${i+1}</span><span style="flex:1;margin:0 12px;font-weight:600;color:#0f172a">${item[0].replace(/___/g,' › ').replace(/_/g,' ')}</span><span style="color:#64748b;font-size:.8rem">${item[1]} ${item[1]>1?t('stats_scans'):t('stats_scan')}</span></div>`
        ).join('')
      : `<p class="history-empty" style="padding:16px 0">${t('stats_no_disease')}</p>`;
    const trendData = d.trend || [];
    const chartHtml = trendData.length >= 2
      ? `<div style="margin:20px 0 8px;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748b">📈 Scan Trend (last 14 days)</div><div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0;margin-bottom:20px"><canvas id="trendChart" height="120"></canvas></div>`
      : '';
    box.innerHTML = `${streakHtml}
      <div class="stats-grid">
        <div class="stat-card"><div class="s-num">${d.total}</div><div class="s-label">${t('stats_total')}</div></div>
        <div class="stat-card"><div class="s-num" style="color:#059669">${d.healthy}</div><div class="s-label">${t('stats_healthy')} (${healthyPct}%)</div></div>
        <div class="stat-card"><div class="s-num" style="color:#dc2626">${d.diseased}</div><div class="s-label">${t('stats_diseased')} (${diseasedPct}%)</div></div>
      </div>
      ${chartHtml}
      <div style="font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748b;margin-bottom:12px">${t('stats_top')}</div>
      ${topHtml}`;
    if (trendData.length >= 2) {
      if (trendChart) { trendChart.destroy(); trendChart = null; }
      const ctx = document.getElementById('trendChart').getContext('2d');
      trendChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: trendData.map(([d]) => d.slice(5)),
          datasets: [{ label:'Scans', data: trendData.map(([,v]) => v), backgroundColor:'rgba(16,185,129,.7)', borderColor:'#059669', borderWidth:1, borderRadius:4 }]
        },
        options: { responsive:true, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true,ticks:{stepSize:1,color:'#64748b'},grid:{color:'rgba(0,0,0,.05)'}}, x:{ticks:{color:'#64748b'},grid:{display:false}} } }
      });
    }
  } catch {
    box.innerHTML = `<p class="history-empty" style="color:#ef4444">${t('stats_error')}</p>`;
  }
}
window.loadStats = loadStats;
