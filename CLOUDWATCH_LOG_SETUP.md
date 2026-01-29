# CloudWatch Log Setup for TBP Website

## Automatic logs (Amplify)

When the app runs on AWS Amplify, **Amplify creates CloudWatch log groups automatically** for builds and for the serverless backend (API routes, SSR). You usually don’t need to create a log group by hand.

- **Amplify Console** → your app → **Monitoring** or **Hosting** → **Logs** to see or open the log group.
- **CloudWatch** → **Log groups** → look for names containing your app ID or `amplify`.

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
