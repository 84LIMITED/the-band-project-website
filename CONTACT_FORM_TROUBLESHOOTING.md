# Contact Form Not Receiving Email – Troubleshooting

Use this checklist to track down why messages sent to **book@thebandproject.live** are not arriving. Work through **1 → 2 → 3** in order.

---

## ⚠️ "Could not load credentials from any providers" (CredentialsProviderError)

If CloudWatch shows **CredentialsProviderError: Could not load credentials from any providers** (and "Error saving message", "Error sending email", "Error fetching shows"), the **backend has no AWS credentials**. The Amplify app’s **Service role** is either missing or not used by the serverless backend.

### Fix: Use the SSR Compute role (not just the Service role)

Amplify uses **two** roles:

- **Service role** (App settings → General): used for **build/deploy** (CloudFormation, etc.). It does **not** run your API.
- **Compute role** (App settings → IAM roles): used by the **Lambda that runs your Next.js API** at runtime. This is the one that needs DynamoDB and SES.

The policy you have on **TheBandProjectWebsiteRole** is for the **Service** role (build/deploy). It has no `ses:SendEmail`/`ses:SendRawEmail` and no runtime DynamoDB (`PutItem`, `Query`, `GetItem`, `Scan`) for your API. So you must attach a **Compute role** that has those permissions.

#### Step 1: Create a policy for the Compute role (DynamoDB + SES)

1. **IAM** → **Policies** → **Create policy** → **JSON**.
2. Paste this (adjust table names if different):

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

3. **Next** → name it e.g. **TBP-SSR-Compute-Policy** → **Create policy**.

#### Step 2: Create the Compute role (trust Amplify)

**Option A – AWS CLI (most reliable)**

1. In your project folder, create a file named `trust.json` with **exactly** this (Principal as an array; some consoles require it):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": ["amplify.amazonaws.com"]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

2. In a terminal (same folder as `trust.json`), run:

```bash
aws iam create-role --role-name TBP-SSR-Compute-Role --assume-role-policy-document file://trust.json
```

3. Attach the policy (replace `YOUR_ACCOUNT_ID` with your 12-digit AWS account ID):

```bash
aws iam attach-role-policy --role-name TBP-SSR-Compute-Role --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/TBP-SSR-Compute-Policy
```

To get your account ID: `aws sts get-caller-identity --query Account --output text`

**Option B – IAM Console**

