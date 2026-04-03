# Quick Start Guide

## 1. Initial Setup (One-time)

```bash
# Install backend dependencies
cd server
bundle install

# Install frontend dependencies
cd ../client
npm install

# Set up database
cd ../server
rails db:create
rails db:migrate
rails db:seed
```

## 2. Start Development Servers

**Terminal 1 - Rails:**
```bash
cd server
rails server
```

**Terminal 2 - Vite:**
```bash
cd client
npm run dev
```

**Terminal 3 - Sidekiq (optional, for background jobs):**
```bash
cd server
bundle exec sidekiq
```

## 3. Access Application

- **Frontend:** http://localhost:3000 (Rails serves React SPA)
- **Vite Dev:** http://localhost:5173 (only for HMR, not directly accessed)
- **Admin Login:** http://localhost:3000/admin/sign_in
  - Email: `admin@homostay.com`
  - Password: `password123`

## 4. Quick Test Flow

1. **Browse Properties:** Visit http://localhost:3000
2. **View Details:** Click "Details" on any homestay card
3. **Submit Booking:** Fill form and submit (creates pending booking)
4. **Admin Approve:** Login as admin → Bookings → Approve booking
5. **Verify Lock:** Check property detail page - dates should be unavailable

## 5. Check Database

```bash
cd server
rails console

# View all bookings
Booking.all

# View all homestays
Homestay.all

# Check availability
Homestay.first.available_dates(Date.today, Date.today + 30)
```

## Common Commands

```bash
# Reset database
rails db:drop db:create db:migrate db:seed

# Check routes
rails routes | grep api

# View logs
tail -f log/development.log

# Run console
rails console
```
