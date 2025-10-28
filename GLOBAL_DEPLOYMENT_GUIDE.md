# 🚀 PyraRide - Complete Global Deployment Guide

## 📋 Overview

Deploy PyraRide to make it globally accessible. This takes ~30 minutes.

**What You'll Set Up:**
1. ✅ **Neon Database** - PostgreSQL (Free tier)
2. ✅ **Vercel Hosting** - Next.js deployment (Free tier)
3. ✅ **Stripe Payments** - Payment processing (Free to start)
4. ✅ **GitHub** - Code repository (Free)

**Total Cost**: $0/month (all free tiers)

---

## 🎯 Step-by-Step Deployment

### **STEP 1: Set Up Neon Database (5 minutes)**

1. **Visit**: https://neon.tech
2. **Sign up** with email or GitHub
3. **Create Project**:
   - Click "Create Project"
   - Name: `pyraride`
   - Region: Choose closest to you (e.g., US East)
   - PostgreSQL Version: Latest (15 or 16)
   - Click "Create Project"
4. **Get Connection String**:
   - After creation, you'll see "Connection Details"
   - Click "Connection string" dropdown
   - Copy the full PostgreSQL URL
   - It looks like: `postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/pyraride?sslmode=require`
   - **IMPORTANT**: Save this! You'll need it later

**✅ Step 1 Complete!**

---

### **STEP 2: Set Up Stripe (5 minutes)**

1. **Visit**: https://stripe.com
2. **Sign up** (use email or Google)
3. **Complete Account Setup**:
   - Add business details
   - Choose "Activate account" (test mode)
4. **Get API Keys**:
   - Go to: Developers → API keys
   - Copy **Publishable key** (`pk_test_...`)
   - Click "Reveal test key" under Secret key
   - Copy **Secret key** (`sk_test_...`)
   - **Save both keys!**

5. **Enable Webhooks** (after deployment):
   - We'll set this up after Vercel deploys
   - For now, you have the keys

**✅ Step 2 Complete!**

---

### **STEP 3: Create GitHub Repository (3 minutes)**

1. **Open Terminal** in your project folder:
```bash
cd C:\Users\Administrator\Desktop\pyraride
```

2. **Initialize Git**:
```bash
git init
```

3. **Create .gitignore** (if not exists):
```bash
# Add these lines to .gitignore
node_modules
.env
.env.local
.next
```

4. **Stage and Commit**:
```bash
git add .
git commit -m "PyraRide - Production ready"
```

5. **Create GitHub Repository**:
   - Go to: https://github.com/new
   - Repository name: `pyraride`
   - Description: "PyraRide - Giza Horse Riding Marketplace"
   - Choose: **Public** or Private
   - **Don't** initialize with README
   - Click "Create repository"

6. **Push to GitHub**:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pyraride.git
git push -u origin main
```
*(Replace YOUR_USERNAME with your GitHub username)*

**✅ Step 3 Complete!**

---

### **STEP 4: Deploy to Vercel (10 minutes)**

1. **Visit**: https://vercel.com
2. **Sign up with GitHub**:
   - Click "Continue with GitHub"
   - Authorize Vercel access
3. **Import Project**:
   - Click "Add New..." → "Project"
   - Find your `pyraride` repository
   - Click "Import"

4. **Configure Project Settings**:
   - Framework Preset: **Next.js** ✅ (auto-detected)
   - Root Directory: `./` ✅ (default)
   - Build Command: `npm run build` ✅
   - Output Directory: `.next` ✅
   - Install Command: `npm install` ✅

5. **Add Environment Variables** (IMPORTANT!):
   - Scroll down to "Environment Variables"
   - Click "Add More"
   - Add each one by clicking "Add":

   **Variable 1:**
   - Name: `DATABASE_URL`
   - Value: *(Paste your Neon connection string)*
   - Environment: Production, Preview, Development ✅

   **Variable 2:**
   - Name: `NEXTAUTH_SECRET`
   - Value: `nORyje1HDo0LSAlpqqSrSedN2ZEAsb2Tt4EwsIwZumU=`
   - Environment: Production, Preview, Development ✅

   **Variable 3:**
   - Name: `NEXTAUTH_URL`
   - Value: *(Leave empty, we'll update after deployment)*
   - Environment: Production, Preview, Development ✅

   **Variable 4:**
   - Name: `STRIPE_SECRET_KEY`
   - Value: *(Paste your Stripe secret key: sk_test_...)*
   - Environment: Production, Preview, Development ✅

   **Variable 5:**
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: *(Leave empty for now)*
   - Environment: Production, Preview, Development ✅

   **Variable 6:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Environment: Production, Preview, Development ✅

6. **Deploy**:
   - Click "Deploy" button
   - Wait 2-3 minutes for build
   - Watch the build logs
   - **Success!** You'll get a URL like: `https://pyraride-xxxxx.vercel.app`

7. **Copy Your Production URL**:
   - Example: `https://pyraride-abc123.vercel.app`
   - Save this URL!

**✅ Step 4 Complete!**

---

### **STEP 5: Update NEXTAUTH_URL (2 minutes)**

