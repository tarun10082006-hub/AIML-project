import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import AnimatedBg from '../components/AnimatedBg'
import styles from './Dashboard.module.css'
import { useT } from '../i18n'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip)

const API = 'http://127.0.0.1:8000'

const PAGES = ['detect', 'history', 'stats', 'gemini', 'profile']
const PAGE_TITLES = { detect: '🔬 Detector', history: '📋 History', stats: '📊 Analytics', gemini: '🤖 Grok AI', profile: '👤 Profile' }

/* ── Toast ── */
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }
  return { toasts, toast: add }
}

function ToastContainer({ toasts }) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  const colors = { success: 'linear-gradient(135deg,#022c1a,#065f46)', error: 'linear-gradient(135deg,#450a0a,#7f1d1d)', info: 'linear-gradient(135deg,#0c1a2e,#1e3a5f)' }
  const textColors = { success: '#6ee7b7', error: '#fca5a5', info: '#93c5fd' }
  return (
    <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderRadius: 14, background: colors[t.type], color: textColors[t.type], fontSize: '.85rem', fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,.25)', animation: 'toastIn .4s cubic-bezier(.34,1.56,.64,1) both', minWidth: 220 }}>
          <span>{icons[t.type]}</span><span>{t.msg}</span>
        </div>
      ))}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(60px) scale(.9)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

/* ── Skeleton ── */
function Skeleton({ stat }) {
  return (
    <div>
      {stat && <div className={styles.skeletonStat} />}
      {[1,2,3].map(i => <div key={i} className={styles.skeletonRow} />)}
    </div>
  )
}

