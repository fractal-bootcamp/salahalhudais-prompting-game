"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import Image from "next/image"
import { ParticleBackground } from "~/components/particle-background"
import { api } from "~/trpc/react"

const artworks = [
  {
    id: 1,
    image: "/placeholder.svg?height=600&width=800",
    title: "A serene landscape capturing the tranquility of mountains reflecting in the crystal-clear waters",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=600&width=800",
    title: "The vibrant greens and blues create a harmonious blend of nature's palette",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=600&width=800",
    title: "The powerful wave captures the raw energy of the ocean in motion",
  },
]

export function PaintbrushTitle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  // Start with default values for server-side rendering
  const [isRevealing, setIsRevealing] = useState(true)
  const [revealPercentage, setRevealPercentage] = useState(0)
  const [isFullyRevealed, setIsFullyRevealed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true once component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)

    // Check sessionStorage with expiration
    try {
      const storedData = sessionStorage.getItem('artTitleRevealed')
      if (storedData) {
        const data = JSON.parse(storedData)
        const now = new Date().getTime()

        // Check if the stored data is still valid (not expired)
        if (data.expiry > now && data.revealed) {
          setIsRevealing(false)
          setIsFullyRevealed(true)
          setRevealPercentage(100)
        } else {
          // Clear expired data
          sessionStorage.removeItem('artTitleRevealed')
        }
      }
    } catch (error) {
      console.error("Error reading from sessionStorage:", error)
      // If there's an error, clear the storage to be safe
      sessionStorage.removeItem('artTitleRevealed')
    }
  }, [])

  useEffect(() => {
    // Skip if not client-side yet
    if (!isClient) return

    const canvas = canvasRef.current
    const titleElement = titleRef.current
    if (!canvas || !titleElement) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match the title element
    const updateCanvasSize = () => {
      const rect = titleElement.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // If already revealed, clear the canvas
      if (isFullyRevealed) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      // Otherwise fill canvas with black
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add some texture/noise to the black overlay
      for (let i = 0; i < canvas.width * canvas.height * 0.05; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 2 + 1
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2 + 0.8})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Brush properties
    const brushSize = 60
    let lastX: number
    let lastY: number
    let isDrawing = false

    // Check if title is fully revealed
    const checkRevealStatus = () => {
      try {
        // Get image data to analyze transparent pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData?.data
        let transparentPixels = 0

        // Count transparent pixels (alpha < 50)
        if (data) {
          for (let i = 3; i < data.length; i += 4) {
            // Use a type assertion to tell TypeScript that data[i] is a number
            const alphaValue = data[i] as number;
            if (alphaValue < 50) {
              transparentPixels++
            }
          }

          // Calculate percentage revealed
          const totalPixels = canvas.width * canvas.height
          const percentRevealed = (transparentPixels / totalPixels) * 100

          // Update state if significantly revealed (over 60%)
          if (percentRevealed > 60 && !isFullyRevealed) {
            setIsFullyRevealed(true)

            // Save to sessionStorage with 10-minute expiration
            const now = new Date().getTime()
            const expiryTime = now + (10 * 60 * 1000) // 10 minutes in milliseconds

            const dataToStore = {
              revealed: true,
              expiry: expiryTime
            }

            sessionStorage.setItem('artTitleRevealed', JSON.stringify(dataToStore))
          }
        }
      } catch (error) {
        console.error("Error checking reveal status:", error)
      }
    }

    // Automatically reveal the title
    if (isRevealing) {
      let animationFrame: number

      const autoReveal = () => {
        if (revealPercentage >= 100) {
          setIsRevealing(false)
          checkRevealStatus()
          return
        }

        // Create a more natural brush stroke pattern
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = Math.min(canvas.width, canvas.height) * 0.4
        const angle = (revealPercentage / 100) * Math.PI * 2

        // Calculate position along a spiral
        const x = centerX + Math.cos(angle * 3) * radius * (revealPercentage / 100)
        const y = centerY + Math.sin(angle * 2) * radius * 0.5

        // Draw a brush stroke
        ctx.globalCompositeOperation = "destination-out"
        ctx.beginPath()
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
        ctx.fill()

        // Add some random smaller strokes for texture
        for (let i = 0; i < 3; i++) {
          const offsetX = x + (Math.random() * brushSize - brushSize / 2)
          const offsetY = y + (Math.random() * brushSize - brushSize / 2)
          ctx.beginPath()
          ctx.arc(offsetX, offsetY, brushSize / 4, 0, Math.PI * 2)
          ctx.fill()
        }

        // Increment reveal percentage
        setRevealPercentage((prev) => {
          const newValue = Math.min(prev + 0.8, 100) // Faster increment
          return newValue
        })

        animationFrame = requestAnimationFrame(autoReveal)
      }

      animationFrame = requestAnimationFrame(autoReveal)

      return () => {
        cancelAnimationFrame(animationFrame)
      }
    }

    // Draw a brush stroke from (x1, y1) to (x2, y2)
    const drawBrushStroke = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Add some texture with smaller strokes
      for (let i = 0; i < 2; i++) {
        const offsetX1 = x1 + (Math.random() * brushSize / 2 - brushSize / 4)
        const offsetY1 = y1 + (Math.random() * brushSize / 2 - brushSize / 4)
        const offsetX2 = x2 + (Math.random() * brushSize / 2 - brushSize / 4)
        const offsetY2 = y2 + (Math.random() * brushSize / 2 - brushSize / 4)

        ctx.beginPath()
        ctx.moveTo(offsetX1, offsetY1)
        ctx.lineTo(offsetX2, offsetY2)
        ctx.stroke()
      }

      // Check if title is fully revealed after manual interaction
      checkRevealStatus()
    }

    // Mouse/touch event handlers
    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing = true
      const { x, y } = getPointerPosition(e)
      lastX = x
      lastY = y

      // Stop auto-revealing when user interacts
      setIsRevealing(false)
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return

      const { x, y } = getPointerPosition(e)
      drawBrushStroke(lastX, lastY, x, y)
      lastX = x
      lastY = y
    }

    const stopDrawing = () => {
      isDrawing = false
    }

    // Get pointer position relative to canvas
    const getPointerPosition = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()

      if ("touches" in e && e.touches?.[0]) {
        // Touch event
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        }
      } else if ("clientX" in e) {
        // Mouse event
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
      }

      // Fallback if neither condition is met
      return { x: 0, y: 0 }
    }

    // Add event listeners
    canvas.addEventListener("mousedown", startDrawing)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", stopDrawing)
    canvas.addEventListener("mouseleave", stopDrawing)
    canvas.addEventListener("touchstart", startDrawing)
    canvas.addEventListener("touchmove", draw)
    canvas.addEventListener("touchend", stopDrawing)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      canvas.removeEventListener("mousedown", startDrawing)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", stopDrawing)
      canvas.removeEventListener("mouseleave", stopDrawing)
      canvas.removeEventListener("touchstart", startDrawing)
      canvas.removeEventListener("touchmove", draw)
      canvas.removeEventListener("touchend", stopDrawing)
    }
  }, [isRevealing, revealPercentage, isFullyRevealed, isClient])

  useEffect(() => {
    // Add a subtle animation to indicate interactivity
    if (!isRevealing && !isFullyRevealed) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Draw a subtle hint animation
      const hintAnimation = () => {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        ctx.globalCompositeOperation = "destination-out"
        ctx.beginPath()
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2)
        ctx.fill()

        // Add some dust particles
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2
          const distance = Math.random() * 40 + 20
          const x = centerX + Math.cos(angle) * distance
          const y = centerY + Math.sin(angle) * distance

          ctx.beginPath()
          ctx.arc(x, y, Math.random() * 5 + 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Show hint after a short delay
      const timeout = setTimeout(hintAnimation, 2000)
      return () => clearTimeout(timeout)
    }
  }, [isRevealing, isFullyRevealed])

  // Add a button to reset the reveal state (for testing)
  const resetReveal = () => {
    sessionStorage.removeItem('artTitleRevealed')
    window.location.reload()
  }

  // Render a simple placeholder during SSR
  if (!isClient) {
    return (
      <div className="flex items-center justify-center p-4 pt-20 pb-8">
        <div className="relative">
          <div className="relative text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 py-4 px-6">
              Art Prompt Collection
            </h1>
          </div>
        </div>
      </div>
    )
  }

  // Client-side render with full functionality
  return (
    <div className="flex items-center justify-center p-4 pt-20 pb-8">
      <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <div ref={titleRef} className="relative text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 py-4 px-6">
            Art Prompt Collection
          </h1>
          <motion.p
            className="text-lg md:text-xl text-gray-600 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isFullyRevealed ? 1 : 0, y: isFullyRevealed ? 0 : 10 }}
            transition={{ duration: 0.8 }}
          >
            Reveal the beauty beneath
          </motion.p>
        </div>
        <canvas ref={canvasRef} className="absolute inset-0 cursor-pointer" />

        {!isRevealing && !isFullyRevealed && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-gray-500 text-sm">Move your cursor or finger across the title to reveal it</p>
          </motion.div>
        )}

        {isFullyRevealed && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link href="#artworks">
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-md text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => {
                  document.getElementById('artworks')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Explore Collection
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Uncomment this for testing if you need to reset the reveal state */}
        <div className="absolute bottom-0 right-0 p-2">
          <button
            onClick={resetReveal}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Reset
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function HomePage() {
  const { data: artworks, isLoading } = api.art.getAll.useQuery();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
      <ParticleBackground />

      <main className="relative z-10 flex flex-col">
        {/* Title section at the top */}
        <PaintbrushTitle />

        {/* Create Your Art button */}
        <div className="flex justify-center my-8">
          <Link href="/create">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-md text-lg shadow-lg">
              Create Your Art
            </Button>
          </Link>
        </div>

        {/* Artwork section */}
        <div id="artworks" className="container mx-auto px-4 py-8 md:py-12">
          <motion.h2
            className="text-3xl md:text-4xl font-light text-gray-900 dark:text-gray-100 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Featured Artworks
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {isLoading ? (
              // Loading placeholders
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              ))
            ) : artworks && artworks.length > 0 ? (
              // Actual artworks
              artworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  className="relative aspect-[4/3] group cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={
                      typeof artwork.config === 'object' &&
                        artwork.config !== null &&
                        'imageUrl' in artwork.config
                        ? (artwork.config as any).imageUrl
                        : "/placeholder.svg"
                    }
                    alt={artwork.title || "Artwork"}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="absolute bottom-0 left-0 right-0 p-6 text-white text-lg font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {artwork.title || "Untitled Artwork"}
                  </p>
                </motion.div>
              ))
            ) : (
              // Fallback content if no artworks
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No artworks found. Create your first masterpiece!</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}