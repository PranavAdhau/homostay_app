# Admin Panel Testing Guide

Complete step-by-step testing guide for all admin pages in the Homostay App.

---

## Prerequisites

### 1. Database Setup

Ensure the database is seeded with admin user and sample data:

```bash
cd server
rails db:seed
```

**Verify seed data:**
```bash
rails console
> AdminUser.count  # Should be 1
> AdminUser.first.email  # Should be "admin@homostay.com"
> Homestay.count   # Should be 3+
> Amenity.count    # Should be 8+
> Booking.count    # Should be 0+ (optional)
> exit
```

### 2. Start Servers

**Terminal 1 - Rails Server:**
```bash
cd server
rails server
# Server runs on http://localhost:3000
```

**Terminal 2 - Vite Dev Server:**
```bash
cd client
npm run dev
# Dev server runs on http://localhost:5173 (HMR only)
```

### 3. Admin Login Credentials

- **URL:** `http://localhost:3000/admin/sign_in`
- **Email:** `admin@homostay.com`
- **Password:** `password123`

---

## Test 1: Admin Login & Authentication

### Steps:

1. **Navigate to Admin Login:**
   - Open browser: `http://localhost:3000/admin/sign_in`
   - Or click any admin route and get redirected

2. **Verify Login Page:**
   - Devise login form is displayed
   - Email and password fields visible
   - Submit button present

3. **Login with Credentials:**
   - Enter email: `admin@homostay.com`
   - Enter password: `password123`
   - Click "Sign in" or press Enter

4. **Verify Successful Login:**
   - ✅ Redirected to `/admin` (dashboard)
   - ✅ AdminLayout sidebar visible on left
   - ✅ Top bar shows current page title
   - ✅ No authentication errors in console

5. **Check Browser DevTools:**
   - Network tab: `POST /admin/sign_in` returns 200/302
   - Application tab: Session cookie `_homostay_app_session` is set
   - Console: No errors

**Expected Result:** Successfully logged in, redirected to admin dashboard.

---

## Test 2: Admin Dashboard (`/admin`)

### Steps:

1. **Access Dashboard:**
   - After login, you should be at `/admin`
   - Or click "Dashboard" in sidebar
   - URL: `http://localhost:3000/admin`

2. **Verify Page Layout:**
   - ✅ Sidebar on left (desktop) or hidden (mobile)
   - ✅ Top bar shows "Dashboard" title
   - ✅ Main content area displays stats cards
   - ✅ Loading spinner appears briefly, then stats load

3. **Verify Dashboard Stats Cards:**
   - ✅ **Total Homestays** card with icon and count
   - ✅ **Active Homestays** card (green badge)
   - ✅ **Total Bookings** card
   - ✅ **Pending Bookings** card (yellow/warning badge)
   - ✅ **Approved Bookings** card (green badge)
   - ✅ **Completed Bookings** card

4. **Check Stats Values:**
   - All cards show numeric values (0 or higher)
   - Values match database counts
   - Cards have hover effects (shadow-lg on hover)

5. **Verify API Call:**
   - Open DevTools → Network tab
   - Look for: `GET /admin/api/v1/dashboard/stats`
   - Status: 200 OK
   - Response includes:
     ```json
     {
       "success": true,
       "data": {
         "total_homestays": 3,
         "active_homestays": 2,
         "total_bookings": 5,
         "pending_bookings": 2,
         "approved_bookings": 1,
         "confirmed_bookings": 1,
         "rejected_bookings": 0,
         "completed_bookings": 1
       }
     }
     ```

6. **Test Responsive Layout:**
   - Resize browser to mobile width (< 1024px)
   - ✅ Sidebar hidden by default
   - ✅ Hamburger menu appears in top bar
   - ✅ Click menu → sidebar slides in
   - ✅ Stats cards stack vertically on mobile

**Expected Result:** Dashboard displays all stats correctly, responsive layout works.

---

## Test 3: Homestays List (`/admin/homestays`)

### Steps:

1. **Navigate to Homestays:**
   - Click "Homestays" in sidebar
   - Or go to: `http://localhost:3000/admin/homestays`
   - URL should be `/admin/homestays`

2. **Verify Page Header:**
   - ✅ Title: "Homestays" (text-2xl, semibold)
   - ✅ Subtitle shows count: "X properties" or "X property"
   - ✅ "New Homestay" button on right (desktop) or below (mobile)

