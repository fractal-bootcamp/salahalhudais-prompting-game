"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"

interface ArtCanvasProps {
  color: string
  brushSize: number
  tool: string
  onCanvasChange?: (dataUrl: string | null) => void
}

export function ArtCanvas({ color, brushSize, tool, onCanvasChange }: ArtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match its display size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (canvas.width !== width || canvas.height !== height) {
        const ratio = window.devicePixelRatio || 1
        canvas.width = width * ratio
        canvas.height = height * ratio
        ctx.scale(ratio, ratio)

        // Fill with white background
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Notify parent component of canvas change
        if (onCanvasChange) {
          onCanvasChange(canvas.toDataURL())
        }
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [onCanvasChange])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)

    // Get position
    const position = getEventPosition(e, canvas)
    setLastPosition(position)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get current position
    const currentPosition = getEventPosition(e, canvas)

    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = brushSize

    if (tool === "eraser") {
      ctx.strokeStyle = "white"
      ctx.globalCompositeOperation = "source-over"
    } else {
      ctx.strokeStyle = color
      ctx.globalCompositeOperation = "source-over"
    }

    if (tool === "line") {
      // For line tool, we'll just draw a preview line
      const { width, height } = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1

      // Clear canvas and redraw background
      ctx.clearRect(0, 0, width * ratio, height * ratio)
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, width * ratio, height * ratio)

      // Draw the line
      ctx.beginPath()
      ctx.moveTo(lastPosition.x, lastPosition.y)
      ctx.lineTo(currentPosition.x, currentPosition.y)
      ctx.stroke()
    } else {
      // For brush and eraser, draw continuously
      ctx.beginPath()
      ctx.moveTo(lastPosition.x, lastPosition.y)
      ctx.lineTo(currentPosition.x, currentPosition.y)
      ctx.stroke()

      setLastPosition(currentPosition)
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)

    // Notify parent component of canvas change
    if (onCanvasChange && canvasRef.current) {
      onCanvasChange(canvasRef.current.toDataURL())
    }
  }

  const getEventPosition = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[500px] touch-none"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  )
}

