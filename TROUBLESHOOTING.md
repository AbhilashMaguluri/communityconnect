# 🔧 TROUBLESHOOTING GUIDE - Community Connect

This guide helps you fix common issues when running the Community Connect app.

---

## Quick Diagnostics

### Is Your App Working?

✅ **Backend Running**: Visit http://localhost:5000/api/test
   - Should show: `{"success":true,"message":"Backend API is working!"}`

✅ **Frontend Running**: Visit http://localhost:3000
   - Should show the Community Connect homepage

✅ **API Connection**: Visit http://localhost:3000/test
   - Should show: "✅ Connected" with issue count

---

## Common Issues & Solutions

### Issue 1: "Cannot GET /api/test" or Backend Not Responding

**Problem**: Backend server is not running

**Solution**:
```powershell
# Stop any existing server (Ctrl+C)
cd server
npm run demo
```

**Expected Output**:
```
🚀 Server running on port 5000
🎯 Demo Mode: No database required!
```

---

### Issue 2: Frontend Shows "API Connection Failed"

**Problem**: Frontend cannot connect to backend

**Checklist**:

1. ✅ **Backend is running first**
   ```powershell
   # Check if backend is responding
   curl http://localhost:5000/api/test
   ```

2. ✅ **Environment variable is set**
   - Check `client\.env.development` contains:
     ```
     REACT_APP_API_URL=http://localhost:5000
     ```

3. ✅ **Restart frontend**
   ```powershell
   # Stop frontend (Ctrl+C)
   cd client
   npm start
   ```

---

### Issue 3: "Port 5000 is already in use"

**Problem**: Another process is using port 5000

**Solution**:
```powershell
# Find the process
netstat -ano | findstr :5000

# Kill the process (replace 1234 with actual PID)
taskkill /PID 1234 /F

# Now start server again
cd server
npm run demo
```

---

### Issue 4: "Port 3000 is already in use"

**Problem**: Another process is using port 3000

**Solution Option 1** (Kill existing):
```powershell
# Find the process
netstat -ano | findstr :3000

# Kill it
taskkill /PID 1234 /F

# Restart
cd client
npm start
```

**Solution Option 2** (Use different port):
- When prompted "Would you like to run on another port?", type `Y`
- App will start on port 3001

---

### Issue 5: "npm: command not found" or "Node.js not installed"

**Problem**: Node.js is not installed

**Solution**:
1. Download Node.js from https://nodejs.org/
2. Install Node.js (LTS version recommended)
3. Restart your terminal
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

---

### Issue 6: "Module not found" Errors

**Problem**: Dependencies are not installed

**Solution**:
```powershell
# Install server dependencies
cd server
npm install

# Install client dependencies
cd client
npm install
```

---

### Issue 7: Login Doesn't Work

**Problem**: Using wrong credentials or backend issue

**Solution**:

**Demo Mode Credentials**:
- Email: `admin@demo.com`
- Password: `demo123`

Or:
- Email: `user@demo.com`
- Password: `demo123`

**If still not working**:
1. Open browser console (F12)
2. Check for errors
3. Verify backend is responding: http://localhost:5000/api/test

---

### Issue 8: Images Don't Load

**Problem**: Image paths are incorrect

**Check**:
1. Backend is running
2. Images are uploaded correctly
3. CORS is enabled (it should be by default)

---

### Issue 9: Changes Don't Appear After Editing Code

**Problem**: Need to restart servers

**Solution**:
```powershell
# Backend: Stop (Ctrl+C) and restart
cd server
npm run demo

# Frontend: Should auto-reload, but if not:
# Stop (Ctrl+C) and restart
cd client
npm start
```

---

### Issue 10: "Cannot connect to MongoDB" Error

**Problem**: MongoDB connection failed (only in full mode)

**Solution**: Use Demo Mode instead (no database needed)
```powershell
cd server
npm run demo
```

**OR** Set up MongoDB:
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Update `server\.env` with connection string
4. Run: `npm start` (instead of `npm run demo`)

---

## Emergency Reset

If everything is broken, do a complete reset:

```powershell
# 1. Stop all servers (Ctrl+C in all terminals)

# 2. Kill all Node processes
Get-Process -Name "node" | Stop-Process -Force

# 3. Clean install
cd server
Remove-Item -Recurse -Force node_modules
npm install

cd ../client
Remove-Item -Recurse -Force node_modules
npm install

# 4. Start fresh
cd ../server
npm run demo

# 5. In new terminal, start frontend
cd client
npm start
```

---

## Testing Your Setup

### 1. Test Backend
```powershell
# Should return JSON with success: true
curl http://localhost:5000/api/test
```

### 2. Test Issues API
```powershell
# Should return array of demo issues
curl http://localhost:5000/api/issues
```

### 3. Test Frontend
- Open: http://localhost:3000
- Click "View Issues" - should show demo issues
- Try login with `admin@demo.com` / `demo123`

---

## Getting Help

### Check Logs

**Backend Logs**: Look at the terminal where you ran `npm run demo`
- Should show server start message
- Any API requests will be logged here

**Frontend Logs**: 
- Open browser console (F12 → Console tab)
- Look for errors in red

### Useful Browser Checks

1. **Network Tab** (F12 → Network)
   - See all API requests
   - Check if requests to backend are successful
   - Look for 404, 500 errors

2. **Console Tab** (F12 → Console)
   - See JavaScript errors
   - Check API response logs

---

## Production Deployment Issues

### Issue: Production Website Not Working

**Problem**: Environment variables not set correctly

**Solution for Render.com**:

1. **Backend** (Web Service):
   - Set environment variables in Render dashboard:
     - `NODE_ENV=production`
     - `JWT_SECRET=your-secret-key`
     - `MONGODB_URI=your-mongodb-connection-string`

2. **Frontend** (Static Site):
   - Set environment variable:
     - `REACT_APP_API_URL=https://your-backend-url.onrender.com`
   - Make sure Build Command is: `npm run build`
   - Publish Directory: `build`

3. **Rebuild both services** after setting environment variables

---

## Still Having Issues?

1. Check error messages carefully
2. Search for the error on Google
3. Make sure you followed all steps in `START_LOCAL.md`
4. Try the Emergency Reset (above)
5. Check that Node.js version is v14 or higher: `node --version`

---

## Quick Reference: All Commands

```powershell
# Start backend (demo mode)
cd server ; npm run demo

# Start frontend (new terminal)
cd client ; npm start

# Check if servers are running
curl http://localhost:5000/api/test  # Backend
# Visit http://localhost:3000          # Frontend

# Kill a process on a port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Reinstall dependencies
cd server ; npm install
cd client ; npm install
```

---

**Remember**: Always start the backend BEFORE the frontend!
