"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create non-null variables that TypeScript can understand
    const safeCanvas = canvas;
    const safeCtx = ctx;

    // Set canvas dimensions
    const resizeCanvas = () => {
      safeCanvas.width = window.innerWidth
      safeCanvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create particles
    const particlesArray: Particle[] = []
    const numberOfParticles = 50

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * safeCanvas.width
        this.y = Math.random() * safeCanvas.height
        this.size = Math.random() * 5 + 1
        this.speedX = Math.random() * 3 - 1.5
        this.speedY = Math.random() * 3 - 1.5

        // Random color from a vibrant palette
        const colors = [
          "rgba(255, 105, 180, 0.7)", // Hot pink
          "rgba(72, 209, 204, 0.7)", // Turquoise
          "rgba(255, 223, 0, 0.7)", // Yellow
          "rgba(120, 81, 169, 0.7)", // Purple
          "rgba(50, 205, 50, 0.7)", // Lime green
          "rgba(255, 165, 0, 0.7)", // Orange
        ]
        // Fix for line 52: Ensure we have a valid color
        const colorIndex = Math.floor(Math.random() * colors.length);
        this.color = colors[colorIndex] || "rgba(255, 105, 180, 0.7)";
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Bounce off edges
        if (this.x > safeCanvas.width || this.x < 0) {
          this.speedX = -this.speedX
        }
        if (this.y > safeCanvas.height || this.y < 0) {
          this.speedY = -this.speedY
        }
      }

      draw() {
        safeCtx.fillStyle = this.color
        safeCtx.beginPath()
        safeCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        safeCtx.fill()
      }
    }

    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle())
      }
    }

    init()

    const animate = () => {
      safeCtx.clearRect(0, 0, safeCanvas.width, safeCanvas.height)

      // Add a semi-transparent layer to create trail effect
      safeCtx.fillStyle = "rgba(0, 0, 0, 0.02)"
      safeCtx.fillRect(0, 0, safeCanvas.width, safeCanvas.height)

      // Fix for lines 92-93: Add a check to ensure the particle exists
      for (let i = 0; i < particlesArray.length; i++) {
        const particle = particlesArray[i];
        if (particle) {  // Check if particle exists
          particle.update();
          particle.draw();
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10 opacity-30" />
}