3. **Verify Empty State:**
   - If no homestays exist:
     - ✅ Card displayed with message: "No homestays found. Click 'New Homestay' to create one."
     - ✅ Centered text, muted color

4. **Verify Homestays Table (Desktop - md and up):**
   - ✅ Table with header row (gray background)
   - ✅ Columns: Name | Capacity | Price / Night | Status | Actions
   - ✅ Header text: uppercase, semibold, muted color
   - ✅ Each row shows:
     - Homestay name (medium weight)
     - Capacity number
     - Price formatted as "RMXX.XX"
     - Status badge (Active = green, Inactive = gray)
     - Action buttons: View | Edit | Delete

5. **Verify Mobile Cards (Mobile - below md):**
   - ✅ Table hidden, cards shown instead
   - ✅ Each card shows:
     - Name and status badge at top
     - Capacity and price in middle
     - Action buttons at bottom (View | Edit | Delete)

6. **Test Actions:**
   - **View Button:**
     - ✅ Navigates to `/properties/{slug}` (public page)
     - ✅ Opens in same tab
   
   - **Edit Button:**
     - ✅ Navigates to `/admin/homestays/{id}/edit`
     - ✅ Form loads with existing data
   
   - **Delete Button:**
     - ✅ Shows confirmation dialog: "Are you sure you want to delete this homestay? This action cannot be undone."
     - ✅ On confirm: DELETE request sent
     - ✅ On cancel: No action
     - ✅ After delete: List refreshes, homestay removed

7. **Verify API Call:**
   - Network tab: `GET /admin/api/v1/homestays`
   - Status: 200 OK
   - Response includes array of homestays with:
     - `id`, `slug`, `name`, `capacity`, `price_per_night`, `is_active`

8. **Test Loading State:**
   - ✅ Spinner appears while loading
   - ✅ Spinner centered, proper size

**Expected Result:** Homestays list displays correctly, all actions work, responsive layout functions.

---

## Test 4: Create New Homestay (`/admin/homestays/new`)

### Steps:

1. **Navigate to New Homestay Form:**
   - Click "New Homestay" button from homestays list
   - Or go to: `http://localhost:3000/admin/homestays/new`
   - URL: `/admin/homestays/new`

2. **Verify Page Header:**
   - ✅ Title: "New Homestay" (text-2xl, semibold)
   - ✅ "Cancel" button on right (X icon)
   - ✅ Cancel navigates back to `/admin/homestays`

3. **Verify Form Layout:**
   - ✅ Two-column grid on desktop (lg breakpoint)
   - ✅ Single column on mobile
   - ✅ Left column: "Property Details" card
   - ✅ Right column: "Images" card and "Amenities" card

4. **Test Property Details Card:**
   - **Name Field:**
     - ✅ Label: "Name *" (required)
     - ✅ Input field, placeholder empty
     - ✅ Required validation works
  
   - **Description Field:**
     - ✅ Label: "Description"
     - ✅ Textarea (5 rows)
     - ✅ Proper styling (border, rounded, focus ring)
  
   - **Capacity Field:**
     - ✅ Label: "Capacity *"
     - ✅ Number input, min="1"
     - ✅ Default value: 2
     - ✅ Required validation
  
   - **Size Field:**
     - ✅ Label: "Size"
     - ✅ Text input, placeholder: "e.g. 500 sqft"
     - ✅ Optional field
  
   - **Price per Night:**
     - ✅ Label: "Price per Night (RM) *"
     - ✅ Number input, min="0", step="0.01"
     - ✅ Required validation
  
   - **Booking Type:**
     - ✅ Label: "Booking Type *"
     - ✅ Select dropdown with options:
       - Date Based
       - Hour Based
       - Both
     - ✅ Required field
  
   - **Min/Max Hours (conditional):**
     - ✅ Only shows when Booking Type is "hour_based" or "both"
     - ✅ Two fields side by side
     - ✅ Number inputs, min="1"
  
   - **Active Checkbox:**
     - ✅ Checkbox with label: "Active (visible to public)"
     - ✅ Default: checked
     - ✅ Toggle works

5. **Test Images Card:**
   - ✅ Title: "Images"
   - ✅ Description text: "Upload images for this homestay."
   - ✅ File input: accepts `image/*`, multiple files
   - ✅ Styled file input button
   - ✅ Shows count when files selected: "Selected X file(s)."

