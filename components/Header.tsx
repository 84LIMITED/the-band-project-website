'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useMediaDrawer } from './MediaDrawerProvider'

export default function Header() {
  const { openDrawer } = useMediaDrawer()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Background', href: '/background' },
    { label: 'Shows', href: '/shows' },
    { label: 'Contact', href: '/contact' },
    { label: 'Gear Store', href: '/gear' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black' : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between h-20">
            {/* Left: Logo */}
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/images/the-band-project-logo.png"
                alt="The Band Project"
                width={250}
                height={75}
                priority
                className="h-[60px] w-auto"
                style={{ objectFit: 'contain' }}
              />
            </Link>

            {/* Center: Navigation Links */}
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group text-sm uppercase tracking-wider"
                >
                  <span className={isActive(item.href) ? 'opacity-100' : 'opacity-70 group-hover:opacity-100 transition-opacity'}>
                    {item.label}
                  </span>
                  {isActive(item.href) && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-px bg-white"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  {!isActive(item.href) && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-px bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right: Watch Button and Social Icons */}
            <div className="flex items-center gap-6">
              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a
                  href="https://www.facebook.com/people/The-Band-Project/61584822961295/#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Facebook"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/thebandprojectnj/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Instagram"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
              <button
                onClick={openDrawer}
                className="flex items-center gap-2 text-sm uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Watch media"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-between h-16">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/images/the-band-project-logo.png"
                alt="The Band Project"
                width={150}
                height={45}
                priority
                className="h-10 w-auto"
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <motion.span
                className="w-6 h-px bg-white"
                animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-6 h-px bg-white"
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="w-6 h-px bg-white"
                animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.nav
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-2xl uppercase tracking-wider ${
                      isActive(item.href) ? 'opacity-100' : 'opacity-70'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  openDrawer()
                }}
                className="mt-8 text-lg uppercase tracking-wider opacity-70"
              >
                Watch
              </motion.button>
              {/* Social Icons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-6 mt-12"
              >
                <a
                  href="https://www.facebook.com/people/The-Band-Project/61584822961295/#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Facebook"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/thebandprojectnj/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Instagram"
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
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
