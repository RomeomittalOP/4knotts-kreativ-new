import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './Portfolio.css'

const PROJECTS = [
  {
    id: 1,
    title: 'NexaBank — Digital Rebrand',
    category: 'Brand Identity + Web',
    year: '2024',
    desc: 'Full brand overhaul and interactive web experience for a fintech startup. Dark glassmorphism UI with cinematic transitions.',
    tags: ['React', 'GSAP', 'Brand'],
    gradient: 'linear-gradient(135deg, #e8141e22, #d4d4d822)',
    accent: '#e8141e',
  },
  {
    id: 2,
    title: 'Luminary — SaaS Platform',
    category: 'UI/UX + Development',
    year: '2024',
    desc: 'End-to-end product design and front-end build for a B2B analytics SaaS. 40% increase in user retention post-launch.',
    tags: ['Next.js', 'Figma', 'Motion'],
    gradient: 'linear-gradient(135deg, #d4d4d822, #ec489922)',
    accent: '#d4d4d8',
  },
  {
    id: 3,
    title: 'Vortex — E-Commerce',
    category: 'Web Development',
    year: '2024',
    desc: 'High-performance e-commerce store built for a premium streetwear label. 3D product viewer, seamless checkout flow.',
    tags: ['Three.js', 'Node.js', 'MongoDB'],
    gradient: 'linear-gradient(135deg, #f59e0b22, #e8141e22)',
    accent: '#f59e0b',
  },
  {
    id: 4,
    title: 'Echo — Music Platform',
    category: 'Full Stack + Design',
    year: '2023',
    desc: 'Streaming platform MVP with real-time waveform visualisation, playlist curation AI, and artist analytics dashboard.',
    tags: ['React', 'WebAudio API', 'Express'],
    gradient: 'linear-gradient(135deg, #06b6d422, #d4d4d822)',
    accent: '#06b6d4',
  },
  {
    id: 5,
    title: 'Apex Motors — Campaign',
    category: 'Creative + Motion',
    year: '2023',
    desc: 'Award-winning launch campaign for an EV brand. Scroll-driven storytelling, particle physics, and cinematic video integration.',
    tags: ['GSAP', 'Three.js', 'Video'],
    gradient: 'linear-gradient(135deg, #10b98122, #06b6d422)',
    accent: '#10b981',
  },
]

export default function Portfolio() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const posRef = useRef(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.fromTo('.port-header > *',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 }
          )
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const scroll = (dir) => {
    const track = trackRef.current
    const maxScroll = track.scrollWidth - track.clientWidth
    posRef.current = Math.max(0, Math.min(maxScroll, posRef.current + dir * 380))
    gsap.to(track, { scrollLeft: posRef.current, duration: 0.7, ease: 'power2.inOut' })
  }

  return (
    <section className="section portfolio-section" ref={sectionRef}>
      <div className="portfolio-bg" />

      <div className="portfolio-wrapper">
        <div className="port-header">
          <p className="section-label">Our Work</p>
          <h2 className="section-title">
            Selected <span className="gradient-text">Projects</span>
          </h2>
          <p className="port-sub">Drag or use arrows to explore</p>
        </div>

        <div className="port-track-container">
          <button className="port-arrow port-arrow--left" onClick={() => scroll(-1)} aria-label="Previous">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="port-track" ref={trackRef}>
            {PROJECTS.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>

          <button className="port-arrow port-arrow--right" onClick={() => scroll(1)} aria-label="Next">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="port-count">
          {PROJECTS.map((_, i) => (
            <span key={i} className="port-pip" />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project }) {
  return (
    <div className="proj-card" style={{ '--proj-accent': project.accent, '--proj-gradient': project.gradient }}>
      <div className="proj-thumb">
        <div className="proj-thumb-bg" />
        <div className="proj-thumb-overlay" />
        <div className="proj-number">0{project.id}</div>
        <div className="proj-thumb-logo">
          {project.title.split('—')[0].trim().charAt(0)}
        </div>
      </div>

      <div className="proj-info">
        <div className="proj-meta">
          <span className="proj-category">{project.category}</span>
          <span className="proj-year">{project.year}</span>
        </div>
        <h3 className="proj-title">{project.title}</h3>
        <p className="proj-desc">{project.desc}</p>
        <div className="proj-tags">
          {project.tags.map((t) => (
            <span key={t} className="proj-tag">{t}</span>
          ))}
        </div>
      </div>

      <div className="proj-hover-cta">
        <span>View Project</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  )
}
