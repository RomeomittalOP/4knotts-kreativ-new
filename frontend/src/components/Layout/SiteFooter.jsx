import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* 🔥 BRAND */}
        <div className="footer-col footer-col--brand">
          <Link to="/" className="logo">

            {/* ✅ IMAGE ADD KIYA */}
            <img
              src="/logo.png"
              alt="4 Knotts Kreativ"
              style={{
                width: "60px",
                objectFit: "contain"
              }}
            />

          </Link>

          <p className="footer-tag">
            We Create · We Innovate · We Elevate
          </p>

          <p className="footer-copy">
            © {new Date().getFullYear()} 4 Knotts Kreativ. All rights reserved.
          </p>
        </div>

        {/* 🔥 STUDIO */}
        <div className="footer-col">
          <p className="footer-heading">Studio</p>
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/services" className="footer-link">Services</Link>
          <Link to="/portfolio" className="footer-link">Portfolio</Link>
        </div>

        {/* 🔥 ENGAGE */}
        <div className="footer-col">
          <p className="footer-heading">Engage</p>
          <Link to="/pricing" className="footer-link">Pricing</Link>
          <Link to="/build" className="footer-link">Build a Project</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
        </div>

        {/* 🔥 CONNECT */}
        <div className="footer-col">
          <p className="footer-heading">Connect</p>
          <span className="footer-link">hello@4knottskreativ.com</span>
          <span className="footer-link">India · Remote Worldwide</span>
        </div>

      </div>
    </footer>
  );
}