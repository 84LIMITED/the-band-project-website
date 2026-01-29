# CloudWatch Log Setup for TBP Website

## Why `/tbp-website/app` has no log events

The log group **`/tbp-website/app`** (and stream **TBP**) is a **custom** group created manually. **Nothing is configured to write to it** — your Next.js app on Amplify does not send logs there by default. So it will stay empty until you add code that explicitly writes to that group.

To see **contact form and API errors** (e.g. "Contact form: SES send failed"), you need to look at the **log group that Amplify creates and uses** for the serverless backend, not `/tbp-website/app`.

---

## Where to see API / contact form logs (Amplify’s log group)

Amplify writes backend/API logs to **its own** CloudWatch log group. Use one of these ways to find it:

### Option A: From Amplify Console

1. **AWS Console** → **AWS Amplify** → your app (**the-band-project-website**).
2. In the left sidebar, open **Hosting** or **Monitoring**.
3. Look for **Logs**, **View logs**, or **CloudWatch logs** and open it — that should open (or name) the correct log group and stream.

### Option B: From CloudWatch

1. **AWS Console** → **CloudWatch** → **Log groups**.
2. In the list, look for log groups whose names contain:
   - your **Amplify app ID** (long string like `d1234abcd`), or  
   - **`amplify`**, or  
   - your **app name** (e.g. `the-band-project-website`).
3. Open that log group, then open the **latest log stream** (or the one whose time matches when you submitted the form).
4. Search for **"Contact form: SES send failed"** to see the exact SES error.

### If you still see no log events

- The **Amplify service role** may not have CloudWatch Logs permissions. Amplify needs these to create and write to its log group:
  - `logs:CreateLogGroup`
  - `logs:CreateLogStream`
  - `logs:DescribeLogGroups`
  - `logs:PutLogEvents`
- In **IAM** → **Roles** → the role used by Amplify (App settings → General → Service role), add a policy that allows these actions on `arn:aws:logs:*:*:*` (or the Amplify log group ARN), then **redeploy** the app.

---

## Create a log group manually (optional)

If you need a **custom** log group for the TBP website (e.g. for a script or custom logging):

### AWS CLI

Set your region and create the log group:

```bash
# Use the same region as your Amplify app (e.g. us-east-1)
export AWS_REGION=us-east-1

# Create log group for TBP website
aws logs create-log-group --log-group-name "/tbp-website/app" --region "$AWS_REGION"
```

To create it in a specific region without env var:

```bash
aws logs create-log-group --log-group-name "/tbp-website/app" --region us-east-1
```

### AWS Console

1. **AWS Console** → **CloudWatch** → **Log groups**.
2. **Create log group**.
3. **Log group name:** e.g. `/tbp-website/app`.
4. **Create log group**.

## Git: push code so Amplify deploys (and logs update)

After changing code or docs, push so the deployed app (and its logs) are up to date:

```bash
cd "/Users/mikecaprio/TBP Website"
git add .
git commit -m "Add CloudWatch log setup doc"
git push origin main
```

Amplify will build and deploy; logs will appear in the existing Amplify log groups (no need to create them via git or CLI unless you want a custom group as above).
