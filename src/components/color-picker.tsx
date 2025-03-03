"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  "#2F4F4F", // Dark Slate Gray
  "#556B2F", // Dark Olive Green
  "#8B4513", // Saddle Brown
  "#696969", // Dim Gray
  "#4682B4", // Steel Blue
  "#4B0082", // Indigo
  "#800000", // Maroon
  "#000000", // Black
  "#A0522D", // Sienna
  "#6B8E23", // Olive Drab
  "#483D8B", // Dark Slate Blue
  "#3CB371", // Medium Sea Green
  "#B8860B", // Dark Goldenrod
  "#BDB76B", // Dark Khaki
  "#CD853F", // Peru
  "#DAA520", // Goldenrod
]

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full h-10 p-1" style={{ backgroundColor: color }}>
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              className="w-10 h-10 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              style={{ backgroundColor: presetColor }}
              onClick={() => {
                onChange(presetColor)
                setOpen(false)
              }}
              aria-label={`Select color ${presetColor}`}
            />
          ))}
        </div>
        <div className="flex items-center mt-4">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10"
            id="custom-color"
          />
          <label htmlFor="custom-color" className="ml-2 text-sm text-gray-600">
            Custom color
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}

