# PyraRides - Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@neon-hostname.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="generate-a-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Prisma Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or create a migration (production)
npm run db:migrate

# Open Prisma Studio (optional, for database management)
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Project Structure

```
pyrarides/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (coming next)
│   ├── dashboard/         # Dashboard pages (coming next)
│   ├── stables/           # Stable pages (coming next)
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Homepage
│   └── globals.css        # Tailwind globals
├── components/
│   ├── sections/          # Page sections
│   │   └── Hero.tsx      # Epic hero with animations
│   ├── shared/            # Shared components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── AuthModal.tsx
│   └── ui/                # Shadcn UI components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── tabs.tsx
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── package.json
├── tailwind.config.ts    # Tailwind config with "Giza After Dark" theme
├── next.config.mjs
└── tsconfig.json
```

## 🎨 Design System

### Colors (Giza After Dark)

- `background`: `#10121A` - Deep Obsidian/Charcoal
- `foreground`: `#F5EFE6` - Luminous Sand/Off-white
- `primary`: `#D4AF37` - Vibrant Gold (CTAs)
- `secondary`: `#00F2FF` - Nile Blue (highlights)

### Fonts

- **Body**: Inter (clean, modern)
- **Display**: Exo 2 (geometric, tech-forward)

### Animations

All animations use **Framer Motion** for:
- Fade-in transitions
- Scroll-based reveals
- Micro-interactions
- Ken Burns effect on hero background

## ✅ What's Complete

- [x] Project structure with Next.js 14 App Router
- [x] TypeScript configuration
- [x] TailwindCSS with custom "Giza After Dark" theme
- [x] Prisma schema with all models
- [x] Epic Hero section with Framer Motion animations
- [x] Responsive Navbar and Footer
- [x] Shadcn UI components (Button, Dialog, Input, Tabs)
- [x] Dark mode theme

## 🔄 Coming Next

Based on your requirements, the next steps are:

1. **API Routes** - Implement authentication and CRUD endpoints
2. **Auth Setup** - Next-Auth.js configuration with Prisma adapter
3. **Stable Listings** - Browse and search functionality
4. **Booking System** - Create bookings
5. **Dashboard Pages** - For riders and stable owners

## 🐛 Troubleshooting

### "Module not found" errors
Run `npm install` again to ensure all dependencies are installed.

### Database connection issues
Check that your `DATABASE_URL` in `.env` is correct and points to a valid Neon database.

### Prisma errors
Try running:
```bash
npm run db:generate
npm run db:push
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Shadcn UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)

