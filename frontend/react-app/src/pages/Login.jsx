import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AnimatedBg from '../components/AnimatedBg'
import styles from './Auth.module.css'

const API = 'http://127.0.0.1:8000'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showPw, setShowPw] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg({ text: '', type: '' })
    try {
      const form = new FormData()
      form.append('email', email.trim())
      form.append('password', password)
      const res = await fetch(`${API}/login`, { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('user_email', data.email)
        if (data.username) localStorage.setItem('user_name', data.username)
        setMsg({ text: '✓ Login successful! Redirecting…', type: 'success' })
        setTimeout(() => navigate('/dashboard'), 900)
      } else {
        setMsg({ text: data.detail || 'Invalid credentials.', type: 'error' })
      }
    } catch {
      setMsg({ text: 'Cannot reach server. Is the backend running?', type: 'error' })
    }
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
              <span className={styles.panelLogoIcon}>🌿</span>
              <span className={styles.panelLogoText}>PlantGuard AI</span>
            </div>
            <h2 className={styles.panelTitle}>Protect your crops with <em>AI precision</em></h2>
            <p className={styles.panelDesc}>Advanced deep learning that detects plant diseases instantly — keeping your harvest healthy and yields high.</p>
            <div className={styles.panelStats}>
              {[['95%','Accuracy'],['38','Diseases'],['<3s','Results']].map(([n,l]) => (
                <div key={l} className={styles.panelStat}>
                  <div className={styles.panelStatNum}>{n}</div>
                  <div className={styles.panelStatLabel}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.panelFeatures}>
            {[['🔬','AI-powered disease detection & diagnosis'],['🤖','Plant Doctor AI for treatment guidance'],['📊','Full prediction history & analytics'],['🔐','Secure, private & always free']].map(([icon, text]) => (
              <div key={text} className={styles.panelFeature}>
                <span className={styles.panelFeatureIcon}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <div className={styles.eyebrow}>🌱 Welcome back</div>
            <h1 className={styles.formTitle}>Sign in to your account</h1>
            <p className={styles.formSub}>Enter your credentials to access your plant health dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field} style={{ animationDelay: '.1s' }}>
              <label>Email address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>✉️</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
              </div>
            </div>
            <div className={styles.field} style={{ animationDelay: '.18s' }}>
              <label>Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔒</span>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" />
                <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>{showPw ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {msg.text && <div className={`${styles.msg} ${msg.type === 'success' ? styles.msgSuccess : styles.msgError}`}>{msg.text}</div>}

            <button type="submit" className={styles.btnPrimary} disabled={loading} style={{ animationDelay: '.26s' }}>
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className={styles.divider}><span>or</span></div>
          <div className={styles.formFooter}>
            <span>Don't have an account?</span>{' '}
            <Link to="/signup">Create one free →</Link>
          </div>
          <div className={styles.backLink}>
            <Link to="/">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
