# Next Cloudinary Setup - 5 Minute Guide

## Step 1: Create Upload Preset (REQUIRED!)

Cloudinary upload presets control upload settings and security.

### 1.1 Go to Cloudinary Dashboard

1. Login: <https://console.cloudinary.com/>
2. Click Settings (⚙️) → Upload tab
3. Scroll to "Upload presets"
4. Click "Add upload preset"

### 1.2 Create Preset

**Preset Name:** `pyraride_reviews`

**Settings:**

```
Signing Mode: Unsigned
Folder: pyraride/reviews
Format: Auto
Quality: Auto (to reduce file size automatically)
Max File Size: 10 MB
Allowed Formats: jpg, jpeg, png, webp, heic
```

**Click "Save"**

## Step 2: Add Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
```

**Where to find Cloud Name:**

- Dashboard homepage shows: `dxxxxxx`
- Copy that value

## Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Step 4: Test Upload

1. Go to any completed booking
2. Click "Leave Review"
3. Click "Add Photo" button
4. Upload an image
5. Should see Cloudinary upload widget!

---

## Upload Preset Explanation

**Why "Unsigned"?**

- Allows client-side uploads
- No API secrets in browser
- Still secure (preset controls what's allowed)

**Why "Auto" Format/Quality?**

- Cloudinary optimizes automatically
- Converts to WebP for modern browsers
- Reduces file size by 50-80%

**Folder Structure:**

```
pyraride/
└── reviews/
    ├── user123/
    │   ├── 1234567890-abc.jpg
    │   └── 1234567891-def.jpg
    └── user456/
        └── 1234567892-ghi.jpg
```

---

## Vercel Deployment

Add environment variable in Vercel:

1. Go to: <https://vercel.com/your-team/pyraride/settings/environment-variables>
2. Add: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
3. Value: `your_cloud_name`
4. Click "Save"
5. Redeploy

---

## Troubleshooting

### "Upload preset not found"

- Check preset name is exactly: `pyraride_reviews`
- Check it's set to "Unsigned"
- Try refreshing Cloudinary dashboard

### "Upload failed"

- Check Cloud Name is correct
- Check preset exists
- Check file size < 10MB
- Check file format is allowed

### Widget doesn't open

- Check console for errors
- Verify `NEXT_PUBLIC_` prefix in env var
- Restart dev server after adding env vars

---

## Features You Get FOR FREE

✅ **Drag & Drop Upload** - Built-in widget  
✅ **Camera Access** - Take photos directly  
✅ **Multiple Upload** - Up to 5 at once  
✅ **Progress Bars** - See upload status  
✅ **Auto Optimization** - 50-80% smaller files  
✅ **WebP Conversion** - Modern format  
✅ **Global CDN** - Fast delivery worldwide  
✅ **Error Handling** - Built-in validation  

---

## Cost (Same as before!)

**FREE Tier:**

- 25 GB storage
- 25 GB bandwidth/month
- ~50,000 images total

**No changes to pricing - still 100% FREE for a long time!**

---

## Done! 🎉

The upload button is already in the code.  
Just add the environment variable and create the upload preset!
