'use client'

import { useState, FormEvent } from 'react'
import Script from 'next/script'
import { motion } from 'framer-motion'
import { generateStructuredData } from '@/lib/seo'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    eventDate: '',
    location: '',
    message: '',
    honeypot: '', // Spam protection
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Honeypot check
    if (formData.honeypot) {
      return // Bot detected
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          organization: formData.organization || undefined,
          eventDate: formData.eventDate || undefined,
          location: formData.location || undefined,
          message: formData.message,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          organization: '',
          eventDate: '',
          location: '',
          message: '',
          honeypot: '',
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const pageData = generateStructuredData('WebPage', {
    name: 'Contact | The Band Project',
    description: 'Contact The Band Project for booking inquiries and general information.',
    path: '/contact',
  })

  return (
    <>
      <Script
        id="contact-page-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData) }}
      />

      {/* LLM-Friendly Summary Block */}
      <section className="sr-only">
        <h2>Contact The Band Project</h2>
        <p>
          To book The Band Project for your event or venue, use our contact form. We accept
          booking inquiries for performances in the greater New York Tri-State area (New York, New Jersey, and Connecticut). Include your name, email,
          organization, event date, venue location, and message details. We respond to all
          inquiries promptly.
        </p>
      </section>

      <div className="pt-32 pb-24 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-6 uppercase">Contact</h1>
            <p className="text-xl text-secondary">
              Booking inquiries and general information
            </p>
          </header>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Honeypot Field (hidden) */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm uppercase tracking-wider mb-2">
                Name <span className="text-secondary">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-white focus:outline-none transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm uppercase tracking-wider mb-2">
                Email <span className="text-secondary">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-white focus:outline-none transition-colors"
              />
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="organization" className="block text-sm uppercase tracking-wider mb-2">
                Organization
              </label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-white focus:outline-none transition-colors"
              />
            </div>

            {/* Event Date */}
            <div>
              <label htmlFor="eventDate" className="block text-sm uppercase tracking-wider mb-2">
                Event Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-black border border-white/20 text-white focus:border-white focus:outline-none transition-colors [color-scheme:dark]"
                  aria-describedby="eventDate-hint"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    const el = document.getElementById('eventDate') as HTMLInputElement | null
                    if (el?.showPicker) el.showPicker()
                    else el?.focus()
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-1"
                  aria-label="Open calendar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </button>
              </div>
              <p id="eventDate-hint" className="text-secondary text-sm mt-1">Click the field to open the calendar</p>
            </div>

            {/* Venue / City */}
            <div>
              <label htmlFor="location" className="block text-sm uppercase tracking-wider mb-2">
                Venue / City
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-white focus:outline-none transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm uppercase tracking-wider mb-2">
                Message <span className="text-secondary">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-white focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-4 bg-white text-black font-medium uppercase tracking-wider text-sm hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white/10 border border-white/20"
              >
                <p className="text-white">Thank you! Your message has been sent. We&apos;ll get back to you soon.</p>
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-900/20 border border-red-500/50"
              >
                <p className="text-red-400">There was an error submitting your message. Please try again.</p>
              </motion.div>
            )}
          </motion.form>
        </div>
      </div>
    </>
  )
}
