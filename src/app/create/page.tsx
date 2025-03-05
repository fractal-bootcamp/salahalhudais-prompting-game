"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ArtCanvas } from "~/components/art/art-canvas";
import { ColorPicker } from "~/components/color-picker"
import { ArrowLeft, Download, Save } from "lucide-react"
import { ParticleBackground } from "~/components/particle-background"
import { motion } from "framer-motion"
import { api } from "~/trpc/react"
import { useRouter } from "next/navigation"

export default function CreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState("My Artwork")
  const [color, setColor] = useState("#2F4F4F")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState("brush")
  const [canvasData, setCanvasData] = useState<string | null>(null)

  const createArt = api.art.create.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title for your artwork");
      return;
    }

    createArt.mutate({
      title: title,
      config: {
        color,
        brushSize,
        canvasData
      },
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
      <ParticleBackground />

      <main className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-12">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Gallery
              </Button>
            </Link>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (canvasData) {
                    const link = document.createElement("a")
                    link.download = "artwork.png"
                    link.href = canvasData
                    link.click()
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={handleSave}
                disabled={createArt.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createArt.isPending ? "Saving..." : "Save to Gallery"}
              </Button>
            </div>
          </div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Title</h3>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter artwork title"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Color</h3>
                    <ColorPicker color={color} onChange={setColor} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Brush Size: {brushSize}px</h3>
                    <Slider
                      value={[brushSize]}
                      min={1}
                      max={50}
                      step={1}
                      onValueChange={(value) => setBrushSize(value[0] ?? brushSize)}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Tool</h3>
                    <Tabs defaultValue="brush" onValueChange={setTool}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="brush">Brush</TabsTrigger>
                        <TabsTrigger value="line">Line</TabsTrigger>
                        <TabsTrigger value="eraser">Eraser</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
                <ArtCanvas color={color} brushSize={brushSize} tool={tool} onCanvasChange={setCanvasData} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

