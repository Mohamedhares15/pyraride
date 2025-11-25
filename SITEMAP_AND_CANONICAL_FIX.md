# 🔧 Sitemap & Canonicalization Fix

## 🎯 **Issues Identified:**

1. **Sitemap Errors**: Google Search Console shows 11 errors because it's reading cached sitemap with old `pyraride.vercel.app` URLs
2. **Canonicalization Issue**: Google sees 3 different homepage versions:
   - `http://pyrarides.com/`
   - `https://pyrarides.com/`
   - `https://www.pyrarides.com/`

---

## ✅ **Fixes Applied:**

### **1. Added Domain Redirects in Middleware**
- ✅ Redirects `pyrarides.com` → `www.pyrarides.com` (301)
- ✅ Forces HTTPS for all requests (301)
- ✅ Ensures only `https://www.pyrarides.com` is accessible

### **2. Sitemap Already Fixed**
- ✅ Code uses `https://www.pyrarides.com`
- ✅ Need to wait for deployment and Google re-crawl

---

## 🚀 **Next Steps:**

### **Step 1: Deploy Changes**
1. Commit and push the middleware changes
2. Wait for Vercel deployment to complete

### **Step 2: Request Sitemap Re-crawl**
1. Go to Google Search Console → Sitemaps
2. Click "Remove" on the old sitemap
3. Submit sitemap again: `https://www.pyrarides.com/sitemap.xml`
4. Click "Request indexing" for the sitemap URL

### **Step 3: Request URL Inspection**
1. In Google Search Console, use "URL Inspection" tool
2. Inspect these URLs and request indexing:
   - `https://www.pyrarides.com/`
   - `https://www.pyrarides.com/stables`
   - `https://www.pyrarides.com/sitemap.xml`

### **Step 4: Set Preferred Domain**
1. Go to Google Search Console → Settings → Site settings
2. Under "Preferred domain", select: `www.pyrarides.com`
3. Save changes

### **Step 5: Verify Redirects**
Test these URLs to confirm redirects work:
- `http://pyrarides.com/` → Should redirect to `https://www.pyrarides.com/`
- `https://pyrarides.com/` → Should redirect to `https://www.pyrarides.com/`
- `http://www.pyrarides.com/` → Should redirect to `https://www.pyrarides.com/`

---

## ✅ **Expected Results:**

### **Within 24-48 Hours:**
- ✅ Sitemap errors should clear
- ✅ All homepage variants redirect to `https://www.pyrarides.com`
- ✅ Google will start indexing the canonical version

### **Within 1-2 Weeks:**
- ✅ "Crawled - currently not indexed" issue resolved
- ✅ All pages properly indexed
- ✅ Only `www.pyrarides.com` appears in search results

---

## 🔍 **How to Verify:**

### **Test Redirects:**
```bash
# Should redirect to https://www.pyrarides.com
curl -I http://pyrarides.com
curl -I https://pyrarides.com
curl -I http://www.pyrarides.com
```

### **Check Sitemap:**
Visit: `https://www.pyrarides.com/sitemap.xml`
- Should only show `https://www.pyrarides.com/*` URLs
- No `pyraride.vercel.app` URLs

---

## 📝 **Notes:**

- The sitemap code is correct - Google just needs to re-crawl it
- Redirects will fix the canonicalization issue automatically
- Setting preferred domain in Search Console helps Google understand your preference
- It may take a few days for Google to fully process all changes

**All fixes are in place! Deploy and follow the steps above.** 🚀

