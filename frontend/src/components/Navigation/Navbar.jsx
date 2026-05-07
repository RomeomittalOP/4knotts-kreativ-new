import { useNavigation } from '../../context/NavigationContext'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Services', index: 1 },
  { label: 'Portfolio', index: 2 },
  { label: 'Pricing', index: 3 },
  { label: 'About', index: 4 },
  { label: 'Contact', index: 5 },
]

export default function Navbar() {
  const { goTo, activeIndex } = useNavigation()

  return (
    <header className="navbar">
      <button className="navbar-logo" onClick={() => goTo(0)}>
        <span className="logo-bracket">[</span>
        <span className="logo-text">4K</span>
        <span className="logo-bracket">]</span>
        <span className="logo-full">4 Knotts Kreativ</span>
      </button>

      <nav className="navbar-links">
        {NAV_LINKS.map(({ label, index }) => (
          <button
            key={label}
            className={`nav-link${activeIndex === index ? ' active' : ''}`}
            onClick={() => goTo(index)}
          >
            {label}
          </button>
        ))}
      </nav>

      <button className="navbar-cta btn-primary" onClick={() => goTo(5)}>
        <span>Get Started</span>
      </button>
    </header>
  )
}
