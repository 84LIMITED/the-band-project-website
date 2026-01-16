# Git Repository and Amplify App Setup

## App Name Recommendation

**Amplify App Name:** `the-band-project-website` or `tbp-website`

This is just for internal AWS organization - users won't see this name. Use something simple and descriptive.

---

## Step 1: Create Git Repository

### Option A: GitHub (Recommended)

1. **Create GitHub Repository:**
   - Go to github.com
   - Click **New repository**
   - **Repository name:** `the-band-project-website` (or `tbp-website`)
   - **Visibility:** Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have files)
   - Click **Create repository**

2. **Initialize Git Locally:**
   ```bash
   cd "/Users/mikecaprio/TBP Website"
   git init
   git add .
   git commit -m "Initial commit - The Band Project website"
   ```

3. **Connect to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/the-band-project-website.git
   git branch -M main
   git push -u origin main
   ```
   
   Replace `YOUR_USERNAME` with your GitHub username.

### Option B: GitLab

1. Create repository on GitLab
2. Follow similar steps as GitHub above

### Option C: AWS CodeCommit

1. Go to AWS Console → CodeCommit
2. Create repository: `the-band-project-website`
3. Follow AWS instructions to connect

---

## Step 2: What to Name Your Amplify App

**Recommended:** `the-band-project-website` or `tbp-website`

**Notes:**
- This name is only visible in AWS Console
- Users won't see this name (they see your domain)
- Keep it simple and descriptive
- Can be changed later if needed

---

## Step 3: Connect Amplify to Your Git Repo

When creating the Amplify app:

1. **Choose Git provider:**
   - GitHub (most common)
   - GitLab
   - Bitbucket
   - AWS CodeCommit

2. **Authorize AWS Amplify:**
   - First time: Click "Authorize" to connect your Git account
   - Grant necessary permissions

3. **Select Repository:**
   - Choose: `the-band-project-website` (or your repo name)
   - Select branch: `main` (or `master`)

4. **App Name:**
   - Enter: `the-band-project-website` (or `tbp-website`)
   - This is just for AWS organization

---

## Quick Setup Commands

If you want to set up Git now, run these commands:

```bash
# Navigate to project
cd "/Users/mikecaprio/TBP Website"

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - The Band Project website"

# Add .gitignore if needed (already exists)
# Then connect to your remote repository
```

---

## Important Files to Commit

Make sure these are in your repository:
- ✅ All code files (`/app`, `/components`, `/lib`)
- ✅ Configuration files (`package.json`, `tsconfig.json`, `next.config.js`)
- ✅ Content files (`/content/shows.json`, `/content/media.json`)
- ✅ Documentation files (optional, but recommended)

**Do NOT commit:**
- `node_modules/` (already in .gitignore)
- `.next/` (already in .gitignore)
- `.env.local` (already in .gitignore)
- Media files in `/public/` (you can commit these, or host separately)

---

## Next Steps After Git Setup

1. ✅ Create GitHub/GitLab repository
2. ✅ Push your code
3. ✅ Go to AWS Amplify → New app
4. ✅ Connect your repository
5. ✅ Name your app: `the-band-project-website`
6. ✅ Configure build settings
7. ✅ Deploy!

---

## Recommendation

**App Name:** `the-band-project-website`
**Git Repo Name:** `the-band-project-website` (match them for consistency)

This keeps everything organized and easy to find.
