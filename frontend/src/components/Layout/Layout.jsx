import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ParticleCanvas from '../Particles/ParticleCanvas'
import SiteNav from './SiteNav'
import SiteFooter from './SiteFooter'
import AuthModal from '../Auth/AuthModal'
import './Layout.css'

const pageVariants = {
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -16, filter: 'blur(6px)' },
}

export default function Layout() {
  const location = useLocation()

  // Reset scroll on route change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])

  return (
    <div className="site-shell">
      <ParticleCanvas />
      <SiteNav />

      <main className="site-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="site-page"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <SiteFooter />
      <AuthModal />
    </div>
  )
}
