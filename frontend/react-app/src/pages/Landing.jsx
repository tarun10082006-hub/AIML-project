import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedBg from '../components/AnimatedBg'
import styles from './Landing.module.css'

const FEATURES = [
  { icon: '🔬', title: 'AI Disease Detection', desc: 'Upload a leaf photo and get instant diagnosis powered by deep learning trained on 38 plant diseases.' },
  { icon: '🤖', title: 'Plant Doctor AI', desc: 'Chat with our AI doctor for treatment plans, prevention tips, and organic remedies in your language.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track your scan history, view disease trends, and export detailed PDF reports for your records.' },
  { icon: '⚡', title: 'Results in 3 Seconds', desc: 'Our optimized model delivers accurate predictions in under 3 seconds — even on slow connections.' },
  { icon: '🌍', title: 'Multi-Language', desc: 'Full support for English, Telugu, and Hindi so every farmer can use PlantGuard in their language.' },
  { icon: '🔐', title: 'Private & Free', desc: 'Your data stays yours. No ads, no tracking, no credit card — free forever for every farmer.' },
]

const STATS = [
  { num: '95%', label: 'Accuracy' },
  { num: '38', label: 'Diseases' },
  { num: '<3s', label: 'Results' },
  { num: '10K+', label: 'Users' },
]

const STEPS = [
  { icon: '📸', step: '01', title: 'Snap a Photo', desc: 'Take a clear photo of the affected leaf using your phone or upload from gallery.' },
  { icon: '🧠', step: '02', title: 'AI Analyzes', desc: 'Our deep learning model scans the image and identifies the disease with confidence score.' },
  { icon: '💊', step: '03', title: 'Get Treatment', desc: 'Receive a full diagnosis report with treatment plan, prevention tips, and severity rating.' },
]

