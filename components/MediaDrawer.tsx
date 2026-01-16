'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MediaItem } from '@/lib/schema'

interface MediaDrawerProps {
  isOpen: boolean
  onClose: () => void
  mediaItems: MediaItem[]
}

export default function MediaDrawer({ isOpen, onClose, mediaItems }: MediaDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-black z-50 overflow-y-auto"
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-medium uppercase tracking-wider">Watch</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:opacity-70 transition-opacity"
                  aria-label="Close drawer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Media Grid */}
              <div className="space-y-8">
                {mediaItems.map((item) => (
                  <div key={item.id} className="space-y-4">
                    {item.type === 'video' ? (
                      <video
                        className="w-full"
                        controls
                        poster={item.thumbnail}
                        preload="metadata"
                      >
                        <source src={item.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="relative w-full aspect-video">
                        <Image
                          src={item.url}
                          alt={item.description || item.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-secondary">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
