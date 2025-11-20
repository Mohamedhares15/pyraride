# Horse Photo Upload Guide

## 📋 Data Structure Needed

For each horse, I need the following information:

```json
{
  "stableName": "Beit Zeina",  // Must match one of your 4 stables
  "horses": [
    {
      "name": "Thunder",                    // Horse name (required)
      "description": "Beautiful black stallion, very gentle and perfect for beginners.",  // Description (required)
      "pricePerHour": 500,                  // Price in EGP (optional, number)
      "age": 8,                             // Age in years (optional, number)
      "skills": ["Beginner-friendly", "Calm", "Well-trained"],  // Array of skills (optional)
      "imageUrls": [                        // Array of image URLs (at least 1 required)
        "https://drive.google.com/uc?id=IMAGE_ID_1",
        "https://drive.google.com/uc?id=IMAGE_ID_2"
      ]
    },
    {
      "name": "Lightning",
      "description": "Fast Arabian horse for experienced riders.",
      "pricePerHour": 700,
      "age": 5,
      "skills": ["Advanced", "Fast", "Energetic"],
      "imageUrls": [
        "https://drive.google.com/uc?id=IMAGE_ID_3"
      ]
    }
  ]
}
```

## 🔗 How to Get Google Drive Image URLs

### Option 1: Make Files Public and Get Direct Links

1. **Upload your images to Google Drive**
2. **Right-click on each image** → **"Get link"** → **Change to "Anyone with the link"**
3. **Copy the link** - it will look like: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
4. **Convert to direct image URL**: Replace with: `https://drive.google.com/uc?id=FILE_ID`

   Example:
   - Original: `https://drive.google.com/file/d/1abc123xyz789/view?usp=sharing`
   - Direct URL: `https://drive.google.com/uc?id=1abc123xyz789`

### Option 2: Use Google Drive Folder (Bulk)

1. **Create a folder structure**:
   ```
   Google Drive/
   ├── Beit Zeina/
   │   ├── horse1-photo1.jpg
   │   ├── horse1-photo2.jpg
   │   ├── horse2-photo1.jpg
   │   └── ...
   ├── Hooves/
   │   └── ...
   ├── Aseel/
   │   └── ...
   └── Alaa/
       └── ...
   ```

2. **Share each folder** as "Anyone with the link can view"
3. **Extract FILE_IDs** from each image link
4. **Create the JSON** using the structure above

## 📝 Complete Example

Create a JSON file like this:

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
          "https://drive.google.com/uc?id=1abc123xyz789",
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
          "https://drive.google.com/uc?id=1jkl012mno678"
        ]
      }
    ]
  },
  {
    "stableName": "Aseel",
    "horses": [
      {
        "name": "Sultan",
        "description": "Noble Arabian stallion, well-trained.",
        "pricePerHour": 600,
        "age": 7,
        "skills": ["Well-trained", "Elegant"],
        "imageUrls": [
          "https://drive.google.com/uc?id=1pqr345stu901"
        ]
      }
    ]
  },
  {
    "stableName": "Alaa",
    "horses": [
      {
        "name": "Mirage",
        "description": "Beautiful white horse, perfect for photography sessions.",
        "pricePerHour": 550,
        "age": 4,
        "skills": ["Photogenic", "Calm"],
        "imageUrls": [
          "https://drive.google.com/uc?id=1vwx234yza567"
        ]
      }
    ]
  }
]
```

## ✅ How to Provide the Data

### Method 1: Create a JSON File (Recommended)
1. Create a file called `horses-data.json` with the structure above
2. Share it with me (paste the content here, or I can help you create it)

### Method 2: Share Google Drive Folder
1. Create folders for each stable in Google Drive
2. Share the folder link
3. Tell me the structure (which images belong to which horses)
4. I'll help extract the FILE_IDs and create the JSON

### Method 3: Use Google Sheets
1. Create a Google Sheet with columns:
   - Stable Name
   - Horse Name
   - Description
   - Price Per Hour
   - Age
   - Skills (comma-separated)
   - Image URLs (one per row, multiple images per horse)
2. Share the sheet and I'll convert it to the upload format

## 🚀 After You Provide the Data

I will:
1. ✅ Create a script to upload all horses to your database
2. ✅ Associate each horse with the correct stable
3. ✅ Upload images to HorseMedia table
4. ✅ Set proper sortOrder for images
5. ✅ Make all horses active and ready for booking

## 📌 Important Notes

- **Image URLs must be publicly accessible** (not requiring login)
- **At least 1 image per horse is required**
- **Stable names must match exactly**: "Beit Zeina", "Hooves", "Aseel", or "Alaa"
- **All prices are in EGP**
- **Skills are optional** but recommended for better search/filtering

