# 🧪 **PyraRide Phase 2 - Complete Testing Guide**

## 📋 **Overview**
This guide covers all 7 Phase 2 features with step-by-step testing instructions.

---

## **Feature 1: Admin Location Management** 🗺️

### **What It Does:**
Admins can create, edit, activate/deactivate, and delete locations (Giza, Saqqara, etc.) dynamically. Locations replace hardcoded values throughout the platform.

### **How to Test:**

#### **1.1 Access Admin Locations Page**
1. Sign in as **Admin** user:
   - Email: `admin@pyraride.com`
   - Password: `Admin123`
2. Navigate to: `/dashboard/admin/locations`
   - Or click "Analytics" → "Manage Locations" link

#### **1.2 Create a New Location**
1. In the "Add New Location" section, type a location name (e.g., "Memphis")
2. Click "Add Location" button
3. ✅ **Expected Result:** New location appears in the list below

#### **1.3 Edit a Location**
1. Click the **Edit** button (pencil icon) next to any location
2. Change the location name
3. Click "Save Changes"
4. ✅ **Expected Result:** Location name updates in the list

#### **1.4 Toggle Location Active/Inactive**
1. Click the **Toggle** switch next to a location
2. ✅ **Expected Result:** 
   - Switch changes color (green = active, gray = inactive)
   - Location disappears from public dropdowns when inactive

#### **1.5 Delete a Location**
1. Click the **Delete** button (trash icon) next to a location
2. Confirm deletion
3. ✅ **Expected Result:** Location is removed from the list

#### **1.6 Verify Location Appears in Stable Management**
1. Sign in as a **Stable Owner**
2. Go to `/dashboard/stable/manage`
3. Check the "Location" dropdown
4. ✅ **Expected Result:** Only active locations appear in the dropdown

---

## **Feature 2: Email Notifications for Stable Owners** 📧

### **What It Does:**
When a rider creates a booking, all stable owners associated with that stable receive an automatic email notification with booking details and rider information.

### **How to Test:**

#### **2.1 Set Up Email Configuration (If Not Already Done)**
1. Ensure your `.env` file has:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

#### **2.2 Create a Booking as Rider**
1. Sign in as a **Rider** user:
   - Email: `rider1@example.com`
   - Password: `Rider123`
2. Browse stables: `/stables`
3. Click on any stable
4. Select a horse and time slot
5. Complete the booking process

#### **2.3 Check Email Notification**
1. Check the email inbox of the stable owner(s)
2. ✅ **Expected Result:**
   - Email subject: `🐴 New Booking: [Horse Name] - [Date]`
   - Email contains:
     - Horse name
     - Booking date and time
     - Rider name and email
     - Rider phone number (if provided)
     - Total booking value
     - Link to dashboard

#### **2.4 Test with Multiple Owners (Feature 3 Integration)**
1. Add a second owner to a stable (see Feature 3)
2. Create a new booking for that stable
3. ✅ **Expected Result:** Both owners receive email notifications

---

## **Feature 3: Multiple Stable Owners** 👥

### **What It Does:**
One stable can now have multiple owners. All owners have equal access to manage the stable, view bookings, and receive notifications.

### **How to Test:**

#### **3.1 View Current Owners**
1. Sign in as **Stable Owner**
2. Navigate to `/dashboard/stable/manage`
3. Scroll to "Manage Stable Owners" section
4. ✅ **Expected Result:** See list of all current owners for your stable

#### **3.2 Add a New Owner**
1. In "Manage Stable Owners" section, find the "Add Owner" input field
2. Enter an email address of an existing user (they must have an account)
3. Click "Add Owner" button
4. ✅ **Expected Result:**
   - New owner appears in the owners list
   - Success message appears
   - The added user's `stableId` is now set to this stable

#### **3.3 Verify New Owner Can Access Stable**
1. Sign out
2. Sign in as the newly added owner
3. Navigate to `/dashboard/stable`
4. ✅ **Expected Result:**
   - Owner can see the stable dashboard
   - Can view all bookings
   - Can manage horses and stable settings

#### **3.4 Remove an Owner**
1. As the primary owner, go to `/dashboard/stable/manage`
2. Find the owner you want to remove in the list
3. Click "Remove" button next to their name
4. ✅ **Expected Result:**
   - Owner is removed from the list
   - They can no longer access the stable dashboard
   - Their `stableId` is set to `null`

