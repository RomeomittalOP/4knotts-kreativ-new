import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useNavigate } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const taglineRef = useRef(null)
  const ctaRef = useRef(null)
  const mascotRef = useRef(null)
  const badgeRef = useRef(null)
  const navigate = useNavigate()
  const goTo = (idx) => navigate(['/', '/services', '/portfolio', '/pricing', '/about', '/contact'][idx] || '/')

  useEffect(() => {
    // Set initial states explicitly so Strict Mode double-fire is idempotent
    gsap.set(badgeRef.current,   { opacity: 0, y: -20 })
    gsap.set(taglineRef.current, { opacity: 0, y: 30 })
    gsap.set(ctaRef.current,     { opacity: 0, y: 20, scale: 0.95 })
    gsap.set(mascotRef.current,  { opacity: 0, x: 80, scale: 0.85 })
    gsap.set(titleRef.current.querySelectorAll('.word'), { opacity: 0, y: 60, skewY: 4 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power3.out' } })

      tl.to(badgeRef.current,   { opacity: 1, y: 0, duration: 0.6 })
        .to(titleRef.current.querySelectorAll('.word'),
          { opacity: 1, y: 0, skewY: 0, duration: 0.85, stagger: 0.14 },
          '-=0.15'
        )
        .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.65 }, '-=0.4')
        .to(ctaRef.current,     { opacity: 1, y: 0, scale: 1, duration: 0.55 }, '-=0.3')
        .to(mascotRef.current,  { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'back.out(1.2)' }, 0.35)

      // Floating mascot loop (starts after entry)
      gsap.to(mascotRef.current, {
        y: -18, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4
      })

      // Rotating glow rings
      gsap.to('.hero-glow-ring', {
        rotation: 360, duration: 12, ease: 'none', repeat: -1
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="section hero-section" ref={sectionRef}>
      <div className="hero-bg-grid" />
      <div className="hero-spotlight" />

      <div className="hero-content">
        {/* Left side */}
        <div className="hero-left">
          <div className="hero-badge" ref={badgeRef}>
            <span className="badge-dot" />
            <span>Available for Projects</span>
          </div>

          <h1 className="hero-title" ref={titleRef}>
            <span className="word gradient-text">4 KNOTTS</span>
            <br />
            <span className="word">KREATIV</span>
          </h1>

          <p className="hero-tagline" ref={taglineRef}>
            <span className="tag-item">We Create</span>
            <span className="tag-sep">•</span>
            <span className="tag-item">We Innovate</span>
            <span className="tag-sep">•</span>
            <span className="tag-item">We Elevate</span>
          </p>

          <p className="hero-desc">
            A premium creative studio crafting cinematic digital experiences
            that push the boundaries of design and technology.
          </p>

          <div className="hero-actions" ref={ctaRef}>
            <button className="btn-primary" onClick={() => goTo(5)}>
              <span>🚀 Start Project</span>
            </button>
            <button className="btn-ghost" onClick={() => goTo(2)}>
              <span>View Work</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number gradient-text">50+</span>
              <span className="stat-label">Projects Done</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number gradient-text">30+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number gradient-text">5★</span>
              <span className="stat-label">Avg Rating</span>
            </div>
          </div>
        </div>

        {/* Right side – mascot */}
        <div className="hero-right">
          <div className="hero-mascot-wrap" ref={mascotRef}>
            <div className="hero-glow-ring" />
            <div className="hero-glow-ring hero-glow-ring--2" />
            <MascotImage />
            <div className="mascot-badge mascot-badge--code">
              <span>&lt;/&gt;</span> Dev Mode
            </div>
            <div className="mascot-badge mascot-badge--design">
              <span>✦</span> Creative
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll-hint">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  )
}

function MascotImage() {
  const [failed, setFailed] = useState(false)
  if (failed) return <MascotSVG />
  return (
    <img
      src="/mascot.png"
      alt="4 Knotts Kreativ mascot"
      className="hero-mascot-img"
      onError={() => setFailed(true)}
      loading="eager"
    />
  )
}

function MascotSVG() {
  return (
    <svg className="hero-mascot-svg" viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="100%" stopColor="#0a0015" />
        </radialGradient>
        <radialGradient id="glowRed" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8141e" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e8141e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowPurple" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4d4d8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d4d4d8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="suitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e0533" />
          <stop offset="100%" stopColor="#0d0020" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="160" cy="380" rx="100" ry="20" fill="url(#glowRed)" />
      <circle cx="160" cy="210" r="140" fill="url(#glowPurple)" />

      {/* Shadow */}
      <ellipse cx="160" cy="395" rx="70" ry="12" fill="rgba(0,0,0,0.5)" />

      {/* Legs */}
      <rect x="115" y="310" width="36" height="80" rx="12" fill="url(#suitGrad)" />
      <rect x="169" y="310" width="36" height="80" rx="12" fill="url(#suitGrad)" />
      {/* Boots */}
      <rect x="108" y="370" width="50" height="22" rx="8" fill="#e8141e" />
      <rect x="162" y="370" width="50" height="22" rx="8" fill="#e8141e" />

      {/* Body / Suit */}
      <rect x="95" y="195" width="130" height="125" rx="24" fill="url(#suitGrad)" />
      {/* Chest stripe */}
      <rect x="145" y="200" width="30" height="115" rx="4" fill="rgba(232, 20, 30,0.15)" />
      {/* Chest emblem */}
      <circle cx="160" cy="250" r="18" fill="rgba(232, 20, 30,0.1)" stroke="#e8141e" strokeWidth="1.5" />
      <text x="160" y="255" textAnchor="middle" fill="#e8141e" fontFamily="monospace" fontSize="12" fontWeight="bold" filter="url(#glow)">4K</text>

      {/* Left shoulder pad */}
      <rect x="68" y="200" width="30" height="20" rx="8" fill="#1a0a2e" stroke="rgba(212, 212, 216,0.5)" strokeWidth="1" />
      {/* Right shoulder pad */}
      <rect x="222" y="200" width="30" height="20" rx="8" fill="#1a0a2e" stroke="rgba(212, 212, 216,0.5)" strokeWidth="1" />

      {/* Arms */}
      <rect x="55" y="215" width="44" height="20" rx="10" fill="url(#suitGrad)" />
      <rect x="221" y="215" width="44" height="20" rx="10" fill="url(#suitGrad)" />
      {/* Hands */}
      <circle cx="55" cy="225" r="14" fill="#e8141e" />
      <circle cx="265" cy="225" r="14" fill="#e8141e" />

      {/* Neck */}
      <rect x="142" y="178" width="36" height="22" rx="6" fill="#1a0a2e" />

      {/* Head */}
      <rect x="90" y="80" width="140" height="105" rx="30" fill="url(#bodyGrad)" stroke="rgba(212, 212, 216,0.4)" strokeWidth="1.5" />

      {/* Visor / face plate */}
      <rect x="100" y="100" width="120" height="55" rx="18" fill="rgba(0,0,30,0.95)" stroke="rgba(232, 20, 30,0.3)" strokeWidth="1" />

      {/* Eyes */}
      <rect x="110" y="113" width="38" height="18" rx="9" fill="#e8141e" filter="url(#glow)" />
      <rect x="172" y="113" width="38" height="18" rx="9" fill="#e8141e" filter="url(#glow)" />
      {/* Eye pupils */}
      <rect x="121" y="117" width="16" height="10" rx="5" fill="#fff" opacity="0.9" />
      <rect x="183" y="117" width="16" height="10" rx="5" fill="#fff" opacity="0.9" />

      {/* Mouth / speaker grill */}
      <rect x="120" y="140" width="80" height="6" rx="3" fill="rgba(212, 212, 216,0.5)" />
      <rect x="125" y="150" width="70" height="4" rx="2" fill="rgba(212, 212, 216,0.3)" />

      {/* Head details / antenna */}
      <line x1="160" y1="80" x2="160" y2="55" stroke="rgba(232, 20, 30,0.6)" strokeWidth="2" />
      <circle cx="160" cy="50" r="5" fill="#e8141e" filter="url(#glow)" />

      {/* Ears / side panels */}
      <rect x="82" y="100" width="12" height="50" rx="4" fill="#1a0a2e" stroke="rgba(232, 20, 30,0.3)" strokeWidth="1" />
      <rect x="226" y="100" width="12" height="50" rx="4" fill="#1a0a2e" stroke="rgba(232, 20, 30,0.3)" strokeWidth="1" />

      {/* Laptop in hands */}
      <rect x="75" y="240" width="170" height="100" rx="10" fill="#0a0015" stroke="rgba(212, 212, 216,0.4)" strokeWidth="1.5" />
      <rect x="80" y="245" width="160" height="85" rx="8" fill="#050010" />
      {/* Screen content */}
      <rect x="88" y="253" width="80" height="6" rx="2" fill="rgba(232, 20, 30,0.6)" />
      <rect x="88" y="265" width="60" height="4" rx="2" fill="rgba(212, 212, 216,0.5)" />
      <rect x="88" y="275" width="70" height="4" rx="2" fill="rgba(212, 212, 216,0.3)" />
      <rect x="88" y="285" width="45" height="4" rx="2" fill="rgba(232, 20, 30,0.4)" />
      {/* Code cursor blink */}
      <rect x="136" y="285" width="3" height="8" rx="1" fill="#e8141e" opacity="0.9" />
      {/* Terminal prompt */}
      <text x="88" y="310" fill="rgba(232, 20, 30,0.7)" fontFamily="monospace" fontSize="8">$ npm run dev_</text>
    </svg>
  )
}