const TESTIMONIALS = [
  { name: 'Ravi Kumar', role: 'Tomato Farmer, Andhra Pradesh', text: 'PlantGuard saved my entire tomato crop. Detected early blight before it spread. Incredible tool!', avatar: 'R' },
  { name: 'Priya Sharma', role: 'Home Gardener, Delhi', text: 'The Plant Doctor AI explained everything in Hindi. So easy to use and completely free!', avatar: 'P' },
  { name: 'Suresh Reddy', role: 'Chilli Farmer, Telangana', text: 'I use it every week to check my plants. The history feature helps me track disease patterns.', avatar: 'S' },
]

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={styles.page}>
      <AnimatedBg />

      {/* NAV */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <span className={styles.navLogo}>🌿</span>
            <span className={styles.navName}>PlantGuard AI</span>
          </div>
          <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How it Works</a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)}>Reviews</a>
            <button className={styles.navLogin} onClick={() => navigate('/login')}>Sign In</button>
            <button className={styles.navCta} onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>
          <button className={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={menuOpen ? styles.hOpen : ''} />
            <span className={menuOpen ? styles.hOpen : ''} />
            <span className={menuOpen ? styles.hOpen : ''} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBadge} style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(-20px)', transition: 'all 0.6s ease 0.1s' }}>
          <span className={styles.heroBadgeDot} />
          <span>AI-Powered Plant Health Platform</span>
        </div>
        <h1 className={styles.heroTitle} style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease 0.2s' }}>
          Protect Your Crops<br />
          with <em className={styles.heroEm}>AI Precision</em>
        </h1>
        <p className={styles.heroSub} style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease 0.35s' }}>
          Detect plant diseases instantly from a single photo. Get treatment plans, prevention tips, and expert AI guidance — completely free for every farmer.
        </p>
        <div className={styles.heroCtas} style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease 0.5s' }}>
          <button className={styles.ctaPrimary} onClick={() => navigate('/signup')}>
            🌱 Start for Free — No Card Needed
          </button>
          <button className={styles.ctaSecondary} onClick={() => navigate('/login')}>
            Sign In →
          </button>
        </div>
        <div className={styles.heroStats} style={{ opacity: heroVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.7s' }}>
          {STATS.map(s => (
            <div key={s.label} className={styles.heroStat}>
              <div className={styles.heroStatNum}>{s.num}</div>
              <div className={styles.heroStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className={styles.heroScroll} style={{ opacity: heroVisible ? 1 : 0, transition: 'opacity 1s ease 1.2s' }}>
          <div className={styles.heroScrollDot} />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={styles.section}>
        <FadeIn>
          <div className={styles.sectionLabel}>✦ Everything You Need</div>
          <h2 className={styles.sectionTitle}>Built for Farmers,<br />Powered by AI</h2>
          <p className={styles.sectionSub}>From instant disease detection to multilingual AI guidance — PlantGuard has every tool to keep your harvest healthy.</p>
        </FadeIn>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className={styles.sectionAlt}>
        <FadeIn>
          <div className={styles.sectionLabel}>✦ Simple Process</div>
          <h2 className={styles.sectionTitle}>Diagnose in 3 Steps</h2>
          <p className={styles.sectionSub}>No expertise needed. Just snap, upload, and get your diagnosis in seconds.</p>
        </FadeIn>
        <div className={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <FadeIn key={s.step} delay={i * 0.15}>
              <div className={styles.stepCard}>
                <div className={styles.stepNum}>{s.step}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
                {i < STEPS.length - 1 && <div className={styles.stepArrow}>→</div>}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* DISEASES MARQUEE */}
      <section className={styles.marqueeSection}>
        <div className={styles.marqueeTrack}>
          {['🍅 Tomato', '🌽 Corn', '🍇 Grape', '🍎 Apple', '🥔 Potato', '🫑 Pepper', '🍑 Peach', '🍓 Strawberry', '🫘 Soybean', '🍊 Orange', '🫐 Blueberry', '🍒 Cherry', '🌿 Squash', '🫐 Raspberry', '🌱 Chilli'].concat(
            ['🍅 Tomato', '🌽 Corn', '🍇 Grape', '🍎 Apple', '🥔 Potato', '🫑 Pepper', '🍑 Peach', '🍓 Strawberry', '🫘 Soybean', '🍊 Orange', '🫐 Blueberry', '🍒 Cherry', '🌿 Squash', '🫐 Raspberry', '🌱 Chilli']
          ).map((item, i) => (
            <span key={i} className={styles.marqueeItem}>{item}</span>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className={styles.section}>
        <FadeIn>
          <div className={styles.sectionLabel}>✦ Trusted by Farmers</div>
          <h2 className={styles.sectionTitle}>What Farmers Say</h2>
        </FadeIn>
        <div className={styles.testimonialsGrid}>
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>★★★★★</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className={styles.ctaBanner}>
        <FadeIn>
          <div className={styles.ctaBannerInner}>
            <div className={styles.ctaBannerGlow} />
            <div className={styles.sectionLabel} style={{ color: '#a7f3d0' }}>✦ Free Forever</div>
            <h2 className={styles.ctaBannerTitle}>Ready to Protect<br />Your Plants?</h2>
            <p className={styles.ctaBannerSub}>Join 10,000+ farmers already using PlantGuard AI. No credit card, no subscription — just results.</p>
            <div className={styles.heroCtas}>
              <button className={styles.ctaPrimary} onClick={() => navigate('/signup')}>
                🌱 Create Free Account
              </button>
              <button className={styles.ctaSecondary} onClick={() => navigate('/login')}>
                Already have an account →
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span>🌿</span>
            <span>PlantGuard AI</span>
          </div>
          <p className={styles.footerText}>AI-powered plant disease detection for every farmer. Free forever.</p>
          <div className={styles.footerLinks}>
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <button onClick={() => navigate('/login')}>Sign In</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
          <p className={styles.footerCopy}>© 2025 PlantGuard AI. Built with ❤️ for farmers.</p>
        </div>
      </footer>
    </div>
  )
}