1. **IAM** → **Roles** → **Create role**.
2. **Trusted entity type:** Custom trust policy.
3. **Custom trust policy** — paste **only** this. Ensure `Principal` is present and **Service** is an array (brackets `[ ]`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": ["amplify.amazonaws.com"]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

4. **Next** → on **Add permissions**, do **not** attach any policy (leave the list empty). **Next** → name the role **TBP-SSR-Compute-Role** → **Create role**.  
   - If the console won’t let you continue without a policy, attach **any** small AWS managed policy (e.g. **ReadOnlyAccess**), create the role, then in the next step remove it and attach **TBP-SSR-Compute-Policy** instead.
5. After the role is created: open **TBP-SSR-Compute-Role** → **Add permissions** → **Attach policies** → search **TBP-SSR-Compute-Policy** → **Add permissions**.

**If you still get “Has prohibited field Resource”:** create the role with the AWS CLI so only the trust policy is sent. Save the trust policy to a file (e.g. `trust.json`) with **only** the JSON above (no `Resource`). Then run (use your region if different):

```bash
aws iam create-role --role-name TBP-SSR-Compute-Role --assume-role-policy-document file://trust.json
aws iam attach-role-policy --role-name TBP-SSR-Compute-Role --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/TBP-SSR-Compute-Policy
```

Replace `YOUR_ACCOUNT_ID` with your 12-digit AWS account ID (IAM → top right, or run `aws sts get-caller-identity --query Account --output text`).

#### Step 3: Attach the Compute role in Amplify

1. **AWS Console** → **AWS Amplify** → your app (**the-band-project-website**).
2. Left sidebar: **App settings** → **IAM roles** (not General).
3. In **Compute role**, click **Edit**.
4. Under **Default role**, select **TBP-SSR-Compute-Role** (or the role you created).
5. **Save**.

No redeploy needed — the Compute role is used on the next request. Submit the contact form again; credentials should work and the 503 should go away.

---

## 1. Amazon SES

### 1.1 Verified identity (From address)

The form sends **from** `book@thebandproject.live` (and **to** the same address). In SES, the **Source** address must be a verified identity.

- **AWS Console** → **SES** → **Verified identities**
- Confirm one of these:
  - **Domain** `thebandproject.live` is verified (then any `*@thebandproject.live` can be used as From), **or**
  - **Email** `book@thebandproject.live` is verified
- If neither is there: **Create identity** → choose **Domain** (recommended) or **Email address** → add the domain or `book@thebandproject.live` → complete DNS/email verification

### 1.2 Sandbox vs production

- **SES** → **Account dashboard**
- If status is **Sandbox**:
  - You can only send **to** verified identities.
  - Ensure **book@thebandproject.live** (or the domain) is verified so it can **receive**.
- To send to any address: **Request production access** (Account dashboard).

### 1.3 Sending and bounces

- **SES** → **Account dashboard** → **Sending statistics**
- Check **Sends** and **Bounces** / **Complaints**.
- If bounces or complaints are high, the identity can be restricted; fix bounces and request review if needed.

### 1.4 IAM permissions

The Amplify app uses an IAM role to call SES.

- **IAM** → **Roles** → role used by Amplify
- The role must allow: `ses:SendEmail` and `ses:SendRawEmail` (see `AWS_SETUP.md`).
- If these are missing, add them and redeploy.

### 1.5 Region and env vars

- **SES** and the **SES client in code** must use the **same region** (e.g. `us-east-1`).
- In **Amplify** → **Environment variables**, confirm:
  - `AMPLIFY_REGION` (e.g. `us-east-1`) matches the region where the identity is verified.
  - `CONTACT_EMAIL` = `book@thebandproject.live`.
- Redeploy after changing env vars.

---

## 2. The form and API

### 2.1 Confirm the API is called

- Submit the form on the live site.
- If the UI shows “Thank you! Your message has been sent,” the **API returned 200**. That does **not** guarantee SES delivered; the API can still return 200 and log an SES error (see 2.3).
- If you see “There was an error submitting your message,” the API returned an error (e.g. 503 when SES fails after the recent change).

### 2.2 Check Amplify / CloudWatch logs

- **Amplify** → your app → **Monitoring** / **Logging** (or **Hosting** → **Logs**), or **CloudWatch** → **Log groups** for the Amplify app.
- After a form submit, look for:
  - `Error sending email:` — SES call failed (see the next line for the actual error).
  - `Error processing contact form:` — general API error.
- Common log messages:
  - **MessageRejected** / **Account under review** → SES identity or account issue (back to section 1).
  - **AccessDenied** → IAM role missing `ses:SendEmail` / `ses:SendRawEmail`.
  - **InvalidParameterValue** / **ConfigurationSetDoesNotExist** → wrong From address or config.

### 2.3 API behavior after the fix

- The contact API now **returns 503** when **SES fails** (and still returns 200 when SES succeeds).
- So: if the form shows the error message after submit, check CloudWatch for the exact SES error and fix SES (section 1) or IAM.

### 2.4 DynamoDB (optional)

- Messages are also saved to DynamoDB (`the-band-project-messages`). If you see the submission in DynamoDB but no email, the problem is between SES and the inbox (SES or G Suite), not the form or API.

---

## 3. G Suite alias (book@thebandproject.live)

### 3.1 MX and domain

- **book@thebandproject.live** must receive mail for your domain.
- In your DNS (e.g. Google Admin or your DNS provider), confirm **MX records** for `thebandproject.live` point to **Google** (e.g. `aspmx.l.google.com`, etc.). If MX is not Google, mail sent to `book@...` will not land in Gmail/Workspace.

### 3.2 Alias setup

- **Google Admin** (admin.google.com) → **Users** or **Groups** (depending how the alias is set).
- Confirm **book@thebandproject.live** exists as:
  - A **user** (primary address), or
  - An **alias** or **group** that forwards to the inbox you check.
- If the alias points to a different address, check that **inbox** (and its spam folder).

### 3.3 Spam and filters

- In the inbox that receives mail for **book@thebandproject.live** (or the alias target):
  - Check **Spam** and **Promotions**.
  - Check **Filters** (Settings → Filters) that might archive or delete mail.
  - Search for “The Band Project” or “New Contact Form Submission”.

### 3.4 DKIM / deliverability (optional)

- If SES domain is verified and DKIM is set for `thebandproject.live`, it can improve deliverability. In SES → identity → DKIM, add the CNAME records to your DNS.
- G Suite may still place first-time senders in spam until reputation builds; check spam and “Not spam” if needed.

---

## Quick checklist

| Step | What to check |
|------|----------------|
| **SES** | Domain or book@... verified in SES (Verified identities) |
| **SES** | Same region in SES and `AMPLIFY_REGION` |
| **SES** | IAM role has `ses:SendEmail` and `ses:SendRawEmail` |
| **SES** | Sandbox: book@... (or domain) verified so it can receive |
| **Form/API** | Amplify env: `CONTACT_EMAIL` = book@thebandproject.live |
| **Form/API** | CloudWatch logs for “Error sending email” and the exact error |
| **G Suite** | MX for thebandproject.live points to Google |
| **G Suite** | book@... is a user or alias that delivers to the inbox you check |
| **G Suite** | Spam and filters for that inbox |

---

## Troubleshoot #2 only: Form, API & IAM

Use this when **SES (#1) and G Suite (#3) are fine** and you still don’t receive mail. Focus: **Is the API calling SES with the right credentials and env?**

### Step A: Get the exact error from CloudWatch

1. Submit the contact form on the **live** site (thebandproject.live).
2. If you see **“There was an error submitting your message”**, the API returned 503 (SES failed). If you see **“Thank you!”**, skip to Step D (env/region).
3. **AWS Console** → **CloudWatch** → **Log groups**.
4. Find the log group for your Amplify app (e.g. `/aws/amplify/...` or similar; check Amplify → **Monitoring** / **Logs** for a link).
5. Open the latest log stream and search for **“Contact form: SES send failed”** (or **“Error sending email”**). Note the **error message and `code`** (e.g. `AccessDenied`, `MessageRejected`, `InvalidParameterValue`).

| Error code / message | What to do |
|----------------------|------------|
| **AccessDenied** / **Unauthorized** | IAM role used by Amplify does not have SES permissions → Step B. |
| **MessageRejected** / **Account under review** | SES identity or account (back to section 1). |
| **InvalidParameterValue** | Wrong From address or region (Step D). |
| **NetworkError** / **Timeout** | Region or network; confirm `AMPLIFY_REGION` and SES in same region (Step D). |

### Step B: Confirm Amplify is using the right IAM role

1. **AWS Console** → **AWS Amplify** → your app (**the-band-project-website**).
2. In the left sidebar: **App settings** → **General**.
3. Scroll to **Service role**.
4. Note the role name (e.g. `TheBandProjectWebsiteRole`). If it says **No role selected**, the app has **no IAM role** → attach one (Step C).

### Step C: Confirm the role has SES permissions

1. **AWS Console** → **IAM** → **Roles**.
2. Search for and open the role from Step B (e.g. `TheBandProjectWebsiteRole`).
3. **Permissions** tab: confirm there is a policy that includes:
   - **Actions:** `ses:SendEmail` and `ses:SendRawEmail`
   - **Resource:** `*` (or the SES identity ARN)
4. If SES is missing:
   - Either **Add permissions** → **Attach policies** and attach a policy that has the JSON below, or
   - **Add permissions** → **Create inline policy** → **JSON** and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
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

5. Save. **Redeploy** the Amplify app (trigger a new deploy from Amplify Console) so the backend picks up the role.

### Step D: Env vars and region

1. **Amplify** → your app → **Environment variables** (left sidebar under **App settings**).
2. Confirm:
   - **`CONTACT_EMAIL`** = `book@thebandproject.live` (no spaces).
   - **`AMPLIFY_REGION`** = the **same region** where your SES identity is verified (e.g. `us-east-1`).  
     **SES** → **Verified identities** → your identity → region is shown at top or in the console URL.
3. If you change any variable: **Save**, then **Redeploy** the app.

### Step E: Verify API route and redeploy

1. Confirm the contact form on the live site POSTs to **`/api/contact`** (check browser DevTools → Network for the request).
2. After any IAM or env change, run a **full redeploy** in Amplify (e.g. **Redeploy this version** or push a small commit and let the build run). The API runs on Amplify’s backend; it must be redeployed to use the updated role or env.

### Step F: Optional – confirm DynamoDB (proves API + role work)

If **DynamoDB** is configured and the same IAM role has DynamoDB permissions:

1. **AWS Console** → **DynamoDB** → **Tables** → **the-band-project-messages** → **Explore table items**.
2. Submit the form once, then refresh the table. If a **new item** appears, the API ran and the role has DynamoDB access. If SES still fails, the issue is limited to **SES permissions or region** (Steps C and D).

---

## Flow summary

1. User submits form → **Next.js API** (`/api/contact`) runs on Amplify.
2. API calls **SES** `SendEmail`: From = To = `CONTACT_EMAIL` (book@thebandproject.live).
3. SES sends the message to the **MX** for `thebandproject.live`.
4. **Google** receives it and delivers to **book@thebandproject.live** (user or alias).
5. You read it in the Gmail/Workspace inbox for that address (or alias target).

If it fails: use CloudWatch to see whether the error is at step 2 (SES). If there is no error in CloudWatch but still no email, the issue is usually step 1 (SES identity/region/IAM) or steps 3–5 (MX, alias, spam).
