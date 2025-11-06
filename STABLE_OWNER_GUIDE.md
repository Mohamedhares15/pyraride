# 🏢 **Quick Start: Adding Stable Owners**

## **✅ Fastest Method (Recommended)**

### **Step 1: Run the Test Script**

```bash
# From your project root
npx tsx scripts/create-test-stable-owners.ts
```

This creates:
- ✅ 5 stable owners (emails: ahmed@giza-pyramids.com, mohamed@giza-desert.com, etc.)
- ✅ 5 approved stables (2 in Giza, 3 in Saqqara)
- ✅ 15 horses (3 per stable)
- ✅ All password: `Test123!`

---

## **Step 2: Sign In as Stable Owner**

1. Go to: https://pyraride.vercel.app
2. Click "Sign In"
3. Use:
   - Email: `ahmed@giza-pyramids.com`
   - Password: `Test123!`
4. Click "Sign In"
5. You'll see the **Stable Owner Dashboard**! ✅

---

## **Step 3: View Your Stable**

- Go to: https://pyraride.vercel.app/stables
- You'll see "Giza Pyramid Tours" and other test stables!
- Click on any stable to see details

---

## **Manual Method (Via Database)**

### **Option A: Via Neon Console**

1. Go to: https://console.neon.tech
2. Open SQL Editor
3. Copy paste the SQL from `CREATE_TEST_STABLE_OWNERS.sql`
4. Run it!
5. ✅ Done!

### **Option B: Create One Stable Owner**

1. **Register via website** (becomes rider automatically)
2. **Update role in database**:

```sql
UPDATE "User" 
SET role = 'stable_owner' 
WHERE email = 'your@email.com';
```

3. **Sign out and sign back in**
4. **Create stable via API** (see below)

---

## **Create Stable via API**

After signing in as stable_owner:

```bash
curl -X POST https://pyraride.vercel.app/api/stables \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{
    "name": "My Stable Name",
    "description": "Beautiful stable description",
    "location": "Giza",
    "address": "123 Pyramid Road, Giza, Egypt"
  }'
```

Or use Postman/Thunder Client with your session cookie!

---

## **Test Accounts Created by Script**

| Email | Name | Stable | Location |
|-------|------|--------|----------|
| ahmed@giza-pyramids.com | Ahmed Ali | Giza Pyramid Tours | Giza |
| mohamed@giza-desert.com | Mohamed Hassan | Giza Desert Adventures | Giza |
| fatima@saqqara-stables.com | Fatima Mahmoud | Saqqara Historical Stables | Saqqara |
| omar@royal-rides.com | Omar Khaled | Royal Horse Rides | Saqqara |
| nour@ancient-paths.com | Nour Abdelrahman | Ancient Paths Stables | Saqqara |

**All passwords: `Test123!`**

---

## **✅ Verify It Works**

1. Sign in as any stable owner
2. Go to `/dashboard/stable` - should see your stable dashboard!
3. Go to `/stables` - should see your stable listed!

---

## **Need Help?**

- Check `HOW_TO_ADD_STABLE_OWNERS.md` for detailed guide
- Check `CREATE_TEST_STABLE_OWNERS.sql` for SQL version
- All stables are auto-approved for testing!

