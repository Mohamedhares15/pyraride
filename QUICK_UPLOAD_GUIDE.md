# 🚀 Quick Horse Upload Guide

## ⚡ FASTEST METHOD (Web Interface)

### Step 1: Open Upload Page
1. Go to: **`https://your-domain.com/admin/upload-horses`**
2. Login as admin or stable owner

### Step 2: Prepare Your Data

**Format your JSON like this:**

```json
[
  {
    "stableName": "Beit Zeina",
    "horses": [
      {
        "name": "Thunder",
        "description": "Beautiful black stallion, very gentle.",
        "pricePerHour": 500,
        "age": 8,
        "skills": ["Beginner-friendly", "Calm"],
        "imageUrls": [
          "https://drive.google.com/uc?id=YOUR_FILE_ID_1",
          "https://drive.google.com/uc?id=YOUR_FILE_ID_2"
        ]
      }
    ]
  },
  {
    "stableName": "Hooves",
    "horses": [...]
  }
]
```

### Step 3: Get Google Drive URLs

**Option A: Share Link (Easier)**
1. Right-click image in Google Drive
2. Click "Get link"
3. Change to "Anyone with the link can view"
4. Copy link: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
5. Extract FILE_ID from the link
6. Convert to: `https://drive.google.com/uc?id=FILE_ID`

**Option B: Direct Link (Faster)**
- The upload API automatically converts Google Drive share links!
- Just paste: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
- It will convert to the direct image URL automatically

### Step 4: Upload
1. Paste your JSON in the textarea
2. Click **"🚀 Upload Horses"**
3. Done! ✅

---

## 📋 Data Structure

### Required Fields:
- ✅ `stableName` - Must match: "Beit Zeina", "Hooves", "Aseel", or "Alaa"
- ✅ `name` - Horse name
- ✅ `description` - Horse description
- ✅ `imageUrls` - Array of image URLs (at least 1 required)

### Optional Fields:
- ⭕ `pricePerHour` - Number (e.g., 500)
- ⭕ `age` - Number (e.g., 8)
- ⭕ `skills` - Array of strings (e.g., ["Beginner-friendly", "Calm"])

---

## 🔗 Google Drive URL Examples

### ✅ Accepted Formats:
1. **Direct Image URL:**
   ```
   https://drive.google.com/uc?id=FILE_ID
   ```

2. **Share Link (auto-converted):**
   ```
   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   ```

3. **Any HTTP/HTTPS URL:**
   ```
   https://example.com/image.jpg
   ```

---

## 📝 Example Complete JSON

```json
[
  {
    "stableName": "Beit Zeina",
    "horses": [
      {
        "name": "Thunder",
        "description": "Beautiful black stallion, very gentle and perfect for beginners.",
        "pricePerHour": 500,
        "age": 8,
        "skills": ["Beginner-friendly", "Calm", "Well-trained"],
        "imageUrls": [
          "https://drive.google.com/file/d/1abc123xyz789/view?usp=sharing",
          "https://drive.google.com/uc?id=1def456uvw012"
        ]
      },
      {
        "name": "Bella",
        "description": "Friendly mare, great for family rides.",
        "pricePerHour": 450,
        "age": 6,
        "skills": ["Family-friendly", "Calm"],
        "imageUrls": [
          "https://drive.google.com/uc?id=1ghi789rst345"
        ]
      }
    ]
  },
  {
    "stableName": "Hooves",
    "horses": [
      {
        "name": "Lightning",
        "description": "Fast Arabian horse for experienced riders.",
        "pricePerHour": 700,
        "age": 5,
        "skills": ["Advanced", "Fast"],
        "imageUrls": [
          "https://drive.google.com/file/d/1jkl012mno678/view?usp=sharing"
        ]
      }
    ]
  }
]
```

---

## ⚠️ Important Notes

1. **Stable names must match exactly** (case-insensitive):
   - "Beit Zeina" ✅
   - "Hooves" ✅
   - "Aseel" ✅
   - "Alaa" ✅

2. **Images must be publicly accessible** (not requiring login)

3. **At least 1 image per horse is required**

4. **You can upload multiple horses at once** - just add more to the `horses` array

5. **The API automatically:**
   - Converts Google Drive share links to direct image URLs
   - Creates HorseMedia entries for each image
   - Sets proper sortOrder for images
   - Makes all horses active

---

## 🎯 Tips for Fast Upload

1. **Use Google Sheets** to organize your data:
   - Columns: Stable | Horse | Description | Price | Age | Skills | Image URLs
   - Export as JSON
   - Copy and paste

2. **Bulk get Google Drive URLs:**
   - Select multiple images in Google Drive
   - Right-click → "Get link"
   - Set to "Anyone with the link"
   - Copy all links
   - Paste into your JSON

3. **Test with 1 horse first** before uploading all

---

## 🆘 Troubleshooting

**Error: "Stable not found"**
- Check spelling of stable name
- Must be: "Beit Zeina", "Hooves", "Aseel", or "Alaa"

**Error: "No valid image URLs"**
- Make sure images are shared as "Anyone with the link can view"
- Check that URLs are correct format

**Images not showing:**
- Verify images are publicly accessible
- Check that Google Drive link is shared correctly
- Try opening the URL directly in a browser

---

## ✅ Success Response

After successful upload, you'll see:
- ✅ Total horses created
- ✅ Total images uploaded
- ✅ List of successful uploads
- ❌ Any errors (if any)

All horses are immediately available for booking!

