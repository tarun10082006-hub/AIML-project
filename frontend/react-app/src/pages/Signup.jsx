import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AnimatedBg from '../components/AnimatedBg'
import styles from './Auth.module.css'

const API = 'http://127.0.0.1:8000'

function PwStrength({ value }) {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#10b981', '#059669']
  return value ? (
    <div className={styles.pwStrength}>
      {[1,2,3,4].map(i => (
        <div key={i} className={styles.pwBar} style={{ background: i <= score ? colors[score] : '#e2e8f0' }} />
      ))}
      <span style={{ color: colors[score], fontSize: '.72rem', fontWeight: 600, marginLeft: 6 }}>{labels[score]}</span>
    </div>
  ) : null
}

function OtpInput({ onComplete }) {
  const refs = useRef([])
  const [vals, setVals] = useState(['','','','','',''])

  const update = (i, v) => {
    const next = [...vals]; next[i] = v.replace(/\D/g,'').slice(-1); setVals(next)
    if (v && i < 5) refs.current[i+1]?.focus()
    const full = next.join('')
    if (full.length === 6) onComplete(full)
  }
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) { refs.current[i-1]?.focus() }
  }
  const onPaste = (e) => {
    e.preventDefault()
    const text = (e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6)
    const next = text.split('').concat(Array(6).fill('')).slice(0,6)
    setVals(next)
    refs.current[Math.min(text.length, 5)]?.focus()
    if (text.length === 6) onComplete(text)
  }

  return (
    <div className={styles.otpBoxes}>
      {vals.map((v, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={v}
          className={`${styles.otpDigit} ${v ? styles.otpFilled : ''}`}
          onChange={e => update(i, e.target.value)}
          onKeyDown={e => onKey(i, e)}
          onPaste={onPaste}
        />
      ))}
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [msg1, setMsg1] = useState({ text: '', type: '' })
  const [msg2, setMsg2] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [visible, setVisible] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const startTimer = () => {
    setTimer(120)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0 } return t - 1 })
    }, 1000)
  }

  const sendOtp = async () => {
    if (!name.trim()) { setMsg1({ text: 'Please enter your full name.', type: 'error' }); return }
    if (!email.trim()) { setMsg1({ text: 'Please enter your email.', type: 'error' }); return }
    if (password.length < 8) { setMsg1({ text: 'Password must be at least 8 characters.', type: 'error' }); return }
    setLoading(true); setMsg1({ text: '', type: '' })
    try {
      const form = new FormData(); form.append('email', email.trim())
      const res = await fetch(`${API}/send-otp`, { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok) { setStep(2); startTimer() }
      else setMsg1({ text: data.detail || 'Failed to send OTP.', type: 'error' })
    } catch { setMsg1({ text: 'Cannot reach server. Is the backend running?', type: 'error' }) }
    setLoading(false)
  }

  const resendOtp = async () => {
    setLoading(true)
    try {
      const form = new FormData(); form.append('email', email.trim())
      const res = await fetch(`${API}/send-otp`, { method: 'POST', body: form })
      if (res.ok) { setMsg2({ text: '✓ OTP resent to your email.', type: 'success' }); startTimer() }
      else setMsg2({ text: 'Failed to resend OTP.', type: 'error' })
    } catch { setMsg2({ text: 'Cannot reach server.', type: 'error' }) }
    setLoading(false)
  }

  const verify = async () => {
    if (otp.length < 6) { setMsg2({ text: 'Please enter the complete 6-digit OTP.', type: 'error' }); return }
    setLoading(true); setMsg2({ text: '', type: '' })
    try {
      const form = new FormData()
      form.append('username', name.trim())
      form.append('email', email.trim())
      form.append('password', password)
      form.append('otp', otp)
      const res = await fetch(`${API}/signup`, { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok) {
        setMsg2({ text: '✓ Account created! Redirecting…', type: 'success' })
        clearInterval(timerRef.current)
        setTimeout(() => navigate('/login'), 1400)
      } else {
        setMsg2({ text: data.detail || 'Invalid OTP. Please try again.', type: 'error' })
      }
    } catch { setMsg2({ text: 'Cannot reach server.', type: 'error' }) }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <AnimatedBg />
      <div className={styles.wrapper} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.6s cubic-bezier(.16,1,.3,1)' }}>

        {/* LEFT PANEL */}
        <div className={styles.panel}>
          <div className={styles.panelTop}>
            <div className={styles.panelLogo}>
              <span className={styles.panelLogoIcon}>🌱</span>
              <span className={styles.panelLogoText}>PlantGuard AI</span>
            </div>
            <h2 className={styles.panelTitle}>Start protecting your plants <em>today</em></h2>
            <p className={styles.panelDesc}>Join thousands of farmers and gardeners who trust PlantGuard AI to keep their plants healthy.</p>
            <div className={styles.panelStats}>
              {[['10K+','Users'],['50K+','Scans'],['Free','Forever']].map(([n,l]) => (
                <div key={l} className={styles.panelStat}>
                  <div className={styles.panelStatNum}>{n}</div>
                  <div className={styles.panelStatLabel}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.panelFeatures}>
            {[['🆓','Completely free — no credit card needed'],['⚡','Instant AI diagnosis in under 3 seconds'],['💬','Plant Doctor AI chatbot included'],['🔐','Your data is private & secure']].map(([icon, text]) => (
              <div key={text} className={styles.panelFeature}>
                <span className={styles.panelFeatureIcon}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className={styles.formPanel}>
          {/* Step indicator */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${step >= 1 ? (step > 1 ? styles.stepDone : styles.stepActive) : styles.stepPending}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <div className={`${styles.stepLine} ${step > 1 ? styles.stepLineDone : ''}`} />
            <div className={`${styles.stepDot} ${step === 2 ? styles.stepActive : styles.stepPending}`}>2</div>
          </div>

          {step === 1 ? (
            <>
              <div className={styles.formHeader}>
                <div className={styles.eyebrow}>🌿 Get started free</div>
                <h1 className={styles.formTitle}>Create your account</h1>
                <p className={styles.formSub}>Set up your PlantGuard AI account in under a minute</p>
              </div>
              <div className={styles.form}>
                <div className={styles.field} style={{ animationDelay: '.08s' }}>
                  <label>Full name</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>👤</span>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" autoComplete="name" />
                  </div>
                </div>
                <div className={styles.field} style={{ animationDelay: '.15s' }}>
                  <label>Email address</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>✉️</span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </div>
                </div>
                <div className={styles.field} style={{ animationDelay: '.22s' }}>
                  <label>Password</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" />
                    <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>{showPw ? '🙈' : '👁️'}</button>
                  </div>
                  <PwStrength value={password} />
                </div>
                {msg1.text && <div className={`${styles.msg} ${msg1.type === 'success' ? styles.msgSuccess : styles.msgError}`}>{msg1.text}</div>}
                <button className={styles.btnPrimary} onClick={sendOtp} disabled={loading} style={{ animationDelay: '.3s' }}>
                  {loading ? <span className={styles.spinner} /> : null}
                  {loading ? 'Sending…' : 'Send OTP →'}
                </button>
              </div>
              <div className={styles.divider}><span>or</span></div>
              <div className={styles.formFooter}>
                <span>Already have an account?</span>{' '}
                <Link to="/login">Sign in →</Link>
              </div>
            </>
          ) : (
            <>
              <div className={styles.formHeader}>
                <div className={styles.eyebrow}>🔑 Verify your email</div>
                <h1 className={styles.formTitle}>Enter OTP</h1>
                <p className={styles.formSub}>We sent a 6-digit code to <strong style={{ color: '#059669' }}>{email}</strong></p>
              </div>
              <OtpInput onComplete={setOtp} />
              <div className={styles.resendRow}>
                {timer > 0
                  ? <span>Resend OTP in <strong>{timer}s</strong></span>
                  : <button className={styles.resendBtn} onClick={resendOtp} disabled={loading}>Resend OTP</button>
                }
              </div>
              {msg2.text && <div className={`${styles.msg} ${msg2.type === 'success' ? styles.msgSuccess : styles.msgError}`} style={{ marginTop: 12 }}>{msg2.text}</div>}
              <button className={styles.btnPrimary} onClick={verify} disabled={loading} style={{ marginTop: 20 }}>
                {loading ? <span className={styles.spinner} /> : null}
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button className={styles.backBtn} onClick={() => { setStep(1); setMsg2({ text: '', type: '' }) }}>← Back</button>
              </div>
            </>
          )}
          <div className={styles.backLink}>
            <Link to="/">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
