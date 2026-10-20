'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { Show } from '@/lib/schema'
import { buildGoogleCalendarUrl, downloadIcs, hasValidShowDate } from '@/lib/calendar'

interface AddToCalendarProps {
  show: Show
}

export default function AddToCalendar({ show }: AddToCalendarProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const googleUrl = buildGoogleCalendarUrl(show)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!hasValidShowDate(show) || !googleUrl) return null

  const label = `Add ${show.venue} to calendar`

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="w-full px-6 py-3 border border-white text-white font-medium uppercase tracking-wider text-sm text-center hover:bg-white hover:text-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Add to Calendar
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className="absolute left-0 right-0 z-20 mt-2 border border-white bg-black"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              downloadIcs(show)
              setOpen(false)
            }}
            className="block w-full px-4 py-3 text-left text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
          >
            Apple / Outlook (.ics)
          </button>
          <a
            role="menuitem"
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block w-full px-4 py-3 text-left text-sm uppercase tracking-wider border-t border-white/20 hover:bg-white hover:text-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
          >
            Google Calendar
          </a>
        </div>
      )}
    </div>
  )
}