#### **3.5 Test Primary Owner Protection**
1. Try to remove the primary owner (yourself)
2. ✅ **Expected Result:** 
   - Remove button should be disabled or show an error
   - Primary owner cannot be removed

---

## **Feature 4: Advance Slot Blocking System** 🚫

### **What It Does:**
Stable owners can block specific time slots to prevent bookings. Can block entire stable or specific horses at specific times.

### **How to Test:**

#### **4.1 Access Schedule Management**
1. Sign in as **Stable Owner**
2. Navigate to `/dashboard/stable/schedule`
   - Or click "Schedule" button from stable dashboard

#### **4.2 Select Date and Horse**
1. Use the calendar to select a date
2. Select a horse from the dropdown (or "All Horses" for stable-wide blocking)
3. ✅ **Expected Result:** Available time slots appear below

#### **4.3 Block a Specific Time Slot**
1. Look at the available time slots displayed
2. Click "Block" button on any available slot
3. Optionally add a reason (e.g., "Maintenance")
4. Click confirm
5. ✅ **Expected Result:**
   - Slot changes to "Blocked" status with red indicator
   - Slot is no longer available for booking
   - Success toast notification appears

#### **4.4 Verify Blocked Slot Doesn't Appear for Riders**
1. Sign out and sign in as a **Rider**
2. Navigate to the stable detail page
3. Try to book a horse for the blocked time slot
4. ✅ **Expected Result:** Blocked slot does NOT appear in available booking times

#### **4.5 Block Entire Stable (No Horse Selected)**
1. As stable owner, go to schedule page
2. Select "All Horses" from dropdown
3. Select a date
4. Block a time slot
5. ✅ **Expected Result:** All horses are blocked for that time across the stable

#### **4.6 Unblock a Slot (Future Feature)**
- Currently, blocked slots remain blocked
- To unblock, you would need to manually delete from database or add an "Unblock" feature

---

## **Feature 5: Lead Time Controls & Simplified Booking** ⏰

### **What It Does:**
- **Lead Time:** Stables can set minimum hours before a booking (default: 8 hours)
- **Simplified Booking:** Time slots are clickable on stable detail page, auto-fills booking modal

### **How to Test:**

#### **5.1 Test Lead Time Enforcement**
1. As **Rider**, navigate to any stable detail page
2. Try to book a slot within the next 8 hours
3. ✅ **Expected Result:** 
   - Slot is not available for booking
   - Only slots 8+ hours in the future are shown

#### **5.2 Adjust Lead Time (As Stable Owner)**
1. Sign in as **Stable Owner**
2. Go to `/dashboard/stable/manage`
3. Find "Minimum Lead Time" setting
4. Change the value (e.g., to 12 hours)
5. Save changes
6. ✅ **Expected Result:**
   - Setting is saved
   - Riders now see bookings blocked for 12+ hours ahead

#### **5.3 Test Simplified Booking (Clickable Slots)**
1. As **Rider**, go to any stable detail page (`/stables/[id]`)
2. Scroll to the horses section
3. Look at available time slots displayed for each horse
4. Click directly on a time slot
5. ✅ **Expected Result:**
   - Booking modal opens automatically
   - Horse, date, and time are pre-filled
   - Rider just needs to confirm booking
   - One-click booking experience

#### **5.4 Verify Time Slot Availability**
1. Check that only available slots are shown (not booked or blocked)
2. ✅ **Expected Result:** Only green/available slots are clickable

---

## **Feature 6: Leaderboard/Scoring System** 🏆

### **What It Does:**
Cheat-proof leaderboard system using a Payoff Matrix. Stable owners rate rider performance (1-10 RPS), and points are calculated based on:
- Rider's current tier (Beginner/Intermediate/Advanced - calculated from points)
- Horse's admin-assigned tier (set by administrators only)
- Performance score: Pass (7+) or Fail (≤6)

### **Prerequisites:**
- **Admin must set horse adminTier first** (Feature 6.1 below)
- Horses must have adminTier set before they can be scored

### **How to Test:**

#### **6.1 Set Horse Admin Tier (Admin Only)**
1. Sign in as **Admin** user:
   - Email: `admin@pyraride.com`
   - Password: `Admin123`
2. Navigate to `/dashboard/admin/horses`
   - Or click "Manage Horse Admin Tiers" from analytics page
3. Search for a horse by name or stable name
4. Select an admin tier for the horse:
   - **Beginner:** Easy horses for new riders
   - **Intermediate:** Moderate difficulty horses
   - **Advanced:** Challenging horses for experts
