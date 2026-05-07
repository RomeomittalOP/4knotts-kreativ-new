import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './ServiceModal.css'

export default function ServiceModal({ service, onClose }) {
  const overlayRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    // Enter animation
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    )
    gsap.fromTo(cardRef.current,
      { opacity: 0, scale: 0.8, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
    )

    // Close on Escape
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleClose = () => {
    gsap.to(cardRef.current, { scale: 0.85, opacity: 0, y: 20, duration: 0.3, ease: 'power2.in' })
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: 'power2.in',
      onComplete: onClose
    })
  }

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={(e) => e.target === overlayRef.current && handleClose()}>
      <div className="modal-card glass" ref={cardRef} style={{ '--card-color': service.color }}>
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="modal-header">
          <div className="modal-icon-wrap">
            <span className="modal-icon">{service.emoji}</span>
            <div className="modal-icon-glow" />
          </div>
          <div>
            <p className="modal-label">Service</p>
            <h2 className="modal-title">{service.title}</h2>
          </div>
        </div>

        <div className="modal-divider" />

        <p className="modal-desc">{service.description}</p>

        <ul className="modal-features">
          {service.features.map((f, i) => (
            <li key={i} className="modal-feature">
              <span className="feature-check">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <button className="btn-primary modal-cta" onClick={handleClose}>
          <span>Let's Work Together</span>
        </button>
      </div>
    </div>
  )
}
