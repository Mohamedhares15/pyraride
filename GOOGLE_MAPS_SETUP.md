# 🗺️ **Google Maps Integration Setup**

## ✅ **What's Been Implemented:**

1. **Location Map Component** (`components/maps/LocationMap.tsx`)
   - Interactive Google Maps display
   - Stable location marker (red)
   - Rider location marker (blue, draggable)
   - Distance calculation between rider and stable
   - Route visualization
   - "Use My Location" button (geolocation)
   - Click map to set pickup location

2. **Stable Location Map** (`components/maps/StableLocationMap.tsx`)
   - Fetches stable coordinates from API
   - Displays map on stable detail page
   - Shows distance when rider location is set

3. **API Endpoint** (`/api/stables/[id]/coordinates`)
   - Returns stable coordinates based on location
   - Defaults to Giza Pyramids or Saqqara coordinates

4. **Integration Points:**
   - ✅ Stable detail page (`/stables/[id]`) - Shows map with stable location
   - 🔄 Booking modal - Ready for location picker (can be added)

---

## 🔑 **Setup Instructions:**

### **1. Get Google Maps API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Maps JavaScript API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"
4. Enable **Places API** (for address autocomplete, optional)
5. Enable **Geocoding API** (for converting addresses to coordinates, optional)
6. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
   - (Recommended) Restrict the key:
     - Click on the key to edit
     - Under "Application restrictions", select "HTTP referrers"
     - Add: `localhost:3000/*` and `*.vercel.app/*`
     - Under "API restrictions", select "Restrict key"
     - Choose: Maps JavaScript API, Places API, Geocoding API

### **2. Add API Key to Environment Variables:**

**Local (.env.local):**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Vercel Deployment:**
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Name**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value**: Your API key
   - **Environment**: Production, Preview, Development (all)

### **3. Configure API Restrictions (Security):**

In Google Cloud Console, restrict your API key to:
- **HTTP referrers**: 
  - `localhost:3000/*`
  - `*.vercel.app/*`
  - `your-custom-domain.com/*`

### **4. Test the Integration:**

1. Visit a stable detail page: `/stables/[stable-id]`
2. You should see:
   - Map displaying stable location
   - "Use My Location" button
   - Distance calculation (when location is set)

---

## 🎯 **Features:**

### **Stable Detail Page:**
- ✅ Interactive map showing stable location
- ✅ Red marker = Stable location
- ✅ "Use My Location" button for geolocation
- ✅ Click map to set pickup point
- ✅ Distance calculation (meters/kilometers)
- ✅ Estimated drive time
- ✅ Route visualization

### **Location Calculation:**
- Uses Google Maps Geometry library
- Calculates straight-line distance (as the crow flies)
- Shows driving route if available
- Displays in meters (< 1km) or kilometers

---

## 🛠️ **Troubleshooting:**

### **Map Not Loading:**
1. Check browser console for errors
2. Verify API key is set in environment variables
3. Check API key restrictions in Google Cloud Console
4. Ensure Maps JavaScript API is enabled

### **"Use My Location" Not Working:**
1. Browser may block geolocation (check permissions)
2. HTTPS required for geolocation (localhost works, Vercel uses HTTPS)
3. User must allow location access

### **Script Loading Errors:**
- Check CSP headers in `next.config.mjs`
- Verify `maps.googleapis.com` is in allowed domains
- Check network tab for failed requests

---

## 📋 **API Endpoints:**

### **GET `/api/stables/[id]/coordinates`**
Returns stable coordinates.

**Response:**
```json
{
  "stableId": "uuid",
  "stableName": "Pyramid View Stables",
  "address": "123 Pyramid Road, Giza",
  "coordinates": {
    "lat": 29.9792,
    "lng": 31.1342
  }
}
```

---

## 💰 **Costs:**

Google Maps JavaScript API pricing:
- **Free tier**: $200/month credit
- **Maps JavaScript API**: $7 per 1,000 loads
- **Geocoding API**: $5 per 1,000 requests
- **Places API**: Varies

**Example**: 10,000 map loads/month = ~$70 (within free tier)

---

## ✅ **Security Notes:**

1. ✅ API key is public (NEXT_PUBLIC_*), but restricted by domain
2. ✅ CSP headers configured in `next.config.mjs`
3. ✅ Permissions-Policy allows geolocation
4. ✅ Recommended: Restrict API key to specific domains

---

## 🚀 **Next Steps:**

1. Add Google Maps API key to environment variables
2. Deploy to Vercel with environment variable set
3. Test location sharing on stable detail page
4. (Optional) Add location picker to booking modal
5. (Optional) Save rider location preference in database

---

## 📝 **Files Created/Modified:**

1. ✅ `components/maps/LocationMap.tsx` - Main map component
2. ✅ `components/maps/StableLocationMap.tsx` - Stable-specific wrapper
3. ✅ `app/api/stables/[id]/coordinates/route.ts` - Coordinates API
4. ✅ `app/stables/[id]/page.tsx` - Integrated map
5. ✅ `next.config.mjs` - Updated CSP and permissions
6. ✅ `env.example` - Added API key example

---

✅ **Google Maps integration is ready!** Just add your API key to environment variables.