6. **Test Amenities Card:**
   - ✅ Title: "Amenities"
   - ✅ Scrollable list (max-height: 80)
   - ✅ Each amenity: checkbox + label
   - ✅ Checkboxes toggle correctly
   - ✅ Multiple selection works

7. **Test Form Submission:**
   - Fill required fields:
     - Name: "Test Homestay"
     - Capacity: 4
     - Price: 150.00
     - Booking Type: "date_based"
   - Select some amenities
   - Click "Save Homestay"
   
   - **Verify API Call:**
     - Network tab: `POST /admin/api/v1/homestays`
     - Status: 201 Created or 200 OK
     - Request body includes all form data
   
   - **Verify Success:**
     - ✅ Redirected to `/admin/homestays`
     - ✅ New homestay appears in list
     - ✅ Success message (if implemented)

8. **Test Form Validation:**
   - Try submitting without required fields
   - ✅ Browser validation prevents submission
   - ✅ Required fields highlighted

9. **Test Cancel Button:**
   - ✅ Navigates back to `/admin/homestays`
   - ✅ Form data not saved

**Expected Result:** Form creates new homestay successfully, validation works, redirects correctly.

---

## Test 5: Edit Homestay (`/admin/homestays/:id/edit`)

### Steps:

1. **Navigate to Edit Form:**
   - From homestays list, click "Edit" on any homestay
   - Or go to: `http://localhost:3000/admin/homestays/1/edit`
   - URL: `/admin/homestays/{id}/edit`

2. **Verify Page Header:**
   - ✅ Title: "Edit Homestay" (not "New Homestay")
   - ✅ Cancel button present

3. **Verify Form Pre-population:**
   - ✅ All fields filled with existing data:
     - Name matches homestay name
     - Description matches
     - Capacity matches
     - Size matches
     - Price matches
     - Booking type selected correctly
     - Min/Max hours shown if applicable
     - Active checkbox matches `is_active`
     - Amenities checkboxes match existing amenities

4. **Verify API Call (Load Data):**
   - Network tab: `GET /admin/api/v1/homestays/{id}`
   - Status: 200 OK
   - Response includes full homestay data

5. **Test Editing:**
   - Change name to "Updated Test Homestay"
   - Change price to 200.00
   - Toggle some amenities
   - Click "Save Homestay"
   
   - **Verify API Call:**
     - Network tab: `PATCH /admin/api/v1/homestays/{id}`
     - Status: 200 OK
     - Request body includes updated data
   
   - **Verify Success:**
     - ✅ Redirected to `/admin/homestays`
     - ✅ Updated data reflected in list
     - ✅ Changes persist

6. **Test Image Upload (if files selected):**
   - Select image files
   - Submit form
   - ✅ FormData sent (not JSON)
   - ✅ Content-Type header removed (for FormData)
   - ✅ Images uploaded successfully

**Expected Result:** Form loads existing data, edits save correctly, redirects work.

---

## Test 6: Bookings List (`/admin/bookings`)

### Steps:

1. **Navigate to Bookings:**
   - Click "Bookings" in sidebar
   - Or go to: `http://localhost:3000/admin/bookings`
   - URL: `/admin/bookings`

2. **Verify Page Header:**
   - ✅ Title: "Bookings" (text-2xl, semibold)
   - ✅ Subtitle: "X booking(s) found"
   - ✅ Status filter dropdown on right (desktop) or below (mobile)

3. **Verify Status Filter:**
   - ✅ Dropdown with options:
     - All Statuses
     - Pending
     - Approved
     - Confirmed
     - Rejected
     - Completed
   - ✅ Filter works: changes list based on selection
   - ✅ Default: "All Statuses"

4. **Verify Empty State:**
   - If no bookings:
     - ✅ Card with message: "No bookings found"
     - ✅ Centered, proper padding

5. **Verify Booking Cards:**
   - Each booking displayed as a card with:
     - ✅ Homestay name (text-lg, semibold)
     - ✅ Status badge (colored, rounded-full):
       - Pending = yellow/warning
       - Approved = blue/primary
       - Confirmed = green/success
       - Rejected = red/destructive
       - Completed = gray/muted
     - ✅ Guest information grid:
       - Guest name
       - Email
       - Check-in date
       - Check-out date
       - Number of guests
       - Total price (RMXX.XX, semibold)
     - ✅ Action buttons (right side):
       - View button (always visible)
       - Approve button (only for pending)
       - Reject button (only for pending)

