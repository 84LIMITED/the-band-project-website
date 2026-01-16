# AWS Setup Instructions for The Band Project Website

This guide walks you through setting up all AWS services required for the website. Configure these in AWS Amplify's environment variables section.

## 📋 Prerequisites

- AWS Account
- AWS CLI installed (optional, for testing)
- Access to AWS Console

---

## 1️⃣ DynamoDB Tables

### Shows Table

1. **Navigate to DynamoDB Console**
   - Go to AWS Console → DynamoDB → Tables → Create table

2. **Table Configuration**
   - **Table name**: `the-band-project-shows`
   - **Partition key**: `id` (String)
   - **Table settings**: Use default settings
   - Click **Create table**

3. **Create Global Secondary Index (GSI)**
   - After table creation, go to **Indexes** tab
   - Click **Create index**
   - **Index name**: `upcoming-shows-index` (simpler name with hyphens)
   - **Partition key**: `isUpcoming` (String) ⚠️ Use String, not Boolean
   - **Sort key**: `date` (String)
   - Click **Create index**
   
   **Important:** DynamoDB doesn't support Boolean as a key type. Use String and store values as `"true"` or `"false"`.

4. **Add Sample Data (Optional)**
   ```json
   {
     "id": "show-1",
     "date": "2024-06-15",
     "venue": "The Grand Theater",
     "city": "Los Angeles",
     "state": "CA",
     "time": "8:00 PM",
     "doors": "7:00 PM",
     "ticketUrl": "https://example.com/tickets/show-1",
     "isUpcoming": true
   }
   ```

### Messages Table

1. **Create Table**
   - **Table name**: `the-band-project-messages`
   - **Partition key**: `id` (String)
   - **Table settings**: Use default settings
   - Click **Create table**

2. **No GSI needed** for messages table

---

## 2️⃣ AWS SES (Simple Email Service)

### Step 1: Verify Your Domain

1. **Navigate to SES Console**
   - Go to AWS Console → SES → Verified identities

2. **Create Identity**
   - Click **Create identity**
   - Select **Domain**
   - Enter your domain: `thebandproject.com`
   - Click **Create identity**

3. **Add DNS Records**
   - SES will provide DNS records (CNAME records)
   - Add these to your domain's DNS settings (Route 53 or your DNS provider)
   - Wait for verification (can take up to 72 hours)

### Step 2: Verify Email Address (Alternative)

If you prefer to verify just an email address:

1. **Create Identity**
   - Click **Create identity**
   - Select **Email address**
   - Enter: `contact@thebandproject.com`
   - Click **Create identity**

2. **Check Email**
   - Check the inbox for verification email
   - Click the verification link

### Step 3: Request Production Access (If Needed)

- By default, SES is in "Sandbox" mode (can only send to verified emails)
- To send to any email, request production access:
  - Go to **Account dashboard**
  - Click **Request production access**
  - Fill out the form and submit

### Step 4: Get Out of Sandbox (Optional)

If you need to send to unverified emails:
1. Go to **Account dashboard**
2. Click **Request production access**
3. Fill out the use case form
4. Wait for approval (usually 24-48 hours)

---

## 3️⃣ IAM Role for AWS Amplify

### Create IAM Role

1. **Navigate to IAM Console**
   - Go to AWS Console → IAM → Roles → Create role

2. **Select Trusted Entity**
   - Select **AWS service**
   - Choose **Amplify** (or **Lambda** if using Lambda functions)

3. **Attach Policies**
   - Click **Create policy**
   - Switch to **JSON** tab
   - Paste the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:GetItem",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/the-band-project-shows",
        "arn:aws:dynamodb:*:*:table/the-band-project-shows/index/*",
        "arn:aws:dynamodb:*:*:table/the-band-project-messages"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

4. **Name the Policy**
   - Name: `TheBandProjectWebsitePolicy`
   - Click **Create policy**

5. **Attach to Role**
   - Go back to role creation
   - Search for and select `TheBandProjectWebsitePolicy`
   - Name the role: `TheBandProjectWebsiteRole`
   - Click **Create role**

---

## 4️⃣ AWS Amplify Environment Variables

### Configure in Amplify Console

1. **Navigate to Amplify App**
   - Go to AWS Amplify Console → Your App → Environment variables

2. **Add Environment Variables**

