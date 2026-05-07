import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BrandLogo from './BrandLogo'

const LINKS = [
  { to: '/',            label: 'Home' },
  { to: '/about',       label: 'About' },
  { to: '/services',    label: 'Services' },
  { to: '/portfolio',   label: 'Portfolio' },
  { to: '/pricing',     label: 'Pricing' },
  { to: '/build',       label: 'Build Project' },
  { to: '/contact',     label: 'Contact' },
]

export default function SiteNav() {
  const { user, openAuth, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="site-nav">
      <Link to="/" className="site-logo">
        <BrandLogo />
        <span className="logo-full">4 Knotts Kreativ</span>
      </Link>

      <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        {user ? (
          <div className="user-pill">
            <span className="user-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
            <span className="user-name">{user.name?.split(' ')[0]}</span>
            <button className="user-logout" onClick={() => { logout(); navigate('/') }} title="Log out">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 13H2V1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <>
            <button className="nav-login" onClick={() => openAuth('login')}>Log In</button>
            <button className="btn-primary nav-cta" onClick={() => openAuth('signup')}>
              <span>Get Started</span>
            </button>
          </>
        )}

        <button className="nav-burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