5. Click "Save Tier" button
6. ✅ **Expected Result:**
   - Success toast appears
   - Horse's adminTier is saved
   - Only admins can change this (stable owners cannot)

#### **6.2 Access Scoring Page (Stable Owner)**
1. Sign in as **Stable Owner**
2. Navigate to `/dashboard/stable/score`
   - Or find "Score Rides" link in navigation
3. ✅ **Expected Result:** Page loads showing scoring interface

#### **6.3 View Completed Bookings**
1. Page should load with a list of completed bookings that haven't been scored yet
2. ✅ **Expected Result:** 
   - See list of completed rides
   - Each shows: rider name, horse name, date, time
   - Only bookings for horses WITH adminTier set are shown (if filtering is implemented)

#### **6.4 Select a Booking to Score**
1. Click on a booking card to select it
2. ✅ **Expected Result:**
   - Booking is highlighted/selected
   - Single scoring slider appears below (RPS only)

#### **6.5 Score Rider Performance (RPS 1-10)**
1. Use the "Rider Performance Score" slider (1-10)
   - 1-6 = Fail (points penalty)
   - 7-10 = Pass (points gain)
2. Adjust the slider
3. ✅ **Expected Result:**
   - Score updates in real-time
   - Label shows current score (e.g., "Score: 8/10")
   - Descriptive text shows Pass/Fail status
   - Info box explains that horse tier is set by admins

#### **6.6 Submit Score**
1. With slider adjusted, click "Submit Score" button
2. ✅ **Expected Result:**
   - Success toast appears showing:
     - Rider points change (e.g., "+15 pts" or "-10 pts")
     - New total points
     - New tier (if changed)
   - Booking disappears from unscored list
   - Rider's rankPoints updated in database
   - Rider's tier updated if points crossed threshold
   - `RideResult` record created with rps and pointsChange

#### **6.7 Verify Payoff Matrix Calculation**
Test different scenarios:

**Scenario A: Beginner Rider (0-1300 pts) + Beginner Horse + Pass (7+)**
- ✅ **Expected Result:** +15 points

**Scenario B: Beginner Rider + Advanced Horse + Pass (7+)**
- ✅ **Expected Result:** +70 points (big bonus!)

**Scenario C: Intermediate Rider (1301-1700 pts) + Beginner Horse + Pass (7+)**
- ✅ **Expected Result:** -20 points (penalty for riding down)

**Scenario D: Advanced Rider (1701+ pts) + Beginner Horse + Pass (7+)**
- ✅ **Expected Result:** -50 points (huge penalty for riding down)

**Scenario E: Advanced Rider + Advanced Horse + Pass (7+)**
- ✅ **Expected Result:** +25 points

**Scenario F: Any Rider + Any Horse + Fail (≤6)**
- ✅ **Expected Result:** Negative or zero points based on matrix

#### **6.8 Verify Points and Tier Updated**
1. Check rider's database record:
   ```sql
   SELECT id, email, "rankPoints", "rankId" FROM "User" WHERE email = '[rider-email]';
   ```
2. Check if tier changed:
   ```sql
   SELECT r.name FROM "RiderRank" r 
   JOIN "User" u ON u."rankId" = r.id 
   WHERE u.email = '[rider-email]';
   ```
3. ✅ **Expected Result:**
   - `rankPoints` value has changed correctly
   - `rankId` points to correct tier (Beginner/Intermediate/Advanced)
   - Tier name matches point range

#### **6.9 Test Already Scored Booking**
1. Try to score the same booking again
2. ✅ **Expected Result:** 
   - Booking doesn't appear in the list (already scored)
   - Each ride can only be scored once

#### **6.10 Test Horse Without AdminTier**
1. Try to score a booking for a horse that doesn't have adminTier set
2. ✅ **Expected Result:**
   - Error message: "Horse admin tier must be set by an administrator before scoring"
   - Scoring is blocked until admin sets the tier

---

## **Feature 7: Admin Horse Tier Management** 🎯

### **What It Does:**
Admins can set and manage the difficulty tier (Beginner/Intermediate/Advanced) for each horse. This tier is locked and cannot be changed by stable owners, ensuring fair leaderboard calculations.

### **How to Test:**

#### **7.1 Access Admin Horses Page**
1. Sign in as **Admin**
2. Navigate to `/dashboard/admin/horses`
   - Or click "Manage Horse Admin Tiers" from analytics dashboard

