# Admin Stable Visibility Management

## Overview

Admins can now hide/show individual stables from public view through a dedicated admin interface. This allows admins to temporarily hide stables (e.g., while images are being uploaded) without affecting the database or other functionality.

## Features

### ✅ Admin Dashboard
- **Location**: `/dashboard/admin/stables`
- **Access**: Admin only
- **Features**:
  - View all stables (including hidden ones)
  - Search by name, location, or owner email
  - Filter by visibility status (All / Visible / Hidden)
  - Toggle visibility with one click
  - See stable details (owner, bookings, horses, status)

### ✅ API Endpoints

#### `GET /api/admin/stables`
- Admin-only endpoint
- Returns all stables with visibility status
- Includes statistics (total, visible, hidden counts)

#### `PATCH /api/stables/[id]/visibility`
- Admin-only endpoint
- Toggles stable visibility
- Body: `{ "isHidden": boolean }`

### ✅ Public API Behavior

#### `GET /api/stables`
- Filters out hidden stables from public results
- Admins see all stables
- Stable owners can still see their own stable (even if hidden)

#### `GET /api/stables/[id]`
- Blocks hidden stables from public view
- Returns 404 for hidden stables
- Admins can view all stables
- Stable owners can view their own stable (even if hidden)

## Database Changes

### New Field: `isHidden`
- **Type**: `Boolean`
- **Default**: `false`
- **Location**: `Stable` model in Prisma schema

### Migration
Run the migration to add the field:
```bash
npx prisma migrate dev --name add_is_hidden_to_stable
```

Or manually add to existing database:
```sql
ALTER TABLE "Stable" ADD COLUMN "isHidden" BOOLEAN DEFAULT false;
```

## How to Use

### Hide a Stable
1. Go to `/dashboard/admin/stables`
2. Find the stable you want to hide
3. Click "Hide" button
4. Stable is immediately hidden from public view

### Show a Stable
1. Go to `/dashboard/admin/stables`
2. Filter by "Hidden" to see hidden stables
3. Click "Show" button
4. Stable is immediately visible to public

### Access from Analytics Dashboard
- Admins can access the stable management page from the Analytics dashboard header
- Click "Manage Stables" button

## Security

- ✅ Only admins can toggle visibility
- ✅ Only admins can see all stables via admin API
- ✅ Hidden stables are completely invisible to public users
- ✅ Stable owners can still access their own stable dashboard
- ✅ Admins can always view all stables

## Use Cases

1. **Image Upload**: Hide stables while uploading/updating images
2. **Maintenance**: Temporarily hide stables during updates
3. **Quality Control**: Hide stables that need review before going live
4. **Seasonal**: Hide stables that are temporarily closed

## Notes

- Hidden stables still exist in the database
- Stable owners can still manage their stable normally
- Hidden stables don't appear in search results
- Hidden stables can't be booked by public users
- Admins can always access hidden stables for management

