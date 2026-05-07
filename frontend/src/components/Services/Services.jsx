import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ServiceModal from './ServiceModal'
import './Services.css'

const SERVICES = [
  {
    id: 1,
    title: 'Creative Thinking',
    icon: '🧠',
    color: '#e8141e',
    emoji: '🧠',
    shortDesc: 'Ideas that transcend the ordinary',
    description: 'We combine strategic insight with radical creativity to produce concepts that stop people in their tracks. Our ideation process digs deep into your brand soul, competitor landscape, and cultural zeitgeist to surface ideas that are both brilliant and actionable.',
    features: ['Brand ideation workshops', 'Concept development', 'Creative strategy', 'Mood boarding & visual direction'],
  },
  {
    id: 2,
    title: 'Web Development',
    icon: '💻',
    color: '#d4d4d8',
    emoji: '💻',
    shortDesc: 'Code that performs at 60fps',
    description: 'From blazing-fast React frontends to robust Node.js backends, we architect digital products that scale beautifully. We obsess over Core Web Vitals, accessibility, and the micro-interactions that turn visitors into loyal fans.',
    features: ['React / Next.js frontends', 'Node.js / Express backends', 'REST & GraphQL APIs', 'Performance optimisation'],
  },
  {
    id: 3,
    title: 'Visual Design',
    icon: '🎨',
    color: '#ec4899',
    emoji: '🎨',
    shortDesc: 'Pixels with purpose',
    description: 'Our designers live at the intersection of art and science. Every layout, colour swatch, and typographic pairing is deliberate — built to trigger the exact emotional response your brand needs and guide users through a seamless journey.',
    features: ['UI / UX design', 'Brand identity', 'Motion graphics', 'Design systems'],
  },
  {
    id: 4,
    title: 'Content Creation',
    icon: '📸',
    color: '#f59e0b',
    emoji: '📸',
    shortDesc: 'Stories that convert',
    description: 'Content is the fuel powering every digital touchpoint. We produce copy, photography, video, and social content that doesn\'t just look pretty — it drives measurable results and builds an audience that genuinely cares.',
    features: ['Copywriting & blogging', 'Photography & video', 'Social media content', 'Email marketing'],
  },
  {
    id: 5,
    title: 'Strategy & Growth',
    icon: '📈',
    color: '#10b981',
    emoji: '📈',
    shortDesc: 'Data-driven growth loops',
    description: 'We build growth engines. Using first-party data, funnel analytics, and iterative experimentation, we identify the highest-leverage levers for your business and systematically pull them — turning impressions into revenue.',
    features: ['SEO & paid media', 'Conversion optimisation', 'Analytics & reporting', 'Growth roadmapping'],
  },
  {
    id: 6,
    title: 'Collaboration',
    icon: '🤝',
    color: '#06b6d4',
    emoji: '🤝',
    shortDesc: 'Your team, extended',
    description: 'We embed with your team as true partners, not just vendors. Daily stand-ups, Figma + GitHub access, shared Slack channels — we work the way you work, moving fast without breaking things.',
    features: ['Agile project management', 'Dedicated Slack channel', 'Weekly progress calls', 'Source code handoff'],
  },
]

// Pyramid rows: 3 on top, 2 in middle, 1 at bottom
const PYRAMID = [[0, 1, 2], [3, 4], [5]]

export default function Services() {
  const sectionRef = useRef(null)
  const [activeService, setActiveService] = useState(null)
  const cardsRef = useRef([])

  useEffect(() => {
    // Set initial hidden states
    gsap.set('.section-label-srv, .section-title-srv, .services-sub', { opacity: 0, y: 40 })
    gsap.set('.svc-card', { opacity: 0, y: 60, scale: 0.85 })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to('.section-label-srv, .section-title-srv, .services-sub', {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12
          })
          gsap.to('.svc-card', {
            opacity: 1, y: 0, scale: 1, duration: 0.7,
            ease: 'back.out(1.4)', stagger: 0.09, delay: 0.25
          })
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section services-section" ref={sectionRef}>
      <div className="services-bg" />

      <div className="services-inner">
        <div className="services-header">
          <p className="section-label section-label-srv">What We Do</p>
          <h2 className="section-title section-title-srv">
            Our <span className="gradient-text">Services</span>
          </h2>
          <p className="services-sub">
            Six specialisms. One unified vision.
          </p>
        </div>

        <div className="pyramid-container">
          {PYRAMID.map((row, rowIdx) => (
            <div key={rowIdx} className={`pyramid-row pyramid-row--${row.length}`}>
              {row.map((svcIdx) => {
                const svc = SERVICES[svcIdx]
                return (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    onClick={() => setActiveService(svc)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {activeService && (
        <ServiceModal
          service={activeService}
          onClose={() => setActiveService(null)}
        />
      )}
    </section>
  )
}

function ServiceCard({ service, onClick }) {
  return (
    <div
      className="svc-card glass"
      onClick={onClick}
      style={{ '--card-color': service.color }}
    >
      <div className="svc-card-glow" />
      <div className="svc-icon-wrap">
        <span className="svc-icon">{service.emoji}</span>
      </div>
      <h3 className="svc-title">{service.title}</h3>
      <p className="svc-desc">{service.shortDesc}</p>
      <div className="svc-cta">
        <span>Explore</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  )
}
