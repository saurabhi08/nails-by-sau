# Nails By Sau - Deployment Guide

## Quick Deployment Options

### Option 1: Firebase Hosting (Recommended - Free)

#### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Step 2: Login to Firebase
```bash
firebase login
```

#### Step 3: Initialize Hosting
```bash
cd "c:\Humber College\Capstone Project\Nails By Sau"
firebase init hosting
```

When prompted:
- Select your existing Firebase project: "nailsbysau"
- Public directory: **public**
- Configure as single-page app: **No**
- Set up automatic builds: **No**
- Don't overwrite index.html: **No**

#### Step 4: Deploy
```bash
firebase deploy --only hosting
```

Your app will be live at: `https://nailsbysau.web.app`

---

### Option 2: Netlify (Very Easy - Free)

#### Method A: Drag and Drop
1. Go to https://app.netlify.com/
2. Sign up/login
3. Drag your `public` folder to the deployment area
4. Your site is live!

#### Method B: GitHub Integration
1. Go to https://app.netlify.com/
2. Click "New site from Git"
3. Connect to GitHub
4. Select your repository: `saurabhi08/nails-by-sau`
5. Build settings:
   - Base directory: `public`
   - Publish directory: `public`
6. Click "Deploy site"

Your app will be live at: `https://your-site-name.netlify.app`

---

### Option 3: Vercel (Fast - Free)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
cd "c:\Humber College\Capstone Project\Nails By Sau"
vercel
```

Follow prompts:
- Set up and deploy: **Yes**
- Link to existing project: **No**
- Project name: **nails-by-sau**
- Directory: **./public**

Your app will be live at: `https://nails-by-sau.vercel.app`

---

### Option 4: GitHub Pages (Simplest - Free)

#### Step 1: Create gh-pages Branch
```bash
cd "c:\Humber College\Capstone Project\Nails By Sau"
git checkout -b gh-pages
```

#### Step 2: Move Files to Root
```bash
# Copy files from public to root
xcopy public\* . /E /H /Y
```

#### Step 3: Push to GitHub
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

#### Step 4: Enable GitHub Pages
1. Go to your GitHub repository settings
2. Click "Pages" in left sidebar
3. Source: Select "gh-pages" branch
4. Click "Save"

Your app will be live at: `https://saurabhi08.github.io/nails-by-sau/`

---

## Admin Credentials for Professor

**Admin Email:** admin@nailsbysau.com
**Admin Password:** [Set a temporary password like: Professor2024!]

Note: Make sure to create this admin account in Firebase Authentication first.

---

## Quick Setup Checklist

Before deployment:
- [ ] Firebase configuration is correct
- [ ] Stripe API key is set (test mode is fine)
- [ ] Admin account created in Firebase
- [ ] Services initialized in database
- [ ] All files committed to Git

After deployment:
- [ ] Test the live site
- [ ] Verify admin login works
- [ ] Test booking flow
- [ ] Check payment processing
- [ ] Confirm database connectivity

---

## Recommended for Your Professor

### Best Option: Firebase Hosting

**Why:**
- Already using Firebase for database
- Free tier is generous
- Fast global CDN
- HTTPS included
- Custom domain support

**Quick Commands:**
```bash
npm install -g firebase-tools
firebase login
cd "c:\Humber College\Capstone Project\Nails By Sau"
firebase init hosting
firebase deploy --only hosting
```

**Result:** Your app will be live at `https://nailsbysau.web.app`

---

## For Professor Submission

**Provide:**
1. **Live URL:** https://nailsbysau.web.app (or your deployed URL)
2. **Admin Credentials:**
   - Email: admin@nailsbysau.com
   - Password: [Your chosen password]
3. **User Stories Document:** USER_STORIES.md
4. **GitHub Repository:** https://github.com/saurabhi08/nails-by-sau

---

## Troubleshooting

**Issue:** Deployment fails
- Solution: Check that all file paths are relative
- Solution: Verify Firebase config is correct

**Issue:** Admin login doesn't work on live site
- Solution: Verify admin user exists in Firebase Authentication
- Solution: Check Firebase config matches production project

**Issue:** Payment doesn't work
- Solution: Verify Stripe key is correct
- Solution: Check browser console for errors