/* ── Detect Page ── */
function DetectPage({ email, toast, onSwitchToChat }) {
  const t = useT()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragover, setDragover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')
  const fileRef = useRef()
  const cameraRef = useRef()

  const showPreview = f => { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setMsg('') }
  const clearPreview = () => { setFile(null); setPreview(null); setResult(null); setMsg('') }

  const onDrop = e => {
    e.preventDefault(); setDragover(false)
    const f = e.dataTransfer.files[0]; if (f) showPreview(f)
  }

  const analyze = async () => {
    if (!file) { setMsg(t('detect_no_image')); return }
    setLoading(true); setMsg('')
    const form = new FormData()
    form.append('email', email); form.append('file', file)
    try {
      const res = await fetch(`${API}/predict`, { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok) {
        if (data.rejected) {
          toast('Not a plant image — please upload a clear leaf photo.', 'error')
          setMsg('⚠️ Not a plant image or unrecognized leaf. Please upload a clear, close-up photo of a single leaf in good lighting.')
          setLoading(false)
          return
        }
        let sev = ''
        try {
          const rr = await fetch(`${API}/report?disease=${encodeURIComponent(data.prediction)}`)
          const rd = await rr.json()
          sev = rd.info?.severity || ''
        } catch {}
        setResult({ ...data, sev })
        localStorage.setItem('lastDetectedDisease', data.prediction)
        toast('Diagnosis complete!', 'success')
      } else { toast(data.detail || 'Prediction failed.', 'error') }
    } catch { toast('Cannot reach server. Is the backend running?', 'error') }
    setLoading(false)
  }

  const sevClass = sev => {
    const s = (sev||'').toLowerCase()
    if (['high','critical','very high'].some(w=>s.includes(w))) return styles.sevHigh
    if (s.includes('moderate')) return styles.sevMod
    if (s==='none') return styles.sevNone
    return styles.sevMod
  }
  const sevIcon = sev => {
    const s=(sev||'').toLowerCase()
    if (['high','critical','very high'].some(w=>s.includes(w))) return '🔴'
    if (s.includes('moderate')) return '🟡'
    if (s==='none') return '🟢'
    return '⚪'
  }

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(`${result.prediction.replace(/_/g,' ')} | ${(result.confidence*100).toFixed(1)}%`)
    toast('Copied!', 'info')
  }

  const emailReport = async () => {
    const disease = localStorage.getItem('lastDetectedDisease'); if (!disease) return
    const form = new FormData()
    form.append('email', email); form.append('disease', disease)
    form.append('confidence', result ? `${(result.confidence*100).toFixed(1)}%` : '')
    try {
      const res = await fetch(`${API}/email-report`, { method: 'POST', body: form })
      if (res.ok) toast('Report sent to your email!', 'success')
      else toast('Failed to send email.', 'error')
    } catch { toast('Failed to send email.', 'error') }
  }

  return (
    <div className={styles.detectGrid}>
      {/* Upload card */}
      <div className={styles.card}>
        <div className={styles.cardBody} style={{ position: 'relative' }}>
          {/* Overlay */}
          <div className={`${styles.overlay} ${loading ? styles.overlayShow : ''}`}>
            <div className={styles.scanRing} />
            <div className={styles.scanText}>{t('detect_analyzing')}</div>
            <div className={styles.scanSub}>Running AI model</div>
          </div>

          {!result ? (
            <>
              {preview ? (
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <img src={preview} alt="preview" className={styles.previewImg} />
                  <button className={styles.removeBtn} onClick={clearPreview}>✕</button>
                </div>
              ) : (
                <div
                  className={`${styles.uploadZone} ${dragover ? styles.dragover : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragover(true) }}
                  onDragLeave={() => setDragover(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current.click()}
                >
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f=e.target.files[0]; if(f) showPreview(f) }} />
                  <span className={styles.uploadIcon}>🍃</span>
                  <p>{t('detect_drop')}</p>
                  <span>{t('detect_browse')}</span>
                </div>
              )}
              <div className={styles.uploadHint}>💡 Best results with clear, close-up photos in good lighting</div>
              <button className={styles.cameraBtn} onClick={() => cameraRef.current.click()}>{t('detect_camera')}</button>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e => { const f=e.target.files[0]; if(f) showPreview(f) }} />
              {msg && <div className={`${styles.msgBox} ${styles.msgError}`}>{msg}</div>}
              <button className={styles.analyzeBtn} onClick={analyze} disabled={loading}>
                {loading ? t('detect_analyzing') : t('detect_analyze')}
              </button>
            </>
          ) : (
            <div className={styles.resultBox}>
              <div className={styles.resultHeader}>
                <div className={styles.resultBadge}>{t('detect_diagnosis')}</div>
              </div>
              <div className={styles.resultBody}>
                <div className={styles.resultValue}>{result.prediction.replace(/_/g,' ')}</div>
                <div className={styles.resultSub}>
                  {result.prediction.toLowerCase().includes('healthy')
                    ? t('detect_healthy')
                    : t('detect_diseased')}
                </div>
                {result.sev && <span className={`${styles.sevBadge} ${sevClass(result.sev)}`}>{sevIcon(result.sev)} {result.sev}</span>}
                <div className={styles.confBar}>
                  <div className={styles.confFill} style={{ width: `${(result.confidence*100).toFixed(1)}%` }} />
                </div>
                <div className={styles.confText}>{t('detect_confidence')} {(result.confidence*100).toFixed(1)}%</div>
                {result.confidence < 0.75 && (
                  <div className={`${styles.confWarn} ${styles.confWarnShow}`}>⚠️ AI isn't fully confident. Try retaking in better lighting.</div>
                )}
                {result.top3?.slice(1).filter(x=>x.confidence>0.03).length > 0 && (
                  <div className={styles.alsoSection}>
                    <div className={styles.alsoTitle}>🔍 Also possible</div>
                    {result.top3.slice(1).filter(x=>x.confidence>0.03).map(x => (
                      <div key={x.label} className={styles.alsoRow}>
                        <span className={styles.alsoName}>{x.label.replace(/___/g,' › ').replace(/_/g,' ')}</span>
                        <span className={styles.alsoConf}>{(x.confidence*100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.resultActions}>
                  <a href="http://127.0.0.1:8000/app/chatbot.html" className={styles.btnSecondary}>{t('detect_ask_doctor')}</a>
                  <button className={styles.btnSecondary} onClick={emailReport}>{t('detect_email')}</button>
                  <button className={styles.btnCopy} onClick={copyResult}>📋 Copy</button>
                  <button className={styles.btnSecondary} onClick={clearPreview}>{t('detect_new_scan')}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips card */}
      <div className={`${styles.card} ${styles.tipsCard}`}>
        <div className={styles.cardHeader}><div className={styles.cardTitle}>{t('detect_tips_title')}</div></div>
        <div className={styles.cardBody}>
          {[['☀️',t('tip1')],['🔍',t('tip2')],['📐',t('tip3')],['🌿',t('tip4')],['💧',t('tip5')]].map(([icon,text]) => (
            <div key={text} className={styles.tipItem}><span className={styles.tipIcon}>{icon}</span><span>{text}</span></div>
          ))}
        </div>
        <div className={styles.cardHeader} style={{ marginTop: 8 }}><div className={styles.cardTitle}>{t('detect_plants_title')}</div></div>
        <div className={styles.cardBody}>
          <div className={styles.plantTags}>
            {['🍅 Tomato','🌽 Corn','🍇 Grape','🍎 Apple','🥔 Potato','🫑 Pepper','🍑 Peach','🍓 Strawberry','🫘 Soybean','🍊 Orange','🫐 Blueberry','🍒 Cherry'].map(p => (
              <span key={p} className={styles.plantTag}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Profile Page ── */
function ProfilePage({ email, toast }) {
  const t = useT()
  const uname = localStorage.getItem('user_name') || 'User'
  const [name, setName] = useState(uname)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCurPw, setShowCurPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [lang, setLangState] = useState(localStorage.getItem('pg_lang') || 'en')

  const pwScore = v => {
    let s = 0
    if (v.length >= 8) s++
    if (/[A-Z]/.test(v)) s++
    if (/[0-9]/.test(v)) s++
    if (/[^A-Za-z0-9]/.test(v)) s++
    return s
  }
  const pwColors = ['', '#ef4444', '#f59e0b', '#10b981', '#059669']
  const pwLabels = ['', t('pw_weak'), t('pw_fair'), t('pw_good'), t('pw_strong')] // eslint-disable-line
  const score = pwScore(newPassword)

  const switchLang = l => { setLangState(l); localStorage.setItem('pg_lang', l); window.dispatchEvent(new Event('pg_lang_change')) }

  const save = async () => {
    if (!currentPassword) { setMsg({ text: t('profile_err_curpw'), type: 'error' }); return }
    if (!newUsername.trim() && !newPassword) { setMsg({ text: t('profile_err_nothing'), type: 'error' }); return }
    if (newPassword && newPassword.length < 8) { setMsg({ text: t('profile_err_short'), type: 'error' }); return }
    setLoading(true); setMsg({ text: '', type: '' })
    try {
      const form = new FormData()
      form.append('email', email)
      form.append('current_password', currentPassword)
      if (newUsername.trim()) form.append('new_username', newUsername.trim())
      if (newPassword) form.append('new_password', newPassword)
      const res = await fetch(`${API}/update-profile`, { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok) {
        if (data.username) { localStorage.setItem('user_name', data.username); setName(data.username) }
        setMsg({ text: '✓ Profile updated successfully!', type: 'success' })
        setNewUsername(''); setNewPassword(''); setCurrentPassword('')
        toast('Profile updated!', 'success')
      } else { setMsg({ text: data.detail || 'Update failed.', type: 'error' }) }
    } catch { setMsg({ text: 'Cannot reach server.', type: 'error' }) }
    setLoading(false)
  }

  const LANGS = [['en', '🇬🇧 English'], ['te', '🇮🇳 తెలుగు'], ['hi', '🇮🇳 हिंदी']]

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className={styles.card}>
        {/* Avatar header */}
        <div style={{ background: 'linear-gradient(135deg,#022c1a,#065f46)', padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#065f46,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#fff', border: '3px solid rgba(255,255,255,.2)' }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{name}</div>
          <div style={{ color: 'rgba(167,243,208,.7)', fontSize: '.82rem' }}>{email}</div>
        </div>

        <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Language */}
          <div>
            <div className={styles.cardTitle} style={{ marginBottom: 10 }}>{t('profile_lang')}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {LANGS.map(([l, label]) => (
                <button key={l} onClick={() => switchLang(l)}
                  style={{ flex: 1, padding: '9px 8px', borderRadius: 10, border: `1.5px solid ${lang === l ? '#10b981' : '#e2e8f0'}`, background: lang === l ? '#f0fdf4' : '#f8fafc', color: lang === l ? '#065f46' : '#64748b', fontWeight: lang === l ? 700 : 500, fontSize: '.8rem', cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

          {/* Change name */}
          <div>
            <div className={styles.cardTitle} style={{ marginBottom: 10 }}>{t('profile_name')}</div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', overflow: 'hidden' }}>
              <span style={{ padding: '0 12px', fontSize: '1rem' }}>👤</span>
              <input value={newUsername} onChange={e => setNewUsername(e.target.value)}
                placeholder={t('profile_name_ph')}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '12px 12px 12px 0', fontSize: '.9rem', color: '#0f172a', fontFamily: 'inherit' }} />
            </div>
          </div>

          {/* Change password */}
          <div>
            <div className={styles.cardTitle} style={{ marginBottom: 10 }}>{t('profile_newpw')} <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{t('profile_newpw_note')}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', overflow: 'hidden' }}>
              <span style={{ padding: '0 12px', fontSize: '1rem' }}>🔒</span>
              <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder={t('profile_newpw_ph')}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '12px 0', fontSize: '.9rem', color: '#0f172a', fontFamily: 'inherit' }} />
              <button onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', fontSize: '1rem' }}>{showPw ? '🙈' : '👁️'}</button>
            </div>
            {newPassword && (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 6 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? pwColors[score] : '#e2e8f0', transition: 'background .3s' }} />)}
                <span style={{ fontSize: '.7rem', fontWeight: 600, marginLeft: 6, color: pwColors[score] }}>{pwLabels[score]}</span>
              </div>
            )}
          </div>

          {/* Current password */}
          <div>
            <div className={styles.cardTitle} style={{ marginBottom: 10 }}>{t('profile_curpw')} <span style={{ color: '#dc2626', fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>{t('profile_curpw_required')}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', overflow: 'hidden' }}>
              <span style={{ padding: '0 12px', fontSize: '1rem' }}>🔑</span>
              <input type={showCurPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                placeholder={t('profile_curpw_ph')}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', padding: '12px 0', fontSize: '.9rem', color: '#0f172a', fontFamily: 'inherit' }} />
              <button onClick={() => setShowCurPw(v => !v)} style={{ background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', fontSize: '1rem' }}>{showCurPw ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {msg.text && (
            <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: '.82rem', fontWeight: 500, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#065f46' : '#dc2626', border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {msg.text}
            </div>
          )}

          <button onClick={save} disabled={loading}
            style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 12, fontSize: '.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit', transition: 'all .2s' }}>
            {loading ? t('profile_saving') : t('profile_save')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Grok AI Page ── */
function GeminiPage({ email, toast }) {
  const t = useT()
  const disease = localStorage.getItem('lastDetectedDisease') || ''
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey! 🤖 I'm <strong>Groq AI</strong>, powered by LLaMA 3.3. ${disease ? `I can see your last scan was <strong>${disease.replace(/___/g,' › ').replace(/_/g,' ')}</strong>. ` : ''}Ask me anything — plant care, treatments, or any general question!` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: q }])
    setLoading(true)
    const newHistory = [...history, { role: 'user', content: q }]
    try {
      const form = new FormData()
      form.append('question', q)
      form.append('history', JSON.stringify(newHistory.slice(-10)))
      const res = await fetch(`${API}/grok-chat`, { method: 'POST', body: form })
      const data = await res.json()
      const reply = data.reply || 'Sorry, I had trouble answering that.'
      const formatted = reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
      setMessages(m => [...m, { role: 'assistant', content: formatted }])
      setHistory([...newHistory, { role: 'assistant', content: reply }])
      if (data.source === 'error') toast('Grok API key not activated. Visit console.x.ai to activate.', 'error')
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ Could not reach the server. Make sure the backend is running.' }])
    }
    setLoading(false)
  }

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const QUICK = [
    ['🌿 Plant care tips', 'Give me general plant care tips'],
    ['💊 Fungicide guide', 'What fungicides work best for plant diseases?'],
    ['💧 Watering advice', 'How should I water my plants?'],
    ['🌱 Organic options', 'What are organic treatment options for plant diseases?'],
    ['🦠 Disease spread', 'How do plant diseases spread?'],
  ]

  return (
    <div className={styles.geminiLayout}>
      <div className={`${styles.card} ${styles.geminiCard}`}>
        <div className={styles.geminiHeader}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div className={styles.geminiAvatar}>✨</div>
            <div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:'.95rem' }}>Grok AI</div>
              <div style={{ color:'rgba(221,214,254,.6)', fontSize:'.72rem', display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#a78bfa', display:'inline-block', animation:'pipPulse 2s infinite' }} />
                Powered by Groq
              </div>
            </div>
            {disease && <div className={styles.geminiDiseaseBadge}>🌿 {disease.replace(/___/g,' › ').replace(/_/g,' ').slice(0,28)}</div>}
          </div>
        </div>
        <div className={styles.geminiMessages}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start', alignItems:'flex-start', gap:8 }}>
              {m.role === 'assistant' && <div className={styles.geminiAvatarSm}>✨</div>}
              <div className={m.role === 'user' ? styles.geminiUserBubble : styles.geminiBotBubble}
                dangerouslySetInnerHTML={{ __html: m.content }} />
              {m.role === 'user' && (
                <div className={styles.geminiUserAvatar}>{(localStorage.getItem('user_name')||'U').charAt(0).toUpperCase()}</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div className={styles.geminiAvatarSm}>✨</div>
              <div className={styles.geminiBotBubble}>
                <div style={{ display:'flex', gap:5 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#7c3aed', display:'inline-block', animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className={styles.geminiInputRow}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
            placeholder="Ask Grok anything…" disabled={loading} className={styles.geminiInput} />
          <button onClick={() => send()} disabled={loading || !input.trim()} className={styles.geminiSendBtn}>→</button>
        </div>
        <p className={styles.geminiNotice}>Responses are AI-generated by <strong>Groq · LLaMA 3.3</strong>. Verify critical advice with an agronomist.</p>
        <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}><div className={styles.cardTitle}>⚡ Quick Questions</div></div>
        <div className={styles.cardBody}>
          {QUICK.map(([label, q]) => (
            <button key={q} onClick={() => send(q)} disabled={loading} className={styles.geminiQuickBtn}>{label}</button>
          ))}
        </div>
        <div className={styles.cardHeader} style={{marginTop:8}}><div className={styles.cardTitle}>💡 About</div></div>
        <div className={styles.cardBody}>
          <p style={{fontSize:'.78rem',color:'#64748b',lineHeight:1.6}}>Free-form chat powered by <strong>Groq · LLaMA 3.3 70B</strong>. Truly free, no credit card needed!</p>
        </div>
      </div>
    </div>
  )
}

/* ── Chat Page (Plant Doctor AI) ── */
function ChatPage({ email, toast }) {
  const t = useT()
  const disease = localStorage.getItem('lastDetectedDisease') || ''
  const welcomeMsg = disease
    ? t('chat_welcome_disease').replace('{disease}', disease.replace(/___/g,' › ').replace(/_/g,' '))
    : t('chat_welcome')
  const [messages, setMessages] = useState([{ role: 'assistant', content: welcomeMsg }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const QUICK = [
    [t('chat_btn_symptoms'), t('chat_q_symptoms')],
    [t('chat_btn_treatment'), t('chat_q_treatment')],
    [t('chat_btn_prevention'), t('chat_q_prevention')],
    [t('chat_btn_severity'), t('chat_q_severity')],
    [t('chat_btn_cause'), t('chat_q_cause')],
    [t('chat_btn_organic'), t('chat_q_organic')],
  ]

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    const userMsg = { role: 'user', content: q }
    setMessages(m => [...m, userMsg])
    setLoading(true)
    const newHistory = [...history, { role: 'user', content: q }]
    try {
      const form = new FormData()
      form.append('disease', disease || 'unknown')
      form.append('question', q)
      form.append('lang', localStorage.getItem('pg_lang') || 'en')
      form.append('history', JSON.stringify(newHistory.slice(-6)))
      const res = await fetch(`${API}/chat`, { method: 'POST', body: form })
      const data = await res.json()
      const reply = data.reply || 'Sorry, I had trouble answering that.'
      setMessages(m => [...m, { role: 'assistant', content: reply }])
      setHistory([...newHistory, { role: 'assistant', content: reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I\'m having trouble right now. Please try again.' }])
    }
    setLoading(false)
  }

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:24, alignItems:'start' }}>
      {/* Chat card */}
      <div className={styles.card} style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 220px)', minHeight:480 }}>
        {/* Header */}
        <div style={{ padding:'18px 24px', background:'linear-gradient(145deg,#011a0a,#022c1a,#064e3b)', borderRadius:'20px 20px 0 0', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'rgba(16,185,129,.2)', border:'1px solid rgba(16,185,129,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>🤖</div>
            <div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:'.95rem' }}>Plant Doctor AI</div>
              <div style={{ color:'rgba(167,243,208,.6)', fontSize:'.72rem', display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pipPulse 2s infinite' }} />
                Powered by Gemini
              </div>
            </div>
            {disease && <div style={{ marginLeft:'auto', background:'rgba(16,185,129,.15)', border:'1px solid rgba(16,185,129,.25)', borderRadius:999, padding:'4px 12px', fontSize:'.72rem', color:'#6ee7b7', fontWeight:600 }}>🌿 {disease.replace(/___/g,' › ').replace(/_/g,' ').slice(0,30)}</div>}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && (
                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#065f46,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', flexShrink:0, marginRight:8, marginTop:2 }}>🤖</div>
              )}
              <div style={{
                maxWidth:'75%', padding:'11px 16px', borderRadius: m.role==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role==='user' ? 'linear-gradient(135deg,#065f46,#059669)' : '#f8fafc',
                color: m.role==='user' ? '#fff' : '#0f172a',
                fontSize:'.875rem', lineHeight:1.6,
                border: m.role==='assistant' ? '1px solid #e2e8f0' : 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                animation: 'msgIn .3s cubic-bezier(.34,1.56,.64,1) both'
              }} dangerouslySetInnerHTML={{ __html: m.content }} />
              {m.role === 'user' && (
                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#065f46,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:800, color:'#fff', flexShrink:0, marginLeft:8, marginTop:2 }}>
                  {(localStorage.getItem('user_name')||'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#065f46,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem' }}>🤖</div>
              <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'18px 18px 18px 4px', padding:'12px 16px', display:'flex', gap:5 }}>
                {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', flexShrink:0 }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <textarea
              value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
              placeholder={t('chat_placeholder')}
              rows={1} disabled={loading}
              style={{ flex:1, border:'1.5px solid #e2e8f0', borderRadius:14, padding:'11px 14px', fontSize:'.875rem', fontFamily:'inherit', resize:'none', outline:'none', transition:'border-color .2s, box-shadow .2s', lineHeight:1.5 }}
              onFocus={e => { e.target.style.borderColor='#10b981'; e.target.style.boxShadow='0 0 0 4px rgba(16,185,129,.1)' }}
              onBlur={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none' }}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#065f46,#059669)', border:'none', color:'#fff', fontSize:'1.1rem', cursor:'pointer', flexShrink:0, transition:'all .2s', opacity: loading||!input.trim() ? .5 : 1 }}>
              →
            </button>
          </div>
        </div>
        <style>{`
          @keyframes msgIn{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
          @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
          @keyframes pipPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}
        `}</style>
      </div>

      {/* Quick questions */}
      <div className={styles.card}>
        <div className={styles.cardHeader}><div className={styles.cardTitle}>⚡ Quick Questions</div></div>
        <div className={styles.cardBody}>
          {QUICK.map(([label, q]) => (
            <button key={q} onClick={() => send(q)} disabled={loading}
              style={{ width:'100%', textAlign:'left', padding:'10px 14px', marginBottom:8, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, fontSize:'.82rem', fontWeight:600, color:'#065f46', cursor:'pointer', transition:'all .2s', fontFamily:'inherit' }}
              onMouseEnter={e => { e.target.style.background='#f0fdf4'; e.target.style.borderColor='#10b981' }}
              onMouseLeave={e => { e.target.style.background='#f8fafc'; e.target.style.borderColor='#e2e8f0' }}
            >{label}</button>
          ))}
        </div>
        <div className={styles.cardHeader} style={{marginTop:8}}><div className={styles.cardTitle}>💡 Tips</div></div>
        <div className={styles.cardBody}>
          <p style={{fontSize:'.78rem',color:'#64748b',lineHeight:1.6}} dangerouslySetInnerHTML={{ __html: t('chat_tips_body') }} />
        </div>
      </div>
    </div>
  )
}


function HistoryPage({ email, toast }) {
  const t = useT()
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/history?email=${encodeURIComponent(email)}&page=${p}&per_page=10`)
      const d = await res.json()
      setData(d); setPage(p)
    } catch {}
    setLoading(false)
  }, [email])

  useEffect(() => { load(1) }, [load])

  const del = async ts => {
    if (!confirm(t('history_delete_confirm'))) return
    const form = new FormData()
    form.append('email', email); form.append('timestamp', ts)
    await fetch(`${API}/history/delete`, { method: 'DELETE', body: form })
    toast('Record deleted', 'info'); load(page)
  }

  const exportCsv = async () => {
    const res = await fetch(`${API}/history?email=${encodeURIComponent(email)}&page=1&per_page=1000`)
    const d = await res.json()
    const rows = [['Disease','Filename','Confidence','Date']]
    d.history.forEach(h => rows.push([h.prediction.replace(/_/g,' '),h.filename||'',h.confidence?(h.confidence*100).toFixed(1)+'%':'',new Date(h.timestamp).toLocaleString()]))
    const csv = rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download='plantguard_history.csv'; a.click()
    toast('CSV exported!', 'success')
  }

  if (loading) return <div className={styles.card}><div className={styles.cardBody}><Skeleton /></div></div>
  if (!data?.history?.length) return <div className={styles.card}><div className={styles.cardBody}><p className={styles.emptyMsg}>{t('history_empty')}</p></div></div>

  const totalPages = Math.ceil(data.total / 10)
  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.toolbar}>
          <button className={styles.btnExport} onClick={exportCsv}>{t('history_export')}</button>
        </div>
        {data.history.map(h => (
          <div key={h.timestamp} className={styles.histRow}>
            <div style={{ flex:1, minWidth:0 }}>
              <div className={styles.histDisease}>{h.prediction.replace(/_/g,' ')}</div>
              <div className={styles.histMeta}>{h.filename||''} · {new Date(h.timestamp).toLocaleString()}</div>
            </div>
            <div className={styles.histActions}>
              <span className={h.prediction.toLowerCase().includes('healthy') ? styles.sevNone : styles.sevHigh}>
                {h.prediction.toLowerCase().includes('healthy') ? t('history_healthy') : t('history_diseased')}
              </span>
              {h.confidence && <span className={styles.histConf}>{(h.confidence*100).toFixed(1)}%</span>}
              <button className={styles.btnDel} onClick={() => del(h.timestamp)}>{t('history_delete')}</button>
            </div>
          </div>
        ))}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pgBtn} disabled={page<=1} onClick={() => load(page-1)}>← Prev</button>
            <span className={styles.pgInfo}>Page {page} / {totalPages}</span>
            <button className={styles.pgBtn} disabled={page>=totalPages} onClick={() => load(page+1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Stats Page ── */
function StatsPage({ email }) {
  const t = useT()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    (async () => {
      try {
        const [sRes, hRes] = await Promise.all([
          fetch(`${API}/stats?email=${encodeURIComponent(email)}`),
          fetch(`${API}/history?email=${encodeURIComponent(email)}&page=1&per_page=1000`)
        ])
        const s = await sRes.json()
        const h = await hRes.json()
        const days = new Set((h.history||[]).map(x => new Date(x.timestamp).toDateString()))
        setData({ ...s, streak: days.size })
      } catch { setError(true) }
      setLoading(false)
    })()
  }, [email])

  // Init chart after data is set AND canvas is in DOM
  useEffect(() => {
    if (!data?.trend?.length) return
    const timer = setTimeout(() => {
      if (!chartRef.current) return
      if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null }
      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: data.trend.map(([d]) => d.slice(5)),
          datasets: [{ label:'Scans', data: data.trend.map(([,v])=>v), backgroundColor:'rgba(16,185,129,.7)', borderColor:'#059669', borderWidth:1, borderRadius:4 }]
        },
        options: { responsive:true, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true,ticks:{stepSize:1,color:'#64748b'},grid:{color:'rgba(0,0,0,.05)'}}, x:{ticks:{color:'#64748b'},grid:{display:false}} } }
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [data])

  if (loading) return <div className={styles.card}><div className={styles.cardBody}><Skeleton stat /></div></div>
  if (error) return <div className={styles.card}><div className={styles.cardBody}><p className={styles.emptyMsg} style={{color:'#dc2626'}}>Failed to load stats.</p></div></div>
  if (!data) return null

  const hp = data.total ? Math.round(data.healthy/data.total*100) : 0
  const dp = data.total ? Math.round(data.diseased/data.total*100) : 0

  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.streakBanner}>
          <div className={styles.streakFire}>🔥</div>
          <div><div className={styles.streakNum}>{data.streak}</div><div className={styles.streakLabel}>{data.streak!==1 ? t('stats_streak_labels') : t('stats_streak_label')}</div></div>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}><div className={styles.statNum}>{data.total}</div><div className={styles.statLabel}>{t('stats_total')}</div></div>
          <div className={styles.statCard}><div className={styles.statNum} style={{color:'#059669'}}>{data.healthy}</div><div className={styles.statLabel}>{t('stats_healthy')} ({hp}%)</div></div>
          <div className={styles.statCard}><div className={styles.statNum} style={{color:'#dc2626'}}>{data.diseased}</div><div className={styles.statLabel}>{t('stats_diseased')} ({dp}%)</div></div>
        </div>
        {data.trend?.length >= 2 && (
          <>
            <div className={styles.sectionLabel}>{t('stats_trend')}</div>
            <div style={{ background:'#f8fafc', borderRadius:12, padding:16, border:'1px solid #e2e8f0', marginBottom:20 }}>
              <canvas ref={chartRef} height={120} />
            </div>
          </>
        )}
        <div className={styles.sectionLabel}>{t('stats_top')}</div>
        {data.top_diseases?.length ? data.top_diseases.map((item,i) => (
          <div key={item[0]} className={styles.topRow}>
            <span className={styles.topRank}>{i+1}</span>
            <span style={{flex:1,margin:'0 12px',fontWeight:600,color:'#0f172a'}}>{item[0].replace(/___/g,' › ').replace(/_/g,' ')}</span>
            <span style={{color:'#64748b',fontSize:'.8rem'}}>{item[1]} {item[1]>1 ? t('stats_scans') : t('stats_scan')}</span>
          </div>
        )) : <p className={styles.emptyMsg} style={{padding:'16px 0'}}>{t('stats_no_disease')}</p>}
      </div>
    </div>
  )
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const navigate = useNavigate()
  const email = localStorage.getItem('user_email')
  const uname = localStorage.getItem('user_name')

  useEffect(() => { if (!email) navigate('/login') }, [email, navigate])

  const [activePage, setActivePage] = useState('detect')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(localStorage.getItem('pg_dark') === '1')
  const [lang, setLang] = useState(localStorage.getItem('pg_lang') || 'en')
  const { toasts, toast } = useToast()

  const switchPage = p => { setActivePage(p); setSidebarOpen(false) }

  const toggleDark = () => {
    const next = !dark; setDark(next)
    localStorage.setItem('pg_dark', next ? '1' : '0')
    document.body.classList.toggle('dark-mode', next)
  }

  const switchLang = l => { setLang(l); localStorage.setItem('pg_lang', l); window.dispatchEvent(new Event('pg_lang_change')) }
  const t = useT()

  const logout = () => {
    localStorage.removeItem('user_email'); localStorage.removeItem('user_name')
    navigate('/login')
  }

  if (!email) return null

  const initial = uname ? uname.charAt(0).toUpperCase() : '?'
  const first   = uname ? uname.split(' ')[0] : 'User'

  return (
    <div className={styles.page}>
      <AnimatedBg />
      <ToastContainer toasts={toasts} />

      {/* Sidebar overlay */}
      <div className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayShow : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarLogo}>🌿</div>
          <div><div className={styles.sidebarBrandName}>PlantGuard AI</div><div className={styles.sidebarBrandSub}>AI Platform</div></div>
        </div>

        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>{initial}</div>
          <div><div className={styles.sidebarUserName}>Hi, {first}</div><div className={styles.sidebarUserRole}>Plant Guardian</div></div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.sidebarNavLabel}>Main</div>
          {[['detect','🔬','Detector'],['history','📋','History'],['stats','📊','Analytics']].map(([id,icon,label]) => (
            <button key={id} className={`${styles.sidebarLink} ${activePage===id ? styles.sidebarLinkActive : ''}`} onClick={() => switchPage(id)}>
              <span className={styles.sidebarLinkIcon}>{icon}</span>
              <span>{label}</span>
              {activePage===id && <span className={styles.pip} />}
            </button>
          ))}
          <div className={styles.sidebarNavLabel} style={{marginTop:8}}>Tools</div>
          {[['chatbot','🤖','Plant Doctor'],['gemini','🤖','Grok AI'],['profile','👤','Profile']].map(([id,icon,label]) => (
            <button key={id} className={`${styles.sidebarLink} ${activePage===id ? styles.sidebarLinkActive : ''}`} onClick={() => switchPage(id)}>
              <span className={styles.sidebarLinkIcon}>{icon}</span>
              <span>{label}</span>
              {activePage===id && <span className={styles.pip} />}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarLang}>
            {[['en','EN'],['te','తె'],['hi','हि']].map(([l,label]) => (
              <button key={l} className={`${styles.langBtn} ${lang===l ? styles.langBtnActive : ''}`} onClick={() => switchLang(l)}>{label}</button>
            ))}
          </div>
          <button className={styles.logoutBtn} onClick={logout}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* Topbar */}
      <header className={styles.topbar}>
        <button className={styles.hamburger} onClick={() => setSidebarOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <div className={styles.topbarTitle}>{PAGE_TITLES[activePage]}</div>
        <div className={styles.topbarRight}>
          <button className={styles.darkBtn} onClick={toggleDark}>{dark ? '☀️' : '🌙'}</button>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.15)',borderRadius:999,padding:'5px 12px 5px 6px'}}>
            <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#065f46,#10b981)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.75rem',fontWeight:800,color:'#fff'}}>{initial}</div>
            <span style={{color:'rgba(167,243,208,.8)',fontSize:'.82rem',fontWeight:600}}>Hi, {first}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        {/* Page header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageEyebrow}><span className={styles.dot} />
            {{detect:t('page_detect_eye'),history:t('page_history_eye'),stats:t('page_stats_eye'),chatbot:t('page_chatbot_eye'),gemini:t('page_gemini_eye'),profile:t('page_profile_eye')}[activePage]}
          </div>
          <h1 className={styles.pageTitle}>
            {{detect:t('page_detect_title'),history:t('page_history_title'),stats:t('page_stats_title'),chatbot:t('page_chatbot_title'),gemini:t('page_gemini_title'),profile:t('page_profile_title')}[activePage]}
          </h1>
          <p className={styles.pageSub}>
            {{detect:t('page_detect_sub'),history:t('page_history_sub'),stats:t('page_stats_sub'),chatbot:t('page_chatbot_sub'),gemini:t('page_gemini_sub'),profile:t('page_profile_sub')}[activePage]}
          </p>
        </div>

        <div className={styles.dashPage}>
          {activePage === 'detect'  && <DetectPage  email={email} toast={toast} onSwitchToChat={() => {}} />}
          {activePage === 'history' && <HistoryPage email={email} toast={toast} />}
          {activePage === 'stats'   && <StatsPage   email={email} />}
          {activePage === 'chatbot' && <ChatPage    email={email} toast={toast} />}
          {activePage === 'gemini'  && <GeminiPage  email={email} toast={toast} />}
          {activePage === 'profile' && <ProfilePage email={email} toast={toast} />}
        </div>
      </main>
    </div>
  )
}
