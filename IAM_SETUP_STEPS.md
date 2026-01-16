# IAM Policy and Role Setup - Step by Step

## Overview

You need to:
1. **Create the IAM Policy** (standalone)
2. **Create the IAM Role** and attach the policy to it
3. **Attach the Role to Amplify** (in Amplify Console)

---

## Step 1: Create the IAM Policy

1. Go to **AWS Console** → **IAM** → **Policies** (left sidebar)
2. Click **Create policy**
3. Click the **JSON** tab
4. Delete any existing content and paste this:

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

5. Click **Next**
6. **Policy name:** `TheBandProjectWebsitePolicy`
7. **Description:** `Policy for The Band Project website to access DynamoDB and SES`
8. Click **Create policy**

**✅ Policy is now created!**

---

## Step 2: Create the IAM Role and Attach the Policy

1. Go to **AWS Console** → **IAM** → **Roles** (left sidebar)
2. Click **Create role**
3. **Trusted entity type:** Select **AWS service**
4. **Use case:** Select **Amplify** (or search for it)
5. Click **Next**
6. **Permissions:** In the search box, type: `TheBandProjectWebsitePolicy`
7. **Check the box** next to `TheBandProjectWebsitePolicy` (the policy you just created)
8. Click **Next**
9. **Role name:** `TheBandProjectWebsiteRole`
10. **Description:** `Role for The Band Project website Amplify app`
11. Click **Create role**

**✅ Role is now created with the policy attached!**

---

## Step 3: Attach the Role to Your Amplify App

1. Go to **AWS Console** → **AWS Amplify**
2. Click on your app name
3. Click **App settings** (left sidebar) → **General**
4. Scroll down to **Service role**
5. Click **Edit**
6. Select: `TheBandProjectWebsiteRole` from the dropdown
7. Click **Save**

**✅ Role is now attached to Amplify!**

---

## Summary

**Where to attach what:**

1. **Policy → Role:** 
   - Location: IAM → Roles → Create role
   - Action: Check the policy box when creating the role

2. **Role → Amplify:**
   - Location: Amplify Console → Your App → App settings → General
   - Action: Select the role from the "Service role" dropdown

---

## Verify It's Working

After attaching the role to Amplify:
1. Your Amplify app can now access DynamoDB tables
2. Your Amplify app can now send emails via SES
3. Test by submitting the contact form on your deployed site

---

## Troubleshooting

**Can't find the policy when creating the role?**
- Make sure you created the policy first (Step 1)
- Refresh the page
- Search for the exact policy name: `TheBandProjectWebsitePolicy`

**Can't find the role in Amplify?**
- Make sure you created the role (Step 2)
- The role must be in the same AWS region as your Amplify app
- Try refreshing the Amplify console
