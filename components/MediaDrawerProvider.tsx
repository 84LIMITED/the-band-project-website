'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import MediaDrawer from './MediaDrawer'
import { MediaItem } from '@/lib/schema'
import mediaData from '@/content/media.json'

interface MediaDrawerContextType {
  openDrawer: () => void
  closeDrawer: () => void
  isOpen: boolean
}

const MediaDrawerContext = createContext<MediaDrawerContextType | undefined>(undefined)

export function useMediaDrawer() {
  const context = useContext(MediaDrawerContext)
  if (!context) {
    throw new Error('useMediaDrawer must be used within MediaDrawerProvider')
  }
  return context
}

export function MediaDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const mediaItems = mediaData as MediaItem[]

  const openDrawer = () => setIsOpen(true)
  const closeDrawer = () => setIsOpen(false)

  return (
    <MediaDrawerContext.Provider value={{ openDrawer, closeDrawer, isOpen }}>
      {children}
      <MediaDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        mediaItems={mediaItems}
      />
    </MediaDrawerContext.Provider>
  )
}
