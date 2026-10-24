import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import {
  CONFIGURATION_SET,
  FROM_NAME,
  LOGO_URL,
  awsRegion,
  fromEmailAddress,
  replyToAddress,
  siteBaseUrl,
} from '@/lib/newsletter-config'
import { subscribersTable } from '@/lib/subscribers'

export interface OutboundEmail {
  to: string
  subject: string
  html: string
  text: string
  unsubscribeUrl?: string
  unsubscribeApiUrl?: string
  useConfigurationSet?: boolean
}

function client(): SESv2Client {
  return new SESv2Client({ region: awsRegion() })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function confirmPageUrl(email: string, token: string): string {
  const params = new URLSearchParams({ e: email, t: token })
  return `${siteBaseUrl()}/newsletter/confirm?${params.toString()}`
}

export function unsubscribePageUrl(email: string, token: string): string {
  const params = new URLSearchParams({ e: email, t: token })
  return `${siteBaseUrl()}/unsubscribe?${params.toString()}`
}

export function unsubscribeApiUrl(email: string, token: string): string {
  const params = new URLSearchParams({ e: email, t: token })
  return `${siteBaseUrl()}/api/unsubscribe?${params.toString()}`
}

function confirmationHtml(confirmUrl: string, unsubscribeUrl: string): string {
  const safeConfirm = escapeHtml(confirmUrl)
  const safeUnsubscribe = escapeHtml(unsubscribeUrl)
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
  :root { color-scheme: dark; }
  @media (prefers-color-scheme: dark) {
    .btn, .btn span { color:#FFFFFF !important; -webkit-text-fill-color:#FFFFFF !important; }
  }
</style>
<title>Confirm your email for The Band Project</title>
</head>
<body bgcolor="#000000" style="margin:0;padding:0;background-color:#000000;color:#FFFFFF;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color:#000000;color:#FFFFFF;">
  <tr>
    <td align="center" bgcolor="#000000" style="padding:32px 16px;background-color:#000000;color:#FFFFFF;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="width:100%;max-width:600px;background-color:#000000;color:#FFFFFF;">
        <tr>
          <td align="center" bgcolor="#000000" style="padding:0 0 24px 0;background-color:#000000;color:#FFFFFF;">
            <img src="${LOGO_URL}" width="96" height="96" alt="The Band Project" style="display:block;border:0;outline:none;text-decoration:none;width:96px;height:96px;background-color:#000000;">
          </td>
        </tr>
        <tr>
          <td bgcolor="#000000" style="font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:28px;line-height:1.3;font-weight:700;color:#FFFFFF;background-color:#000000;padding:0 0 16px 0;">Confirm your email</td>
        </tr>
        <tr>
          <td bgcolor="#000000" style="font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#BDBDBD;background-color:#000000;padding:0 0 8px 0;">Tap the button to get show reminders from The Band Project. We send 8-10 emails a year.</td>
        </tr>
        <tr>
          <td align="center" bgcolor="#000000" style="background-color:#000000;color:#FFFFFF;padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto;">
              <tr>
                <td align="center" bgcolor="#000000" style="background-color:#000000;border:2px solid #FFFFFF;border-radius:4px;">
                  <a href="${safeConfirm}" target="_blank" class="btn" style="display:inline-block;padding:14px 32px;font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;-webkit-text-fill-color:#FFFFFF;text-decoration:none;">
                    <span style="color:#FFFFFF;-webkit-text-fill-color:#FFFFFF;">Confirm my email</span>
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" bgcolor="#000000" style="font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#BDBDBD;background-color:#000000;padding:0 0 28px 0;">
            <p style="margin:0 0 8px 0;color:#BDBDBD;background-color:#000000;">Button not working? Paste this link into your browser:</p>
            <a href="${safeConfirm}" target="_blank" style="color:#FFFFFF;background-color:#000000;text-decoration:underline;">${safeConfirm}</a>
          </td>
        </tr>
        <tr>
          <td bgcolor="#000000" style="font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#BDBDBD;background-color:#000000;padding:0 0 0 0;">If you didn't sign up, ignore this email and you won't hear from us.</td>
        </tr>
        <tr>
          <td bgcolor="#000000" style="font-family:Montserrat,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#BDBDBD;background-color:#000000;padding:16px 0 0 0;"><a href="${safeUnsubscribe}" target="_blank" style="color:#FFFFFF;background-color:#000000;">Unsubscribe</a></td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function confirmationText(confirmUrl: string, unsubscribeUrl: string): string {
  return `Confirm your email for The Band Project

Tap the link to get show reminders. We send 8-10 emails a year.

Confirm my email: ${confirmUrl}

Button not working? Paste this link into your browser:
${confirmUrl}

If you didn't sign up, ignore this email and you won't hear from us.

Unsubscribe: ${unsubscribeUrl}
`
}

export async function sendEmail(message: OutboundEmail): Promise<void> {
  const from = fromEmailAddress()
  if (!from) {
    throw new Error('NEWSLETTER_FROM_EMAIL is unset')
  }

  const headers = []
  if (message.unsubscribeApiUrl) {
    headers.push({
      Name: 'List-Unsubscribe',
      Value: `<${message.unsubscribeApiUrl}>, <mailto:${replyToAddress()}?subject=unsubscribe>`,
    })
    headers.push({
      Name: 'List-Unsubscribe-Post',
      Value: 'List-Unsubscribe=One-Click',
    })
  }

  await client().send(
    new SendEmailCommand({
      FromEmailAddress: `${FROM_NAME} <${from}>`,
      Destination: { ToAddresses: [message.to] },
      ReplyToAddresses: [replyToAddress()],
      ConfigurationSetName: message.useConfigurationSet === false ? undefined : CONFIGURATION_SET,
      Content: {
        Simple: {
          Subject: { Data: message.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: message.html, Charset: 'UTF-8' },
            Text: { Data: message.text, Charset: 'UTF-8' },
          },
          Headers: headers.length > 0 ? headers : undefined,
        },
      },
    })
  )
}

/**
 * Send the double opt-in message. When SES is not configured, log the confirm
 * link and return true so local development can finish the flow.
 */
export async function sendConfirmationEmail(
  email: string,
  confirmToken: string,
  unsubscribeToken: string
): Promise<boolean> {
  const confirmUrl = confirmPageUrl(email, confirmToken)
  const unsubscribeUrl = unsubscribePageUrl(email, unsubscribeToken)
  const apiUrl = unsubscribeApiUrl(email, unsubscribeToken)

  if (!subscribersTable() || !fromEmailAddress()) {
    console.info(`[newsletter] Confirmation link for ${email}: ${confirmUrl}`)
    return true
  }

  try {
    await sendEmail({
      to: email,
      subject: 'Confirm your email for The Band Project',
      html: confirmationHtml(confirmUrl, unsubscribeUrl),
      text: confirmationText(confirmUrl, unsubscribeUrl),
      unsubscribeUrl,
      unsubscribeApiUrl: apiUrl,
    })
    return true
  } catch (error) {
    console.error('[newsletter] Confirmation email failed', error)
    return false
  }
}
