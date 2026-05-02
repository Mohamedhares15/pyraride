# PyraRides Workspace

## Overview

pnpm workspace monorepo using TypeScript. Egypt horse riding booking platform migrated from Next.js/Vercel to Vite + React on Replit.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: Vite + React + wouter routing (`artifacts/pyrarides`)
- **API Server**: Express 5 (`artifacts/api-server`)
- **Styling**: TailwindCSS v4 (@tailwindcss/vite)
- **Animation**: Framer Motion
- **Auth shim**: Custom fetch-based session shim (replaces next-auth)
- **Database**: PostgreSQL (configured, not yet connected to API)

## Artifacts

### `artifacts/pyrarides` (web, port 22169, path `/`)
Egypt horse riding booking platform frontend.
- Routing: wouter (replaces Next.js App Router)
- All `next/*` imports aliased via Vite to shims in `src/shims/`
- API calls proxied via Vite server proxy to `http://localhost:8080`

### `artifacts/api-server` (api, port 8080)
Express API server serving all `/api/*` routes.
- Currently returns mock data (stables, packages, academies, locations, weather)
- Routes: `/api/stables`, `/api/packages`, `/api/locations`, `/api/academies`, `/api/auth/*`, `/api/weather`, `/api/bookings`, etc.

## Key Shims (artifacts/pyrarides/src/shims/)
- `next-navigation.ts` — useRouter, usePathname, useSearchParams, useParams, notFound, redirect
- `next-auth-react.ts` — useSession, signIn, signOut, SessionProvider (fetches /api/auth/session)
- `next-image.tsx` — NextImage component (renders plain <img>)
- `next-link.tsx` — NextLink (renders wouter Link)
- `next-dynamic.ts` — dynamic() (wraps React.lazy)
- `next-script.tsx` — Script (noop)
- `next-web-vitals.ts` — reportWebVitals (noop)

## Vite Proxy
Frontend proxies all `/api/*` requests to `http://localhost:8080` via `vite.config.ts` server.proxy.

## Pages (wouter routes in src/App.tsx)
- `/` — HomePage
- `/stables` — StablesPage (browse stables)
- `/stables/:id` — StableDetailPage (individual stable)
- `/packages` — PackagesPage
- `/packages/:id` — package detail
- `/training` — TrainingPage
- `/training/:academyId` — academy detail
- `/gallery` — GalleryPage
- `/signin`, `/signup` — auth pages
- `/booking` — booking page
- `/checkout/package/:id` — package checkout
- `/dashboard/*` — rider/stable/admin/driver/captain dashboards

## Key Commands

- `pnpm --filter @workspace/pyrarides run dev` — run frontend
- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm run typecheck` — full typecheck across all packages

## Mock Data
All data is currently hardcoded in `artifacts/api-server/src/routes/api.ts`:
- 4 stables in Giza/Saqqara
- 4 packages (Sunrise Ride, Desert Adventure, etc.)
- 2 academies
- 4 horses
- 4 locations
