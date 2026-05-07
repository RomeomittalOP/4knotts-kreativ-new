import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import PortfolioPage from './pages/PortfolioPage'
import PricingPage from './pages/PricingPage'
import ContactPage from './pages/ContactPage'
import BuildProjectPage from './pages/BuildProjectPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index            element={<HomePage />} />
            <Route path="about"     element={<AboutPage />} />
            <Route path="services"  element={<ServicesPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="pricing"   element={<PricingPage />} />
            <Route path="build"     element={<BuildProjectPage />} />
            <Route path="contact"   element={<ContactPage />} />
            <Route path="*"         element={<HomePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
