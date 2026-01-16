import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({
  region: process.env.AMPLIFY_REGION || 'us-east-1',
})

const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient)

const sesClient = new SESClient({
  region: process.env.AMPLIFY_REGION || 'us-east-1',
})

// DynamoDB table names
const SHOWS_TABLE = process.env.SHOWS_TABLE || 'the-band-project-shows'
const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'the-band-project-messages'

// Contact form email configuration
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'contact@thebandproject.com'

export async function getUpcomingShows(): Promise<any[]> {
  try {
    const command = new QueryCommand({
      TableName: SHOWS_TABLE,
      IndexName: 'upcoming-shows-index', // GSI for filtering upcoming shows
      KeyConditionExpression: 'isUpcoming = :upcoming',
      ExpressionAttributeValues: {
        ':upcoming': 'true', // DynamoDB uses String for boolean values in keys
      },
      ScanIndexForward: true, // Sort ascending by date
    })

    const response = await dynamoDocClient.send(command)
    return response.Items || []
  } catch (error) {
    console.error('Error fetching shows:', error)
    // Fallback to static data if DynamoDB fails
    return []
  }
}

export async function saveContactMessage(message: any): Promise<void> {
  try {
    const item = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...message,
      createdAt: new Date().toISOString(),
    }

    const command = new PutCommand({
      TableName: MESSAGES_TABLE,
      Item: item,
    })

    await dynamoDocClient.send(command)
  } catch (error) {
    console.error('Error saving message:', error)
    throw error
  }
}

export async function sendContactEmail(message: any): Promise<void> {
  try {
    const emailBody = `
New contact form submission from The Band Project website:

Name: ${message.name}
Email: ${message.email}
${message.organization ? `Organization: ${message.organization}` : ''}
${message.eventDate ? `Event Date: ${message.eventDate}` : ''}
${message.location ? `Location: ${message.location}` : ''}

Message:
${message.message}
    `.trim()

    const command = new SendEmailCommand({
      Source: CONTACT_EMAIL,
      Destination: {
        ToAddresses: [CONTACT_EMAIL],
      },
      Message: {
        Subject: {
          Data: `New Contact Form Submission from ${message.name}`,
        },
        Body: {
          Text: {
            Data: emailBody,
          },
        },
      },
    })

    await sesClient.send(command)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
