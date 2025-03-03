"use client"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "~/components/ui/button"
import { ParticleBackground } from "~/components/particle-background"
import { api } from "~/trpc/react"
import { GalleryGrid } from "~/components/gallery-grid"

export default function HomePage() {
  const { data: artworks, isLoading } = api.art.getAll.useQuery();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
      <ParticleBackground />

      <main className="relative z-10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <motion.h1
              className="text-4xl md:text-6xl font-light text-gray-900 dark:text-gray-100 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Artistry Collection
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              A curated collection of exceptional art pieces from talented artists around the world
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/create">
                <Button className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white px-8 py-6 rounded-lg text-lg">
                  Create Your Art
                </Button>
              </Link>
            </motion.div>
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

