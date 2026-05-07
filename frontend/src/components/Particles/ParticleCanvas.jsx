import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 80
const CONNECTION_DIST = 120

export default function ParticleCanvas() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialise particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
      // Each particle is either red or purple tinted
      hue: Math.random() > 0.6 ? '212, 212, 216' : '232, 20, 30'
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const pts = particlesRef.current

      // Draw connections first
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15
            ctx.beginPath()
            ctx.strokeStyle = `rgba(232, 20, 30,${alpha})`
            ctx.lineWidth = 0.5
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (const p of pts) {
        ctx.beginPath()
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        grd.addColorStop(0, `rgba(${p.hue},${p.alpha})`)
        grd.addColorStop(1, `rgba(${p.hue},0)`)
        ctx.fillStyle = grd
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.fillStyle = `rgba(${p.hue},${p.alpha + 0.3})`
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()

        // Move
        p.x += p.vx
        p.y += p.vy

        // Wrap edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    // Mouse interaction – attract nearby particles
    const onMouseMove = (e) => {
      for (const p of particlesRef.current) {
        const dx = e.clientX - p.x
        const dy = e.clientY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          p.vx += (dx / dist) * 0.03
          p.vy += (dy / dist) * 0.03
          // Clamp speed
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
          if (speed > 1.5) {
            p.vx = (p.vx / speed) * 1.5
            p.vy = (p.vy / speed) * 1.5
          }
        }
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7
      }}
    />
  )
}