#### **7.2 Search for Horses**
1. Use the search bar to find horses by name or stable name
2. ✅ **Expected Result:** Horses list filters in real-time

#### **7.3 Set Admin Tier for Horse**
1. Find a horse in the list
2. Select an admin tier from dropdown:
   - **Beginner** - Easy horses suitable for new riders
   - **Intermediate** - Moderate difficulty horses
   - **Advanced** - Challenging horses for expert riders
   - **Not Set** - Remove tier assignment
3. Click "Save Tier" button
4. ✅ **Expected Result:**
   - Success toast appears
   - Horse's adminTier is saved in database
   - "Current: [Tier Name]" updates below button

#### **7.4 Verify Tier is Locked from Stable Owners**
1. Sign in as **Stable Owner**
2. Try to edit a horse (go to `/dashboard/stable/horses`)
3. Try to change the adminTier (if it appears in form)
4. ✅ **Expected Result:**
   - adminTier field is read-only or hidden
   - Stable owner cannot modify adminTier
   - Only admins can change it

#### **7.5 Bulk Tier Assignment**
1. As admin, set tiers for multiple horses
2. ✅ **Expected Result:** All changes save correctly and persist

#### **7.6 Verify Tier Used in Scoring**
1. Set a horse's tier to "Advanced"
2. Have a Beginner rider ride that horse
3. Score the ride with Pass (7+)
4. ✅ **Expected Result:** Rider gets +70 points (Beginner + Advanced + Pass)

---

## **🧪 Complete Testing Checklist**

### **As Admin:**
- [ ] Create a new location
- [ ] Edit a location name
- [ ] Toggle location active/inactive
- [ ] Delete a location
- [ ] Verify locations appear in stable management

### **As Stable Owner:**
- [ ] Receive email notification when booking is made
- [ ] View all stable owners
- [ ] Add a new owner by email
- [ ] Remove an owner (except primary)
- [ ] Block a specific time slot
- [ ] Block entire stable for a time
- [ ] Adjust minimum lead time
- [ ] Score a completed ride (RPS 1-10 only)
- [ ] Verify points calculated correctly based on horse adminTier
- [ ] Cannot change horse adminTier (admin-only)

### **As Admin:**
- [ ] Set admin tier for horses (Beginner/Intermediate/Advanced)
- [ ] Search and filter horses
- [ ] Verify stable owners cannot change adminTier

### **As Rider:**
- [ ] See only available time slots (respects lead time)
- [ ] Click on time slot to auto-fill booking
- [ ] Cannot book blocked time slots
- [ ] Cannot book within lead time window
- [ ] View locations in stable selection dropdown

---

## **🐛 Common Issues & Solutions**

### **Issue: Email Not Sending**
- **Check:** `.env` file has correct email configuration
- **Check:** Email service (Gmail) allows less secure apps or use app password
- **Check:** Console logs for email errors

### **Issue: Can't Add Owner**
- **Solution:** User must exist first. Create account, then add as owner.

### **Issue: Blocked Slots Still Bookable**
- **Check:** Refresh browser cache
- **Check:** Booking API checks blocked slots correctly

### **Issue: Lead Time Not Enforcing**
- **Check:** Stable's `minLeadTimeHours` is set correctly
- **Check:** Slots API uses current time + lead time for filtering

---

## **✅ Testing Complete!**

Once all features are tested and working, Phase 2 is **100% complete**!

🎉 **Congratulations!** All 7 features are now implemented with the new cheat-proof leaderboard system!

---

## **📊 Payoff Matrix Reference**

Use this table to verify point calculations:

| Rider Tier | Horse Tier | RPS 7+ (Pass) | RPS ≤6 (Fail) |
|------------|-----------|---------------|---------------|
| **Beginner** | Beginner | +15 | -10 |
| **Beginner** | Intermediate | +30 | -5 |
| **Beginner** | Advanced | +70 | 0 |
| **Intermediate** | Beginner | -20 | -40 |
| **Intermediate** | Intermediate | +20 | -15 |
| **Intermediate** | Advanced | +50 | -10 |
| **Advanced** | Beginner | -50 | -80 |
| **Advanced** | Intermediate | -10 | -30 |
| **Advanced** | Advanced | +25 | -20 |

**Key Rules:**
- Beginner riders get bonus for passing advanced horses (+70!)
- Advanced riders lose points for riding beginner horses (penalty)
- Failing on advanced horses as beginner = no penalty (0 points)
- Riding down (advanced rider on beginner horse) = always negative points

