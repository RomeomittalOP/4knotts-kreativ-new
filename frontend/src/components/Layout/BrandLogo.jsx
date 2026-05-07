import { useState } from 'react'

// Tries the logo PNG first; falls back to the [4K] text mark if not present.
export default function BrandLogo({ size = 'sm' }) {
  const [failed, setFailed] = useState(false)
  const dim = size === 'lg' ? 64 : size === 'md' ? 44 : 34

  if (failed) {
    return (
      <span className="logo-fallback">
        <span className="logo-bracket">[</span>
        <span className="logo-text">4K</span>
        <span className="logo-bracket">]</span>
      </span>
    )
  }
  return (
    <img
      src="/logo.png"
      alt="4 Knotts Kreativ"
      width={dim}
      height={dim}
      className="brand-logo-img"
      onError={() => setFailed(true)}
      loading="eager"
    />
  )
}