6. **Test Actions:**
   - **View Button:**
     - ✅ Navigates to `/admin/bookings/{id}` (if route exists)
     - ✅ Or shows booking details
   
   - **Approve Button (Pending Bookings Only):**
     - ✅ Click "Approve"
     - ✅ API call: `PATCH /admin/api/v1/bookings/{id}/approve`
     - ✅ Status: 200 OK
     - ✅ Booking status changes to "approved"
     - ✅ List refreshes automatically
     - ✅ Approve/Reject buttons disappear
   
   - **Reject Button (Pending Bookings Only):**
     - ✅ Click "Reject"
     - ✅ API call: `PATCH /admin/api/v1/bookings/{id}/reject`
     - ✅ Status: 200 OK
     - ✅ Booking status changes to "rejected"
     - ✅ List refreshes automatically
     - ✅ Approve/Reject buttons disappear

7. **Verify API Calls:**
   - Initial load: `GET /admin/api/v1/bookings`
   - With filter: `GET /admin/api/v1/bookings?status=pending`
   - Response includes array of bookings with all fields

8. **Test Loading State:**
   - ✅ Spinner appears while loading
   - ✅ Proper centering and sizing

9. **Test Responsive Layout:**
   - ✅ Cards stack properly on mobile
   - ✅ Action buttons adapt to screen size
   - ✅ Grid layout responsive

**Expected Result:** Bookings list displays correctly, filtering works, actions function properly.

---

## Test 7: AdminLayout Navigation & Sidebar

### Steps:

1. **Verify Sidebar (Desktop - lg and up):**
   - ✅ Fixed position, left side
   - ✅ Width: 64 (w-64 = 16rem)
   - ✅ Background: card color
   - ✅ Border on right: border-border
   - ✅ Full height (h-screen)
   - ✅ Always visible on desktop

2. **Verify Sidebar Content:**
   - ✅ Header section:
     - "Admin Panel" title (text-lg, bold, primary color)
     - Close button (X) - hidden on desktop
   - ✅ Navigation menu:
     - Dashboard (Home icon)
     - Homestays (Building2 icon)
     - Bookings (Calendar icon)
     - Active item highlighted (bg-accent, text-accent-foreground)
     - Hover effects on items
   - ✅ Footer section:
     - Logout button (LogOut icon)
     - Full width, outline variant
     - Hover: destructive color

3. **Test Navigation:**
   - Click each menu item:
     - ✅ Dashboard → `/admin`
     - ✅ Homestays → `/admin/homestays`
     - ✅ Bookings → `/admin/bookings`
   - ✅ Active state updates correctly
   - ✅ URL changes
   - ✅ Content updates (Outlet renders correct component)

4. **Verify Top Bar:**
   - ✅ Sticky position (sticky top-0)
   - ✅ Background: card color
   - ✅ Border bottom: border-border
   - ✅ Shows current page title
   - ✅ Hamburger menu (mobile only)
   - ✅ Proper padding and spacing

5. **Test Mobile Sidebar:**
   - Resize to mobile (< 1024px):
     - ✅ Sidebar hidden by default (translate-x-full)
     - ✅ Hamburger menu visible in top bar
     - Click hamburger:
     - ✅ Sidebar slides in (translate-x-0)
     - ✅ Overlay appears (backdrop-blur)
     - ✅ Close button (X) visible
   - Click overlay or close:
     - ✅ Sidebar slides out
     - ✅ Overlay disappears

6. **Test Logout:**
   - Click "Logout" button in sidebar
   - ✅ API call: `DELETE /admin/sign_out`
   - ✅ Status: 200/302
   - ✅ Redirected to `/admin/sign_in`
   - ✅ Session cleared

7. **Verify Main Content Area:**
   - ✅ Proper padding: p-4 sm:p-6 lg:p-8
   - ✅ Max width container: max-w-7xl
   - ✅ Centered: mx-auto
   - ✅ Full width: w-full

**Expected Result:** Navigation works smoothly, sidebar responsive, logout functions correctly.

---

## Test 8: AdminAuthGuard Protection

