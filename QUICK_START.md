# Quick Start Guide

## 🚀 Commands to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:3000
```

### 4. Build for Production (Test)
```bash
npm run build
npm start
```

---

## 📋 What You Need to Do

### ✅ Step 1: Add Media Assets
See [MEDIA_ASSETS.md](./MEDIA_ASSETS.md) for detailed instructions.

**Quick checklist:**
- [ ] Add hero video: `/public/video/hero.mp4`
- [ ] Add hero poster: `/public/posters/hero-poster.jpg`
- [ ] Add other videos to `/public/video/`
- [ ] Add images to `/public/images/`
- [ ] Update `/content/media.json` with your media

### ✅ Step 2: Test Locally
1. Run `npm run dev`
2. Navigate through all pages:
   - Home (`/`)
   - Background (`/background`)
   - Shows (`/shows`)
   - Contact (`/contact`)
   - Gear (`/gear`)
3. Test the media drawer (click "Watch" button)
4. Test the contact form (will use static fallback locally)

### ✅ Step 3: Set Up AWS (For Production)
See [AWS_SETUP.md](./AWS_SETUP.md) for complete instructions.

**Quick overview:**
1. Create DynamoDB tables
2. Set up AWS SES
3. Create IAM role
4. Configure in AWS Amplify

### ✅ Step 4: Deploy to AWS Amplify
1. Connect your Git repository to Amplify
2. Set environment variables in Amplify Console
3. Deploy!

---

## 🎯 Environment Variables (AWS Amplify Only)

Configure these in **AWS Amplify Console** (not needed for local dev):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_BASE_URL` | Your production URL |
| `AMPLIFY_REGION` | `us-east-1` (or your region) |
| `SHOWS_TABLE` | `the-band-project-shows` |
| `MESSAGES_TABLE` | `the-band-project-messages` |
| `CONTACT_EMAIL` | `contact@thebandproject.com` |

---

## 📚 Documentation Files

- **[README.md](./README.md)** - Main project documentation
- **[AWS_SETUP.md](./AWS_SETUP.md)** - Complete AWS setup guide
- **[MEDIA_ASSETS.md](./MEDIA_ASSETS.md)** - Media files guide
- **[QUICK_START.md](./QUICK_START.md)** - This file

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Missing Dependencies
```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## ✨ Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm run dev`
3. ✅ Add your media assets
4. ✅ Test locally
5. ✅ Set up AWS (see AWS_SETUP.md)
6. ✅ Deploy to Amplify

Happy coding! 🎸
