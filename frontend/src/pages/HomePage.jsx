import { Link } from 'react-router-dom'
import Hero from '../components/Hero/Hero'
import './pages.css'

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="home-strip">
        <div className="strip-inner">
          <div className="strip-card">
            <span className="strip-num gradient-text">01</span>
            <h3>Strategy</h3>
            <p>We start with the why — understanding your audience, market, and goals before pixel one.</p>
          </div>
          <div className="strip-card">
            <span className="strip-num gradient-text">02</span>
            <h3>Design</h3>
            <p>Cinematic visuals, deliberate typography, and design systems built to scale with you.</p>
          </div>
          <div className="strip-card">
            <span className="strip-num gradient-text">03</span>
            <h3>Build</h3>
            <p>Production-grade React + Node backends. 60fps animations, accessible, fast everywhere.</p>
          </div>
          <div className="strip-card">
            <span className="strip-num gradient-text">04</span>
            <h3>Grow</h3>
            <p>Launch isn't the end. We monitor, iterate, and optimise to compound your results.</p>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="cta-inner">
          <h2 className="section-title">
            Ready to <span className="gradient-text">build something legendary?</span>
          </h2>
          <p>Tell us about your project. We'll respond within a day with a custom proposal.</p>
          <div className="cta-actions">
            <Link to="/build" className="btn-primary"><span>🚀 Build Your Project</span></Link>
            <Link to="/contact" className="btn-ghost"><span>Or talk to us →</span></Link>
          </div>
        </div>
      </section>
    </>
  )
}
