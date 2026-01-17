# Step-by-Step: Deploy to AWS Amplify

This guide walks you through deploying The Band Project website to AWS Amplify.

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] AWS Account (sign up at aws.amazon.com if needed)
- [ ] Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit)
- [ ] All your code committed and pushed to your repository
- [ ] Your media files ready (videos, images, logos)

---

## Step 1: Prepare Your Git Repository

### 1.1 Commit All Changes

```bash
cd "/Users/mikecaprio/TBP Website"
git add .
git commit -m "Ready for deployment"
git push
```

**Important:** Make sure all your files are committed, including:
- All code files
- `package.json`
- Configuration files
- Content files (shows.json, media.json)

---

## Step 2: Set Up AWS Services (First Time Only)

### 2.1 Create DynamoDB Tables

1. Go to **AWS Console** → **DynamoDB**
2. Click **Create table**
3. **Table name:** `the-band-project-shows`
4. **Partition key:** `id` (String)
5. Click **Create table**
6. After creation, go to **Indexes** tab
7. Click **Create index**
   - **Index name:** `isUpcomingDateIndex` (use camelCase, no hyphens)
   - **Partition key:** `isUpcoming` (String) ⚠️ Use String, not Boolean
   - **Sort key:** `date` (String)
   - Click **Create index**
   
   **Important:** 
   - DynamoDB doesn't support Boolean as a key type. Use String and store values as `"true"` or `"false"`.
   - Index names: 3-255 characters, A-Z, a-z, 0-9, underscores, hyphens, periods only. Use camelCase to avoid issues.

8. Repeat for messages table:
   - **Table name:** `the-band-project-messages`
   - **Partition key:** `id` (String)
   - Click **Create table** (no index needed)

### 2.2 Set Up AWS SES

1. Go to **AWS Console** → **SES** (Simple Email Service)
2. Click **Verified identities** → **Create identity**
3. Choose **Email address** or **Domain**
4. Enter your email: `book@thebandproject.live` (or your domain)
5. Click **Create identity**
6. Check your email and click verification link
7. **Note:** SES starts in "Sandbox" mode (can only send to verified emails)

### 2.3 Create IAM Role for Amplify

1. Go to **AWS Console** → **IAM** → **Roles** → **Create role**
2. Select **AWS service** → **Amplify**
3. Click **Next**
4. Click **Create policy** (opens new tab)
5. Switch to **JSON** tab and paste:

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

6. Click **Next**, name it: `TheBandProjectWebsitePolicy`
7. Click **Create policy**
8. Go back to role creation tab, refresh, select the policy
9. Name the role: `TheBandProjectWebsiteRole`
10. Click **Create role**

---

## Step 3: Create Amplify App

### 3.1 Navigate to Amplify

1. Go to **AWS Console** → **AWS Amplify**
2. Click **New app** → **Host web app**

### 3.2 Connect Repository

1. Choose your Git provider (GitHub, GitLab, Bitbucket, etc.)
2. **First time:** Authorize AWS Amplify to access your repository
3. Select your repository: `TBP Website` (or your repo name)
4. Select branch: `main` (or `master`)
5. Click **Next**

### 3.3 Configure Build Settings

Amplify should auto-detect Next.js. Verify these settings:

**Build settings:**
- **App name:** `the-band-project-website` (or your choice)
- **Environment:** `production`
- **Build command:** `npm run build`
- **Output directory:** `.next`
- **Node version:** `18.x` or `20.x`

**If auto-detection doesn't work**, click **Edit** and use:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

Click **Next**

### 3.4 Review and Create

1. Review your settings
2. Click **Save and deploy**

**Note:** First deployment takes 5-10 minutes.

---

## Step 4: Configure Environment Variables

### 4.1 Add Variables

1. In Amplify Console, go to your app
2. Click **App settings** (left sidebar) → **Environment variables**
3. Click **Manage variables**
4. Add each variable:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `NEXT_PUBLIC_BASE_URL` | Your production URL | `https://thebandproject.com` |
| `AMPLIFY_REGION` | Your AWS region | `us-east-1` |
| `SHOWS_TABLE` | DynamoDB table name | `the-band-project-shows` |
| `MESSAGES_TABLE` | DynamoDB table name | `the-band-project-messages` |
| `CONTACT_EMAIL` | Your contact email | `book@thebandproject.live` |

