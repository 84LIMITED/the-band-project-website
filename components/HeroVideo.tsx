'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface HeroVideoProps {
  videoSrc: string
  videoSrcMobile?: string // Optional low-res version for mobile
  posterSrc: string
  title: string
  tagline: string
  logoSrc?: string // Optional logo image to replace title text
  onWatchClick?: () => void
  onShowsClick?: () => void
}

export default function HeroVideo({
  videoSrc,
  videoSrcMobile,
  posterSrc,
  title,
  tagline,
  logoSrc,
  onWatchClick,
  onShowsClick,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Set video source based on screen size
      const setVideoSource = () => {
        if (videoSrcMobile && window.innerWidth <= 768) {
          video.src = videoSrcMobile
        } else {
          video.src = videoSrc
        }
        video.load()
      }

      setVideoSource()
      
      // Update on resize
      const handleResize = () => {
        setVideoSource()
      }
      window.addEventListener('resize', handleResize)

      video.play().catch(() => {
        // Autoplay failed, user interaction required
      })

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [videoSrc, videoSrcMobile])

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        poster={posterSrc}
        playsInline
        muted
        loop
        autoPlay
        onLoadedData={() => setIsLoaded(true)}
      >
        Your browser does not support the video tag.
      </video>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl"
        >
          {logoSrc ? (
            <div className="mb-6">
              <Image
                src={logoSrc}
                alt={title}
                width={1200}
                height={360}
                priority
                className="w-auto h-40 md:h-56 lg:h-72 mx-auto"
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : (
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight uppercase">
              {title}
            </h1>
          )}
          <p className="text-xl md:text-2xl text-secondary mb-12 font-extrabold uppercase">
            {tagline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShowsClick}
              className="px-8 py-4 bg-white text-black font-medium uppercase tracking-wider text-sm hover:bg-secondary transition-colors"
            >
              See Upcoming Shows
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onWatchClick}
              className="px-8 py-4 border-2 border-white text-white font-medium uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-colors"
            >
              Watch Highlights
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
