# PyraRide - Premium Horse Riding Marketplace 🐴

> The Pyramids, Unforgettable. The Ride, Uncomplicated.

A complete 2-sided marketplace connecting tourists with vetted horse stables in Giza and Saqqara, Egypt.

---

## 🎨 Design

**"Ancient-Future" / "Cyber-Pharaonic"** - Awwwards-level visuals with "Giza After Dark" palette.

### Colors
- **Background**: Deep Obsidian (#10121A)
- **Foreground**: Luminous Sand (#F5EFE6)
- **Primary**: Luminous Gold (#D4AF37)
- **Secondary**: Nile Blue (#00F2FF)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start Dev Server
```bash
npm run dev
```

Visit http://localhost:3000

---

## ✨ Features

### Complete Implementation
- ✅ **Authentication** - Sign up/login with Next-Auth
- ✅ **Browse Stables** - Search, filter by location/rating
- ✅ **Book Rides** - Horse selection, date/time, payment
- ✅ **Manage Bookings** - Cancel, reschedule with availability checks
- ✅ **Payment Processing** - Stripe Checkout integration
- ✅ **Refund System** - Request and process refunds
- ✅ **Review System** - Rate stable and horse separately
- ✅ **Dashboards** - Role-based (rider/owner/admin)
- ✅ **Analytics** - Revenue tracking, booking trends, ratings
- ✅ **AI Chat Agent** - Floating assistant for help

### Test Accounts (After Seeding)
- **Rider**: `rider1@example.com` / `Rider123`
- **Owner**: `owner@giza-stables.com` / `Owner123`
- **Admin**: `admin@pyraride.com` / `Admin123`

---

## 🏗️ Tech Stack

### Core
- **Next.js 14** (App Router)
- **TypeScript**
- **React 18**
- **Prisma** (ORM)
- **PostgreSQL** (Neon)

### UI & Styling
- **TailwindCSS** - "Giza After Dark" theme
- **Framer Motion** - Animations
- **Shadcn UI** - Components

### Services
- **Stripe** - Payments & refunds
- **Next-Auth.js v5** - Authentication
- **bcryptjs** - Password hashing

---

## 📁 Project Structure

```
pyraride/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # User dashboards
│   ├── payment/          # Payment pages
│   ├── stables/          # Browse & detail
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/
│   ├── providers/        # Auth provider
│   ├── sections/         # Page sections
│   ├── shared/           # Shared components
│   └── ui/               # Shadcn components
├── lib/
│   ├── auth.ts           # Next-Auth config
│   ├── auth-utils.ts     # Password utilities
│   ├── prisma.ts         # Prisma client
│   ├── stripe.ts         # Stripe client
│   └── utils.ts          # Utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── scripts/
    └── seed.ts           # Sample data
```

---

## 📚 Documentation

- **README.md** - This file
- **SETUP.md** - Detailed setup guide
- **AUTHENTICATION.md** - Auth system docs
- **STABLE_BROWSING_GUIDE.md** - Browse features
- **BOOKING_SYSTEM_GUIDE.md** - Booking docs
- **DASHBOARD_GUIDE.md** - Dashboard features
- **REVIEW_SYSTEM_GUIDE.md** - Review system
- **STRIPE_PAYMENT_GUIDE.md** - Payment docs
- **REFUND_SYSTEM_GUIDE.md** - Refunds
- **REVIEW_DISPLAY_GUIDE.md** - Display reviews
- **ANALYTICS_GUIDE.md** - Analytics
- **AI_AGENT_GUIDE.md** - AI chat agent

---

## 🎯 Key Features

### For Riders
- Browse & search vetted stables
- Book rides with secure payment
- Manage bookings (cancel/reschedule)
- Submit reviews with ratings
- Request refunds
- View booking history

### For Stable Owners
- Manage stable and horses
- Track bookings and earnings
- View analytics and trends
- Process refund requests
- Monitor ratings and reviews

### For Platform
- Full payment processing
- 20% platform commission
- Analytics and insights
- Role-based access control
- Complete booking lifecycle

---

## 🧑‍💻 Development

### Database Commands
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

### Build
```bash
npm run build
npm start
```

---

## 📈 Project Status

✅ **100% Complete** - Production Ready

- 80+ files created
- 10 major feature sets
- 25+ API endpoints
- 35+ components
- Complete documentation

---

## 🎉 Mission Accomplished!

**PyraRide is a complete, professional, production-ready marketplace!**

Ready to connect tourists with unforgettable Giza horse riding experiences. 🐴✨

---

**License**: Private - All rights reserved
