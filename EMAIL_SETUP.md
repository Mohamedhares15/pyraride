# 📧 **Email Configuration Guide**

## ✅ **What's Been Implemented:**

1. **Email Service** (`lib/email.ts`)
   - Professional HTML email template
   - Booking confirmation emails
   - Responsive design
   - Green gradient header matching booking modal

2. **Integration**
   - Automatically sends email when booking is confirmed
   - Includes all booking details
   - Beautiful, professional formatting

---

## 🔧 **Setup Instructions:**

### **Option 1: Gmail (Recommended for Testing)**

1. **Enable 2-Step Verification**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "PyraRide" as the name
   - Copy the generated 16-character password

3. **Add to Environment Variables**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### **Option 2: Other SMTP Services**

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-smtp-user
EMAIL_PASSWORD=your-mailgun-smtp-password
```

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

---

## 📋 **Environment Variables:**

Add to `.env.local` (local) or Vercel Environment Variables (production):

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-or-api-key

# Base URL (for email links)
NEXTAUTH_URL=https://pyraride.vercel.app
```

---

## 📧 **Email Template Features:**

- ✅ **Green Gradient Header** - Matches booking confirmation modal
- ✅ **Success Icon** - Visual confirmation
- ✅ **Professional Layout** - Clean, modern design
- ✅ **Booking Details** - Date, time, horse, location
- ✅ **Payment Info** - Total amount with payment note
- ✅ **Booking Reference** - Unique booking ID
- ✅ **Call-to-Action** - Link to view bookings
- ✅ **Footer** - Contact information and branding
- ✅ **Responsive** - Works on all email clients

---

## 🧪 **Testing:**

1. Create a test booking
2. Check your email inbox
3. Email should arrive within a few seconds
4. Check spam folder if not received

---

## 🔒 **Security Notes:**

- ✅ Never commit email credentials to Git
- ✅ Use App Passwords, not regular passwords
- ✅ Store credentials in environment variables only
- ✅ For production, use a dedicated email service (SendGrid, Mailgun, etc.)

---

## 📝 **Email Content:**

The email includes:
- Booking confirmation message
- Date and time of booking
- Horse information
- Meeting location
- Total amount
- Booking reference ID
- Link to view bookings

---

## 🎨 **Customization:**

Edit `lib/email.ts` to customize:
- Email template design
- Colors and styling
- Additional information
- Footer content

---

✅ **Email sending is ready!** Just add your email credentials to environment variables.

