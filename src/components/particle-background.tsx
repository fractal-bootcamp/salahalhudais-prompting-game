"use client"

import { useEffect, useRef } from "react"

// Define the Particle class outside the component
class Particle {
  x: number
  y: number
  size: number
  baseSize: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  rising: boolean
  wobbleOffset: number
  wobbleSpeed: number
  popTimeout: number | null = null
  
  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth
    this.y = Math.random() * canvasHeight
    this.baseSize = Math.random() * 6 + 2
    this.size = this.baseSize
    this.speedX = Math.random() * 0.7 - 0.35
    this.speedY = Math.random() * 0.7 - 0.35
    this.opacity = Math.random() * 0.5 + 0.5

    // Brighter, more saturated colors with explicit string type
    const colorOptions = [
      `rgba(147, 112, 219, ${this.opacity})`, // Purple
      `rgba(100, 149, 237, ${this.opacity})`, // Cornflower Blue
      `rgba(0, 191, 255, ${this.opacity})`,   // Deep Sky Blue
      `rgba(255, 105, 180, ${this.opacity})`, // Hot Pink
      `rgba(50, 205, 50, ${this.opacity})`,   // Lime Green
      `rgba(255, 165, 0, ${this.opacity})`,   // Orange
    ];

    // Ensure we have a valid color by providing a default
    const index = Math.floor(Math.random() * colorOptions.length);
    this.color = index >= 0 && index < colorOptions.length ? colorOptions[index] : colorOptions[0];

    this.rising = Math.random() > 0.5
    this.wobbleOffset = Math.random() * Math.PI * 2
    this.wobbleSpeed = Math.random() * 0.02 + 0.01
  }

  update(time: number, mouseX: number, mouseY: number) {
    // Basic movement
    this.x += this.speedX
    this.y += this.speedY + (this.rising ? -0.2 : 0.1)
    
    // Wobble effect
    this.x += Math.sin(time * 0.001 * this.wobbleSpeed + this.wobbleOffset) * 0.5
    
    // Mouse interaction
    const dx = this.x - mouseX
    const dy = this.y - mouseY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < 150) {
      this.size = this.baseSize * (1 + (150 - distance) / 100)
      
      const normalizedDx = dx / distance
      const normalizedDy = dy / distance
      this.x += normalizedDx * 2
      this.y += normalizedDy * 2
    } else {
      this.size = this.baseSize
    }

    // Wrap around screen
    if (this.x > window.innerWidth) this.x = 0
    if (this.x < 0) this.x = window.innerWidth
    
    if (this.y < 0) {
      this.y = window.innerHeight
      this.x = Math.random() * window.innerWidth
    }
    if (this.y > window.innerHeight) {
      this.y = 0
      this.x = Math.random() * window.innerWidth
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw main bubble with glow effect
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    
    // Create gradient for more pronounced effect
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 1.5
    )
    gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.9})`)
    gradient.addColorStop(0.5, this.color)
    gradient.addColorStop(1, `rgba(0, 0, 0, 0)`)
    
    ctx.fillStyle = gradient
    ctx.fill()
    
    // Add highlight for 3D effect
    ctx.beginPath()
    ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`
    ctx.fill()
  }
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const timeoutIdsRef = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
      
      // Recreate particles when canvas is resized
      initParticles()
    }
    
    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    // Initialize particles
    const initParticles = () => {
      // Clear existing particles
      particlesRef.current = []
      
      // Clear any existing timeouts
      timeoutIdsRef.current.forEach(id => window.clearTimeout(id))
      timeoutIdsRef.current = []
      
      // Create more particles for better visibility
      const particleCount = 120
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle(window.innerWidth, window.innerHeight))
      }
    }

    // Animation loop
    const animate = (timestamp: number) => {
      if (!ctx) return
      
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      
      // Update and draw particles
      const { x: mouseX, y: mouseY } = mouseRef.current
      
      particlesRef.current.forEach((particle) => {
        particle.update(timestamp, mouseX, mouseY)
        particle.draw(ctx)
      })
      
      // Request next frame
      animationRef.current = requestAnimationFrame(animate)
    }

    // Set up event listeners
    window.addEventListener("resize", resizeCanvas)
    window.addEventListener("mousemove", handleMouseMove)
    
    // Initialize
    resizeCanvas()
    animationRef.current = requestAnimationFrame(animate)

    // Cleanup function
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      
      // Cancel animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // Clear all timeouts
      timeoutIdsRef.current.forEach(id => window.clearTimeout(id))
      timeoutIdsRef.current = []
    }
  }, [])

  // Increased opacity for more visibility
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 1 }} />
}

