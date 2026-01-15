# Cloudinary Setup Guide

## Step 1: Create Cloudinary Account (FREE)

1. Go to <https://cloudinary.com/users/register_free>
2. Sign up with email
3. Verify email
4. Login to dashboard

## Step 2: Get Your Credentials

1. Go to Dashboard: <https://console.cloudinary.com/>
2. Copy these values:
   - **Cloud Name**: `dxxxxx` (visible on dashboard)
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxx-xxxxxxxxxxxxx`

## Step 3: Add to Environment Variables

### Local Development (.env.local)

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Vercel Production

1. Go to: <https://vercel.com/your-team/pyraride/settings/environment-variables>
2. Add three variables:
   - `CLOUDINARY_CLOUD_NAME` = `your_cloud_name`
   - `CLOUDINARY_API_KEY` = `your_api_key`
   - `CLOUDINARY_API_SECRET` = `your_api_secret`
3. Click "Save"
4. Redeploy (or push new commit)

## Step 4: Configure Cloudinary Settings (Optional but Recommended)

### Enable Auto-Optimization

1. Go to Settings → Upload
2. Enable "Auto Tagging"
3. Enable "Auto Categorization"
4. Save

### Set Upload Presets

1. Go to Settings → Upload Presets
2. Create preset "review_images":
   - Folder: `pyraride/reviews`
   - Format: Auto
   - Quality: Auto
   - Max dimensions: 1200x1200
   - Allowed formats: jpg, png, webp, heic

## What You Get (FREE Tier)

✅ **25GB Storage** - ~50,000 images  
✅ **25GB Bandwidth/month** - Plenty for startups  
✅ **Global CDN** - Lightning fast worldwide  
✅ **Auto Optimization** - WebP, quality, compression  
✅ **Transformations** - Resize, crop, effects  
✅ **Unlimited Transformations** - Even on free tier!  

## Pricing After Free Tier

- **Storage**: $0.10/GB/month (cheaper than Vercel!)
- **Bandwidth**: $0.12/GB (cheaper than Vercel!)
- **Transformations**: FREE (unlimited)

---

## Quick Start

```bash
# Already installed in package.json
npm install cloudinary

# Add env variables to .env.local
# Then restart dev server
npm run dev
```

## Test Upload

```bash
# Use Postman or curl
curl -X POST http://localhost:3000/api/reviews/upload-images \
  -F "images=@test-image.jpg"
```

---

## 🎉 Done

Once env variables are set, the upload system works automatically!
