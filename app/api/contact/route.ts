import { NextResponse } from 'next/server'
import { saveContactMessage, sendContactEmail } from '@/lib/aws'
import { ContactMessage } from '@/lib/schema'

// Simple rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 60 * 1000 }) // 1 hour window
    return true
  }

  if (limit.count >= 5) {
    // Max 5 submissions per hour
    return false
  }

  limit.count++
  return true
}

export async function POST(request: Request) {
  try {
    // Get client IP (in production, use proper IP extraction)
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown'

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, organization, eventDate, location, message } = body

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const contactMessage: ContactMessage = {
      name,
      email,
      organization: organization || undefined,
      eventDate: eventDate || undefined,
      location: location || undefined,
      message,
    }

    // Save to DynamoDB
    try {
      await saveContactMessage(contactMessage)
    } catch (error) {
      console.error('Error saving to DynamoDB:', error)
      // Continue even if DynamoDB fails
    }

    // Send email via SES
    try {
      await sendContactEmail(contactMessage)
    } catch (error) {
      console.error('Error sending email:', error)
      // Still return success if email fails (message is saved)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
