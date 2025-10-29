# 🚨 **PHASE 1: CRITICAL FIXES**

## ✅ **ALREADY DONE:**
1. ✅ Sitemap created (`app/sitemap.ts`)
2. ✅ Robots.txt created (`app/robots.txt`)
3. ✅ Basic SEO metadata added

## 🔥 **CRITICAL - DO NOW:**

### **1. Server-Side Rendering for /stables**
**Issue**: Currently client-only, 0 HTML returned
**Fix**: Convert to server component with data fetching

### **2. Schema.org Markup (JSON-LD)**
**Need**:
- LocalBusiness per stable
- Product per ride
- BreadcrumbList
- FAQPage
- HowTo (booking process)

### **3. Accessibility Fixes**
**Need**:
- Skip link
- Heading order (h1 → h2 → h3)
- Focus states (visible)
- Color contrast ≥4.5:1
- Alt text on images
- Labels + inline errors
- prefers-reduced-motion

### **4. Trust Elements**
**Need**:
- About page
- Contact page
- Policies (privacy, terms, welfare)
- How it works section
- FAQ page
- Testimonials

### **5. Paymob Integration**
**Need**:
- Create `lib/paymob.ts`
- Create payment API route
- Add checkout flow

### **6. Booking Stepper**
**Need**:
- Multi-step form
- Sunrise/sunset presets
- EGP pricing
- WhatsApp fallback

---

## 🚀 **STARTING IMPLEMENTATION...**