1. **Go Back to Vercel**:
   - Click your project
   - Go to Settings → Environment Variables
   - Find `NEXTAUTH_URL`
   - Click edit
   - Change value to: `https://YOUR-PRODUCTION-URL.vercel.app`
   - Click "Save"
   - **Redeploy**: Go to "Deployments" → Latest → Click "..." → "Redeploy"

**✅ Step 5 Complete!**

---

### **STEP 6: Set Up Database Schema (3 minutes)**

1. **Open Terminal**:
```bash
cd C:\Users\Administrator\Desktop\pyraride
```

2. **Generate Prisma Client**:
```bash
npm run db:generate
```

3. **Push Schema to Neon**:
```bash
npx prisma db push --url="YOUR_NEON_CONNECTION_STRING"
```
*(Replace with your actual Neon connection string)*

4. **(Optional) Seed Sample Data**:
```bash
npm run db:seed
```
*(This adds test accounts and stables)*

**✅ Step 6 Complete!**

---

### **STEP 7: Configure Stripe Webhook (5 minutes)**

1. **Go to Stripe Dashboard**:
   - https://dashboard.stripe.com/test/webhooks
2. **Add Webhook Endpoint**:
   - Click "Add endpoint"
   - Endpoint URL: `https://YOUR-PRODUCTION-URL.vercel.app/api/webhook`
   - Description: "PyraRide Webhook"
   - Click "Add endpoint"
3. **Select Events**:
   - Click the endpoint you just created
   - Click "Add events"
   - Search and select:
     - ✅ `checkout.session.completed`
     - ✅ `checkout.session.async_payment_succeeded`
     - ✅ `checkout.session.async_payment_failed`
   - Click "Add events"
4. **Get Webhook Secret**:
   - After adding events, you'll see "Signing secret"
   - Click "Reveal"
   - Copy the secret: `whsec_...`
5. **Add to Vercel**:
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Find `STRIPE_WEBHOOK_SECRET`
   - Edit and paste the `whsec_...` value
   - Save
   - Redeploy: Deployments → Latest → ... → Redeploy

**✅ Step 7 Complete!**

---

## 🎉 YOU'RE LIVE!

Visit your production URL and test:

1. **Homepage**: https://your-app.vercel.app
2. **Sign Up**: Create a new account
3. **Browse Stables**: View available stables
4. **Make a Booking**: Test the booking flow
5. **Payment**: Use Stripe test card: `4242 4242 4242 4242`
6. **Dashboard**: View your bookings

**Test Cards**:
- Visa: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## 📝 Production Checklist

- [ ] Database created on Neon
- [ ] Database schema pushed
- [ ] Stripe account created
- [ ] Stripe keys added to Vercel
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] NEXTAUTH_URL updated
- [ ] Webhook configured
- [ ] Production site tested
- [ ] Payments tested

---

## 🎯 Quick Reference

### **Your URLs:**
- **Production**: `https://your-app.vercel.app`
- **Dashboard**: `https://your-app.vercel.app/dashboard`
- **Stables**: `https://your-app.vercel.app/stables`

### **Key Services:**
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Dashboard**: https://console.neon.tech
- **Stripe Dashboard**: https://dashboard.stripe.com

### **Environment Variables:**
```env
DATABASE_URL=postgresql://... (from Neon)
NEXTAUTH_SECRET=nORyje1HDo0LSAlpqqSrSedN2ZEAsb2Tt4EwsIwZumU=
NEXTAUTH_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_test_... (from Stripe)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe)
NODE_ENV=production
```

---

## 🔧 Common Issues

### **Build Fails on Vercel**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Make sure DATABASE_URL is correct

### **Database Connection Error**
- Verify Neon connection string is correct
- Check if database is running in Neon dashboard
- Try regenerating connection string

### **Payment Not Working**
- Verify Stripe keys are correct
- Check webhook is configured
- Use test card: `4242 4242 4242 4242`

### **Authentication Issues**
- Verify NEXTAUTH_URL is set correctly
- Check NEXTAUTH_SECRET is set
- Redeploy after changing environment variables

---

## 📊 Monitoring

### **Track Your App:**
- **Vercel**: View analytics, logs, performance
- **Neon**: Monitor database usage
- **Stripe**: Track payments and customers

### **Analytics:**
- Built-in Vercel Analytics
- Real-time monitoring
- Error tracking

---

## 🚀 Maintenance

### **Update Your App:**
```bash
git add .
git commit -m "Update feature"
git push
# Vercel auto-deploys!
```

### **View Logs:**
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs
```

### **Redeploy:**
- Any push to `main` branch auto-deploys
- Or manually: Vercel Dashboard → Deployments → Redeploy

---

## 🎊 Success!

**Your PyraRide marketplace is now:**
- ✅ Globally accessible
- ✅ Accepting payments
- ✅ Ready for users
- ✅ Fully functional
- ✅ Production-grade

**Next Steps:**
1. Test all features in production
2. Share your platform
3. Start getting bookings
4. Monitor analytics
5. Iterate and improve

---

## 💡 Tips

1. **Enable Vercel Analytics** for insights
2. **Set up custom domain** (optional)
3. **Monitor Stripe dashboard** regularly
4. **Check Neon usage** to stay within free tier
5. **Keep dependencies updated**

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Congratulations! Your PyraRide marketplace is live globally! 🐴✨**