### Steps:

1. **Test Unauthenticated Access:**
   - Logout or clear session
   - Try to access: `http://localhost:3000/admin`
   - ✅ Shows loading spinner: "Verifying access…"
   - ✅ API call: `GET /admin/api/v1/dashboard/stats`
   - ✅ Status: 401 or 403
   - ✅ Redirected to `/admin/sign_in`

2. **Test Authenticated Access:**
   - Login successfully
   - Navigate to any admin route:
     - `/admin`
     - `/admin/homestays`
     - `/admin/bookings`
     - `/admin/homestays/new`
   - ✅ Loading spinner appears briefly
   - ✅ API call succeeds (200 OK)
   - ✅ Content renders
   - ✅ No redirect

3. **Test Route Changes:**
   - While logged in, navigate between admin routes
   - ✅ Auth check runs on each route change
   - ✅ If session expires, redirects to login
   - ✅ If authenticated, content loads

**Expected Result:** Unauthenticated users redirected, authenticated users can access all routes.

---

## Test 9: Error Handling & Edge Cases

### Steps:

1. **Test API Errors:**
   - Stop Rails server
   - Try to access admin dashboard
   - ✅ Error handled gracefully
   - ✅ Loading state ends
   - ✅ Error message or fallback UI shown
   - ✅ No app crash

2. **Test Network Timeout:**
   - Slow down network (DevTools → Network → Throttling)
   - Navigate to admin pages
   - ✅ Loading states work correctly
   - ✅ Timeout handled (if implemented)

3. **Test Empty States:**
   - Delete all homestays
   - Visit `/admin/homestays`
   - ✅ Empty state message displays
   - ✅ "New Homestay" button still visible

4. **Test Large Data Sets:**
   - Create 20+ bookings
   - Visit `/admin/bookings`
   - ✅ All bookings load
   - ✅ Performance acceptable
   - ✅ No UI lag

5. **Test Form Validation Errors:**
   - Try to create homestay with invalid data:
     - Negative price
     - Zero capacity
     - Missing required fields
   - ✅ Validation prevents submission
   - ✅ Error messages shown (if implemented)

6. **Test Delete Confirmation:**
   - Click delete on homestay
   - Click "Cancel" in confirmation
   - ✅ No deletion occurs
   - ✅ List unchanged

**Expected Result:** All error cases handled gracefully, no crashes.

---

## Test 10: Responsive Design Verification

### Steps:

1. **Test Desktop (1920px+):**
   - ✅ Sidebar always visible
   - ✅ Two-column form layout
   - ✅ Table view for homestays
   - ✅ Proper spacing and padding

2. **Test Tablet (768px - 1023px):**
   - ✅ Sidebar hidden, hamburger menu
   - ✅ Cards stack appropriately
   - ✅ Form may be single column
   - ✅ Touch targets adequate

3. **Test Mobile (< 768px):**
   - ✅ Sidebar hidden by default
   - ✅ Mobile menu works
   - ✅ Cards instead of tables
   - ✅ Single column forms
   - ✅ Buttons properly sized
   - ✅ Text readable

4. **Test All Breakpoints:**
   - Resize browser gradually
   - ✅ Layout adapts smoothly
   - ✅ No horizontal scroll
   - ✅ Content remains accessible

**Expected Result:** Admin panel works perfectly on all screen sizes.

---

## API Endpoints Reference

### Admin API Base URL
- Base: `http://localhost:3000/admin/api/v1`
- Requires: Authentication (Devise session)

### Endpoints Used:

1. **Dashboard Stats:**
   - `GET /admin/api/v1/dashboard/stats`
   - Returns: Statistics object

2. **Homestays:**
   - `GET /admin/api/v1/homestays` - List all
   - `GET /admin/api/v1/homestays/:id` - Get one
   - `POST /admin/api/v1/homestays` - Create
   - `PATCH /admin/api/v1/homestays/:id` - Update
   - `DELETE /admin/api/v1/homestays/:id` - Delete

3. **Bookings:**
   - `GET /admin/api/v1/bookings` - List all (with optional ?status= filter)
   - `GET /admin/api/v1/bookings/:id` - Get one
   - `PATCH /admin/api/v1/bookings/:id/approve` - Approve
   - `PATCH /admin/api/v1/bookings/:id/reject` - Reject
   - `PATCH /admin/api/v1/bookings/:id/confirm` - Confirm