Add these variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NEXT_PUBLIC_BASE_URL` | `https://thebandproject.com` | Your website URL |
| `AMPLIFY_REGION` | `us-east-1` | AWS region (change if different) |
| `SHOWS_TABLE` | `the-band-project-shows` | DynamoDB shows table name |
| `MESSAGES_TABLE` | `the-band-project-messages` | DynamoDB messages table name |
| `CONTACT_EMAIL` | `contact@thebandproject.com` | Email for contact form |

3. **Attach IAM Role**
   - Go to **App settings** → **General**
   - Under **Service role**, select `TheBandProjectWebsiteRole`
   - Save changes

---

## 5️⃣ Route 53 DNS (If Using Custom Domain)

### Configure DNS

1. **Navigate to Route 53**
   - Go to AWS Console → Route 53 → Hosted zones

2. **Create Hosted Zone** (if not exists)
   - Click **Create hosted zone**
   - Domain name: `thebandproject.com`
   - Click **Create**

3. **Get Amplify Domain**
   - In Amplify Console → App settings → Domain management
   - Copy the CloudFront distribution domain

4. **Create DNS Records**
   - In Route 53, create an **A record** (or **CNAME**):
     - **Name**: `@` (or leave blank for root domain)
     - **Type**: `A` (or `CNAME` if using subdomain)
     - **Alias**: Yes
     - **Alias target**: Select your Amplify app
     - Click **Create**

5. **Wait for Propagation**
   - DNS changes can take 24-48 hours to propagate

---

## 6️⃣ Testing Your Setup

### Test DynamoDB

1. **Add a test show** via AWS Console:
   - Go to DynamoDB → Tables → `the-band-project-shows`
   - Click **Explore table items** → **Create item**
   - Add sample show data

2. **Verify API endpoint**:
   - Visit: `https://your-domain.com/api/shows`
   - Should return JSON with shows

### Test Contact Form

1. **Submit test form** on `/contact` page
2. **Check DynamoDB**:
   - Go to `the-band-project-messages` table
   - Should see new message item
3. **Check email inbox**:
   - Should receive email at `CONTACT_EMAIL`

### Test SES

1. **Send test email** via AWS Console:
   - Go to SES → Verified identities
   - Select your email/domain
   - Click **Send test email**
   - Verify email is received

---

## 7️⃣ Troubleshooting

### DynamoDB Issues

**Error: "ResourceNotFoundException"**
- Verify table names match exactly
- Check AMPLIFY_REGION is correct
- Ensure IAM role has DynamoDB permissions

**Error: "AccessDeniedException"**
- Check IAM role is attached to Amplify
- Verify policy includes DynamoDB actions
- Ensure resource ARNs are correct

### SES Issues

**Error: "MessageRejected"**
- Verify email/domain is verified in SES
- Check if account is in sandbox mode
- Ensure IAM role has SES permissions

**Email not received**
- Check spam folder
- Verify SES is out of sandbox (if sending to unverified emails)
- Check CloudWatch logs for errors

### General Issues

**Environment variables not working**
- Ensure variables are set in Amplify Console
- Redeploy app after adding variables
- Check variable names match exactly (case-sensitive)

**API routes returning 500**
- Check CloudWatch logs in Amplify
- Verify AWS credentials are configured
- Test IAM permissions

---

## 8️⃣ Cost Estimation

### Free Tier (First 12 Months)

- **DynamoDB**: 25 GB storage, 25 read/write units
- **SES**: 62,000 emails/month (if verified)
- **Amplify**: 1,000 build minutes/month
- **Route 53**: $0.50/hosted zone/month

### Estimated Monthly Cost (After Free Tier)

- **DynamoDB**: ~$1-5 (depending on usage)
- **SES**: $0.10 per 1,000 emails
- **Amplify**: ~$15-30 (depending on builds)
- **Route 53**: $0.50/hosted zone
- **Total**: ~$20-40/month (low traffic)

---

## 9️⃣ Next Steps

1. ✅ Set up all AWS services above
2. ✅ Configure environment variables in Amplify
3. ✅ Test locally first (see README.md)
4. ✅ Deploy to Amplify
5. ✅ Test production endpoints
6. ✅ Monitor CloudWatch logs
7. ✅ Set up CloudWatch alarms (optional)

---

## 📞 Support

If you encounter issues:
1. Check CloudWatch logs in Amplify Console
2. Verify IAM permissions
3. Test AWS services individually via AWS Console
4. Review error messages in browser console (F12)
