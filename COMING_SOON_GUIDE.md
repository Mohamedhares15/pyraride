# Coming Soon Mode - User Guide

## 🚀 Overview

Coming Soon mode allows you to hide your site from public view while you finish uploading images and preparing for launch. Users must sign up to access the site, and authenticated users see a "Coming Soon" overlay with a blurred background.

## 📋 Features

- ✅ Requires authentication to access the site
- ✅ Shows blurred home page background
- ✅ "Coming Soon" overlay for authenticated users
- ✅ Auto-opens sign-in modal for unauthenticated users
- ✅ Admins can always see the full site
- ✅ Email notification system to notify all users when ready

## 🔧 Setup

### 1. Enable Coming Soon Mode

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add: `COMING_SOON` = `true`
3. Redeploy the app

**In Local Development:**
1. Add to `.env.local`: `COMING_SOON=true`
2. Restart dev server

### 2. Disable Coming Soon Mode

**When you're 100% ready:**
1. Set `COMING_SOON=false` (or remove the variable)
2. Redeploy

## 📧 Notify All Users

When you're ready to launch, send emails to all registered users:

### Option 1: Using Admin Dashboard (Recommended)

Create an admin page or use the API directly:

```typescript
// POST /api/coming-soon/notify-users
// Must be authenticated as admin
```

### Option 2: Using cURL

```bash
curl -X POST https://your-domain.com/api/coming-soon/notify-users \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### What the Email Includes:

- 🎉 Welcome message
- ✨ What users can do now
- 🔗 Direct link to start exploring
- 📱 Professional HTML design

## 🔐 How It Works

### For Unauthenticated Users:
1. Visit any page → Redirected to home
2. Sign-in modal opens automatically
3. Must sign up/sign in to continue

### For Authenticated Users:
1. See blurred home page background
2. "Coming Soon" overlay in center
3. Message: "We'll notify you by email when ready"
4. Can see their email address shown

### For Admins:
- Always see full site (no overlay)
- Can access all features normally

## 🛠️ API Endpoints

### Check Status
```bash
GET /api/coming-soon/status
```
Returns: `{ enabled: true/false }`

### Toggle Mode (Admin Only)
```bash
POST /api/coming-soon/toggle
Body: { enabled: true/false }
```
Note: This returns instructions to update environment variable

### Notify All Users (Admin Only)
```bash
POST /api/coming-soon/notify-users
```
Sends launch notification email to all registered users

## 📝 Example Workflow

1. **Before Launch:**
   - Set `COMING_SOON=true`
   - Users sign up but see "Coming Soon" message
   - You upload images, add content, etc.

2. **When Ready:**
   - Upload all images ✅
   - Test everything ✅
   - Set `COMING_SOON=false`
   - POST to `/api/coming-soon/notify-users` to email all users
   - Deploy changes

3. **Users Receive:**
   - Email: "🎉 PyraRide is Now Live!"
   - Can now fully use the site
   - See all content without overlay

## 🎨 Customization

The Coming Soon component is in:
- `components/shared/ComingSoon.tsx`

You can customize:
- Message text
- Colors/styling
- Blur amount
- Overlay design

## 🔒 Security

- Middleware checks authentication before allowing access
- Admin role bypasses coming soon mode
- All API endpoints require admin authentication
- Email sending is rate-limited by your email provider

## 📊 User Experience

### Sign Up Flow:
1. User visits site
2. Sees blurred background
3. Sign-in modal appears
4. User creates account
5. After sign-in: sees "Coming Soon" overlay
6. Receives email when site launches

### Launch Flow:
1. Admin disables coming soon mode
2. Admin sends notification emails
3. Users receive email
4. Users visit site → Full access!

## ⚠️ Important Notes

- **Don't forget to disable coming soon mode** before launching!
- **Test email sending** before sending to all users
- **Admins are always excluded** from coming soon overlay
- **Public API routes** still work (e.g., `/api/auth/*`)

## 🐛 Troubleshooting

**Users still see full site?**
- Check `COMING_SOON` environment variable is set to `true`
- Clear browser cache
- Check middleware is running

**Sign-in modal not opening?**
- Check browser console for errors
- Verify AuthModal component is loaded
- Check session status

**Emails not sending?**
- Verify email configuration in environment variables
- Check email provider limits
- Review server logs for errors

---

**Need Help?** Check the code in:
- `middleware.ts` - Authentication checks
- `components/shared/ComingSoon.tsx` - Overlay component
- `app/api/coming-soon/*` - API endpoints