4. **Amenities:**
   - `GET /admin/api/v1/amenities` - List all (for form)

5. **Authentication:**
   - `POST /admin/sign_in` - Login
   - `DELETE /admin/sign_out` - Logout

---

## Quick Testing Checklist

### Authentication
- [ ] Can login with correct credentials
- [ ] Cannot access admin routes without login
- [ ] Logout works correctly
- [ ] Session persists across page refreshes

### Dashboard
- [ ] Stats cards display correctly
- [ ] All 6 stat cards visible
- [ ] Values match database
- [ ] Loading state works
- [ ] Responsive layout works

### Homestays List
- [ ] List displays all homestays
- [ ] Table view (desktop) works
- [ ] Card view (mobile) works
- [ ] View button navigates correctly
- [ ] Edit button navigates correctly
- [ ] Delete works with confirmation
- [ ] Empty state displays when no homestays

### Create Homestay
- [ ] Form loads correctly
- [ ] All fields work
- [ ] Validation works
- [ ] Image upload works
- [ ] Amenities selection works
- [ ] Submit creates homestay
- [ ] Redirects to list after create

### Edit Homestay
- [ ] Form loads with existing data
- [ ] All fields pre-populated
- [ ] Changes save correctly
- [ ] Redirects after save
- [ ] Cancel works

### Bookings List
- [ ] List displays all bookings
- [ ] Status filter works
- [ ] Status badges display correctly
- [ ] Approve button works (pending only)
- [ ] Reject button works (pending only)
- [ ] View button works
- [ ] Empty state displays when no bookings

### Navigation & Layout
- [ ] Sidebar navigation works
- [ ] Active state highlights correctly
- [ ] Mobile menu works
- [ ] Top bar displays current page
- [ ] Responsive design works
- [ ] Container max-width works

### Error Handling
- [ ] API errors handled gracefully
- [ ] Loading states work
- [ ] Empty states display
- [ ] Form validation works
- [ ] No console errors

---

## Troubleshooting Common Issues

### Issue: Cannot login
**Solution:**
- Verify admin user exists: `rails console` → `AdminUser.first`
- Check password: Should be `password123`
- Check Rails server is running
- Check CSRF token in meta tag

### Issue: Dashboard shows "Failed to load dashboard stats"
**Solution:**
- Check Rails server logs
- Verify API endpoint: `GET /admin/api/v1/dashboard/stats`
- Check authentication (session cookie)
- Verify database has data

### Issue: Homestays list empty
**Solution:**
- Run `rails db:seed` to create sample data
- Check API response in Network tab
- Verify homestays exist: `rails console` → `Homestay.count`

### Issue: Form submission fails
**Solution:**
- Check required fields filled
- Check API endpoint in Network tab
- Verify CSRF token present
- Check Rails server logs for errors
- Verify image files are valid (if uploading)

### Issue: Sidebar not visible on mobile
**Solution:**
- Click hamburger menu in top bar
- Check z-index values
- Verify Tailwind classes applied
- Check browser console for errors

### Issue: Styling broken
**Solution:**
- Verify `index.css` and `app.css` imported correctly
- Check Tailwind config content paths
- Restart Vite dev server
- Clear browser cache

---

## Performance Testing

### Test Load Times:
1. **Dashboard:**
   - First load: < 2 seconds
   - Subsequent loads: < 500ms (cached)

2. **Homestays List:**
   - 10 homestays: < 1 second
   - 50+ homestays: < 3 seconds

3. **Bookings List:**
   - 20 bookings: < 1 second
   - 100+ bookings: < 2 seconds

### Test Interactions:
- Navigation between pages: Instant
- Form submission: < 2 seconds
- Filter changes: < 500ms
- Button clicks: Responsive (< 100ms)

---

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Next Steps After Testing

1. **Document any bugs found**
2. **Fix styling issues**
3. **Add error messages where missing**
4. **Improve loading states if needed**
5. **Add success notifications**
6. **Test with production data volumes**

---

## Notes

- All admin routes are protected by `AdminAuthGuard`
- API calls use `adminAxios` with proper base URL
- CSRF tokens handled automatically
- Session-based authentication (Devise)
- All styling uses Tailwind CSS with shadcn-ui tokens
- Responsive design: mobile-first approach
