# 🚀 START LOCAL DEVELOPMENT

This guide will help you run Community Connect locally on your computer.

## Prerequisites
- Node.js installed (v14 or higher)
- MongoDB installed OR use demo mode (no database needed)

---

## Quick Start (3 Steps)

### Step 1: Install Dependencies

Open PowerShell in the project root folder and run:

```powershell
# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### Step 2: Start Backend Server

**Option A: Demo Mode (No Database Required - Recommended for Testing)**
```powershell
cd server
npm run demo
```

You should see:
```
🎯 Community Connect Demo Server Started!
🚀 Server running on port 5000
👤 Demo Login: admin@demo.com / demo123
```

**Option B: Full Mode (Requires MongoDB)**
```powershell
cd server
npm start
```

### Step 3: Start Frontend (Open NEW Terminal)

**Open a NEW PowerShell terminal** and run:

```powershell
cd client
npm start
```

Your browser will automatically open to: **http://localhost:3000**

---

## ✅ Testing Your Local Setup

1. **Check Backend**: Open http://localhost:5000/api/test in your browser
   - You should see: `{"success":true,"message":"Backend API is working!"}`

2. **Check Frontend**: Your app should load at http://localhost:3000
   - Try the test page: http://localhost:3000/test

3. **Test Login**:
   - Email: `admin@demo.com`
   - Password: `demo123`

---

## 🐛 Troubleshooting

### "Port already in use" Error

**Backend (Port 5000):**
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number you see)
taskkill /PID <PID> /F
```

**Frontend (Port 3000):**
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### "Cannot connect to backend" Error

1. Make sure backend is running first (Step 2)
2. Check `client\.env.development` contains:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
3. Restart the frontend

### Backend Won't Start

1. Make sure you're in the `server` folder
2. Try demo mode: `npm run demo`
3. Check if port 5000 is available

---

## 📱 Available Demo Accounts

**Admin Account:**
- Email: `admin@demo.com`
- Password: `demo123`

**Regular User:**
- Email: `user@demo.com`
- Password: `demo123`

---

## 🎯 What You Can Do

- ✅ View community issues
- ✅ Report new issues
- ✅ Vote on issues
- ✅ Add comments
- ✅ View on map
- ✅ Admin dashboard (login as admin)

---

## 📝 Quick Commands Reference

```powershell
# Start backend (demo mode)
cd server ; npm run demo

# Start frontend (in new terminal)
cd client ; npm start

# Stop servers
# Press Ctrl+C in each terminal
```

---

## 🌍 For Production Deployment

See `DEPLOYMENT_COMMANDS.md` for deploying to Render, Netlify, or Vercel.
