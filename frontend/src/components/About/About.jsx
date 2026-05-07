import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './About.css'

const WORDS = ['We', 'are', '4', 'Knotts', 'Kreativ', '—', 'a', 'collective', 'of', 'obsessive', 'builders', 'and', 'visual', 'storytellers.']

const PILLARS = [
  { icon: '🔥', label: 'Passion-Driven' },
  { icon: '⚡', label: 'Velocity-Focused' },
  { icon: '🎯', label: 'Results-Obsessed' },
  { icon: '🌐', label: 'Globally-Minded' },
]

export default function About() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    // Set hidden states upfront
    const spans = textRef.current?.querySelectorAll('.about-word') || []
    gsap.set(spans, { opacity: 0, y: 30, filter: 'blur(8px)' })
    gsap.set('.about-sub', { opacity: 0, y: 20 })
    gsap.set('.about-pillar', { opacity: 0, scale: 0.8 })
    gsap.set('.about-cta-row', { opacity: 0, y: 20 })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const words = textRef.current?.querySelectorAll('.about-word') || []
          gsap.to(words, {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.6, stagger: 0.07, ease: 'power3.out', delay: 0.15
          })
          gsap.to('.about-sub',      { opacity: 1, y: 0, duration: 0.7, delay: 1.1, ease: 'power3.out' })
          gsap.to('.about-pillar',   { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, delay: 1.4, ease: 'back.out(1.4)' })
          gsap.to('.about-cta-row',  { opacity: 1, y: 0, duration: 0.6, delay: 1.9, ease: 'power3.out' })
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section about-section" ref={sectionRef}>
      <div className="about-bg" />
      <div className="about-parallax-orb about-parallax-orb--1" />
      <div className="about-parallax-orb about-parallax-orb--2" />

      <div className="about-inner">
        <p className="section-label about-label">About Us</p>

        <h2 className="about-headline" ref={textRef}>
          {WORDS.map((word, i) => (
            <span
              key={i}
              className={`about-word${['4', 'Knotts', 'Kreativ'].includes(word) ? ' gradient-text' : ''}`}
            >
              {word}{' '}
            </span>
          ))}
        </h2>

        <p className="about-sub">
          Founded with a single principle: every pixel deserves intent.
          We merge technical excellence with artistic courage to produce work
          that earns attention, builds trust, and drives growth.
        </p>

        <div className="about-pillars">
          {PILLARS.map((p) => (
            <div key={p.label} className="about-pillar glass">
              <span className="pillar-icon">{p.icon}</span>
              <span className="pillar-label">{p.label}</span>
            </div>
          ))}
        </div>

        <div className="about-cta-row">
          <div className="about-stat-row">
            <div className="about-big-stat">
              <span className="big-num gradient-text">4+</span>
              <span className="big-label">Years of craft</span>
            </div>
            <div className="about-big-stat">
              <span className="big-num gradient-text">50+</span>
              <span className="big-label">Projects shipped</span>
            </div>
            <div className="about-big-stat">
              <span className="big-num gradient-text">∞</span>
              <span className="big-label">Ideas in queue</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
