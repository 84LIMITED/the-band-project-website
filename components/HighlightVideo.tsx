'use client'

import { useEffect, useRef } from 'react'
import type { MediaItem } from '@/lib/schema'
import { IMAGE_VIDEO_ALT_TITLE } from '@/lib/seo'

interface HighlightVideoProps {
  item: MediaItem
}

export default function HighlightVideo({ item }: HighlightVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const vertical = item.orientation === 'vertical'

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.6 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      className={
        vertical
          ? 'aspect-[9/16] w-full max-w-sm object-cover bg-black'
          : 'aspect-video w-full object-cover bg-black'
      }
      playsInline
      muted
      loop
      controls
      poster={item.thumbnail}
      preload="metadata"
      title={IMAGE_VIDEO_ALT_TITLE}
    >
      <source src={item.url} type="video/mp4" />
    </video>
  )
}
