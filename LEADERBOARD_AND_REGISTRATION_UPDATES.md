# Leaderboard & Registration System Updates

## Summary of Changes

This document outlines all the changes made to implement the new registration system with gender/level selection, integrated scoring into reviews, and the Chess.com-style league system.

---

## 1. Registration Updates ✅

### Schema Changes
- Added `Gender` enum: `male`, `female`
- Added `gender` field to `User` model (optional)
- Removed default `rankPoints` of 1400 - now set based on initial tier selection

### Registration Form Updates
- Added **Gender** dropdown (Male/Female) - required for riders
- Added **Riding Experience Level** dropdown:
  - Beginner (0-1300 points) → Starts at 650 points
  - Intermediate (1301-1700 points) → Starts at 1500 points
  - Advanced (1701+ points) → Starts at 1850 points

### API Updates
- `app/api/auth/register/route.ts`:
  - Accepts `gender` and `initialTier` in request body
  - Calculates initial `rankPoints` based on selected tier
  - Automatically assigns new riders to "wood" league
  - Creates a wood league if none exists

---

## 2. Integrated Scoring into Reviews ✅

### Removed Separate Scoring Page
- The `/dashboard/stable/score` page is no longer needed
- Scoring is now integrated directly into the rider review process

### Updated Rider Review API
- `app/api/rider-reviews/route.ts`:
  - Automatically triggers leaderboard calculation when a review is submitted
  - Uses `ridingSkillLevel` (1-10) as the RPS (Rider Performance Score)
  - Calculates points using the Payoff Matrix
  - Updates rider's `rankPoints` and creates `RideResult` record
  - Returns leaderboard update info in response

### Updated RiderReviewModal
- Shows leaderboard points change in success message
- Displays: points change, new total points, and new tier

---

## 3. League System Implementation ✅

### Schema Changes
- Added `LeagueName` enum: `wood`, `bronze`, `silver`, `gold`, `platinum`, `elite`, `champion`
- Added `LeagueStatus` enum: `active`, `ended`
- Added `League` model:
  - Tracks league periods (2 weeks each)
  - Links to next league for promotion
  - Stores start/end dates and status
- Added `LeagueStanding` model:
  - Tracks rider's final rank in each league period
  - Records if rider was promoted
  - Stores final rank points
- Updated `User` model:
  - Added `currentLeagueId` to track which league rider is in
  - Added relation to `League`

### API Routes Created
1. **`app/api/leagues/route.ts`** (GET):
   - Fetches active league standings
   - Can fetch specific league or all leagues
   - Auto-creates wood league if none exists

2. **`app/api/leagues/promote/route.ts`** (POST):
   - Admin-only endpoint to promote top 3 riders
   - Ends current league period
   - Creates standings records
   - Moves top 3 riders to next league
   - Should be called every 2 weeks (via cron job or manual admin action)

### Leaderboard Page
- **`app/leaderboard/page.tsx`**:
  - Beautiful Chess.com-style leaderboard interface
  - League selection dropdown
  - Search functionality
  - Displays:
    - Rank (#1, #2, #3 with special badges)
    - Player name and email
    - Tier badge (Beginner/Intermediate/Advanced)
    - Rank Points
    - Last Change (placeholder for future)
  - Shows current league banner with end date
  - Promotion indicator for non-champion leagues

---

## 4. League Promotion System

### How It Works
1. **League Periods**: Each league runs for 2 weeks
2. **Top 3 Promotion**: At the end of each period, top 3 riders advance to the next league
3. **League Hierarchy**:
   - Wood → Bronze → Silver → Gold → Platinum → Elite → Champion
4. **Standings Tracking**: All riders' final ranks are saved in `LeagueStanding` records

### Promotion Process
- Admin calls `/api/leagues/promote` with `leagueId`
- System:
  1. Gets top 3 riders by `rankPoints`
  2. Creates `LeagueStanding` records for all riders in the league
  3. Updates top 3 riders' `currentLeagueId` to next league
  4. Ends current league (sets status to "ended")
  5. Creates next league period if it doesn't exist

### Automation
- **Recommended**: Set up a cron job to call the promote endpoint every 2 weeks
- **Alternative**: Admin can manually trigger promotions from admin dashboard

---

## 5. Testing Checklist

### Registration
- [ ] New rider can select gender (Male/Female)
- [ ] New rider can select initial tier (Beginner/Intermediate/Advanced)
- [ ] Initial rank points are set correctly based on tier
- [ ] New rider is assigned to "wood" league

### Review & Scoring Integration
- [ ] Stable owner can review rider after completed booking
- [ ] `ridingSkillLevel` (1-10) is used as RPS
- [ ] Leaderboard points are calculated automatically
- [ ] Rider's `rankPoints` are updated
- [ ] `RideResult` record is created
- [ ] Success message shows points change

### League System
- [ ] Leaderboard page displays riders correctly
- [ ] League selection works (Wood, Bronze, Silver, etc.)
- [ ] Search functionality works
- [ ] Top 3 riders can be promoted (admin only)
- [ ] Promotion moves riders to next league
- [ ] League standings are created correctly

---

## 6. Database Migration Required

Run the following to apply schema changes:

```bash
npx prisma migrate dev --name add_gender_league_system
npx prisma generate
```

---

## 7. Next Steps

1. **Set up cron job** for automatic league promotions (every 2 weeks)
2. **Create admin UI** for manual league promotion triggers
3. **Add "Last Change" tracking** to show recent points changes in leaderboard
4. **Add league history page** to show past league standings
5. **Add notifications** when riders are promoted

---

## Files Modified

### Schema
- `prisma/schema.prisma`

### API Routes
- `app/api/auth/register/route.ts`
- `app/api/rider-reviews/route.ts`
- `app/api/leagues/route.ts` (new)
- `app/api/leagues/promote/route.ts` (new)

### Components
- `components/shared/AuthModal.tsx`
- `components/shared/RiderReviewModal.tsx`

### Pages
- `app/leaderboard/page.tsx` (new)

---

## Notes

- The separate scoring page (`app/dashboard/stable/score/page.tsx`) still exists but is no longer linked. You can delete it if desired.
- League names are stored in lowercase in the database (matching enum values).
- New riders always start in the "wood" league.
- The promotion system requires admin intervention or a cron job - it doesn't happen automatically.