5. Click **Save**

### 4.2 Attach IAM Role

1. Go to **App settings** → **General**
2. Scroll to **Service role**
3. Select: `TheBandProjectWebsiteRole` (the one you created)
4. Click **Save**

---

## Step 5: Redeploy After Configuration

1. Go to **App settings** → **General**
2. Scroll to **Build settings**
3. Click **Redeploy this version** (or trigger a new deployment)

**Or** make a small change and push to trigger auto-deployment:
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

---

## Step 6: Test Your Deployment

### 6.1 Check Build Status

1. In Amplify Console, go to your app
2. Click on the deployment to see build logs
3. Wait for status: **Deploy** → **Verify** → **Success**

### 6.2 Test Your Site

1. Click the **App URL** (e.g., `https://main.xxxxx.amplifyapp.com`)
2. Test all pages:
   - [ ] Home page loads
   - [ ] Navigation works
   - [ ] Shows page displays
   - [ ] Contact form works
   - [ ] Media drawer opens
   - [ ] All images/videos load

### 6.3 Test Contact Form

1. Go to `/contact`
2. Fill out and submit the form
3. Check DynamoDB: Go to `the-band-project-messages` table → should see new entry
4. Check your email inbox (if SES is configured)

---

## Step 7: Set Up Custom Domain (Optional)

### 7.1 Add Domain in Amplify

1. In Amplify Console → **App settings** → **Domain management**
2. Click **Add domain**
3. Enter your domain: `thebandproject.com`
4. Click **Configure domain**

### 7.2 Configure DNS

1. Amplify will provide DNS records (CNAME)
2. Go to your domain registrar (or Route 53)
3. Add the CNAME record provided by Amplify
4. Wait for DNS propagation (can take up to 48 hours)

### 7.3 Update Environment Variable

1. After domain is active, update `NEXT_PUBLIC_BASE_URL`:
   - Go to **Environment variables**
   - Change to: `https://thebandproject.com`
2. Redeploy

---

## Step 8: Monitor and Maintain

### 8.1 View Logs

- **Build logs:** Amplify Console → Your app → Build history
- **Runtime logs:** Amplify Console → Monitoring → Logs

### 8.2 Update Content

To update shows or media:
1. Edit `/content/shows.json` or `/content/media.json`
2. Commit and push:
   ```bash
   git add content/
   git commit -m "Update shows"
   git push
   ```
3. Amplify auto-deploys (takes 2-5 minutes)

### 8.3 Update Code

Any code changes:
1. Make changes locally
2. Test with `npm run dev`
3. Commit and push
4. Amplify auto-deploys

---

## Troubleshooting

### Build Fails

**Check build logs:**
1. Amplify Console → Build history → Click failed build
2. Look for error messages
3. Common issues:
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Fix in code
   - Environment variable issues → Check variable names

### Site Not Loading

1. Check build status (should be "Success")
2. Check environment variables are set
3. Check IAM role is attached
4. View runtime logs for errors

### Contact Form Not Working

1. Check DynamoDB table exists
2. Check IAM role has DynamoDB permissions
3. Check SES is verified
4. Check environment variables are correct
5. View CloudWatch logs for errors

### Images/Videos Not Loading

1. Verify files are in `/public/` folder
2. Check file paths in code match actual files
3. Check file names (case-sensitive)
4. Verify files are committed to git

---

## Quick Reference

**Amplify Console:** https://console.aws.amazon.com/amplify

**Your App URL:** Found in Amplify Console → Your app → Domain

**Environment Variables:** App settings → Environment variables

**Build History:** Your app → Build history

**Logs:** Your app → Monitoring → Logs

---

## Next Steps After Deployment

1. ✅ Test all functionality
2. ✅ Set up custom domain (if desired)
3. ✅ Add your media files to `/public/`
4. ✅ Update shows in DynamoDB or shows.json
5. ✅ Monitor first few days for issues
6. ✅ Set up CloudWatch alarms (optional)

---

## Support

If you encounter issues:
1. Check build logs in Amplify Console
2. Check runtime logs
3. Verify all AWS services are set up correctly
4. Review AWS_SETUP.md for detailed service configuration

**You're ready to deploy!** 🚀
