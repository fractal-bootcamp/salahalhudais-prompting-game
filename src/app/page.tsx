"use client"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "~/components/ui/button"
import { ParticleBackground } from "~/components/particle-background"
import { api } from "~/trpc/react"
import { GalleryGrid } from "~/components/gallery-grid"
import { PaintbrushTitle } from "~/components/PaintBrushCanvas"

export default function HomePage() {
  const { data: artworks, isLoading } = api.art.getAll.useQuery();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
      <ParticleBackground />

      <main className="relative z-10">
        <PaintbrushTitle />
        
        <div id="artworks" className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex justify-center mt-8 mb-16">
            <a 
              href="/create" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Create Your Art
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading amazing artwork...</p>
              </div>
            ) : artworks && artworks.length > 0 ? (
              <GalleryGrid artworks={artworks} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No artwork found. Be the first to create!</p>
                <Link href="/create">
                  <Button>Create Artwork</Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

