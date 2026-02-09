# 🚀 Quick Start Guide

## First Time Setup (One-time only)

### 1. Install Node.js
- Download from: https://nodejs.org/
- Install and restart your computer

### 2. Setup Backend
Open **Command Prompt** or **PowerShell** and run:

```bash
cd F:\erp\backend
npm install
npm run db:seed
```

### 3. Setup Frontend
Open a **NEW** Command Prompt window and run:

```bash
cd F:\erp\frontend
npm install
```

---

## Starting the System (Every time)

### Option 1: Manual Start (Two terminals)

**Terminal 1 - Backend:**
```bash
cd F:\erp\backend
npm run dev
```
Keep this window open!

**Terminal 2 - Frontend:**
```bash
cd F:\erp\frontend
npm run dev
```
Keep this window open!

### Option 2: Quick Start Script (Windows)

Create a file named `start-erp.bat` with this content:

```batch
@echo off
echo Starting Mobile Shop ERP...

start "ERP Backend" cmd /k "cd /d F:\erp\backend && npm run dev"
timeout /t 3
start "ERP Frontend" cmd /k "cd /d F:\erp\frontend && npm run dev"

echo.
echo Both servers started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window (servers will keep running)...
pause
```

Double-click `start-erp.bat` to start both servers!

---

## Accessing the System

1. Wait for both servers to start (10-15 seconds)
2. Open Chrome or Edge browser
3. Go to: **http://localhost:5173**
4. Login with:
   - **Username:** admin
   - **Password:** admin123

**⚠️ IMPORTANT:** Change password after first login!

---

## Stopping the System

- Close both command prompt windows
- OR press `Ctrl+C` in each window

---

## Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**⚠️ Change this password immediately after first login!**

---

## Need Help?

1. **Backend not starting?**
   - Make sure Node.js is installed: `node --version`
   - Check if port 5000 is available
   - Try: `npm install` again

2. **Frontend not starting?**
   - Make sure backend is running first
   - Check if port 5173 is available
   - Try: `npm install` again

3. **Can't login?**
   - Run: `cd F:\erp\backend && npm run db:seed`
   - This will recreate the admin user

4. **Database errors?**
   - Delete `F:\erp\backend\database\erp.db`
   - Run: `npm run db:seed` again

---

## Daily Usage

1. **Start** → Run both servers
2. **Login** → Use your credentials
3. **Work** → Add inventory, create sales, view reports
4. **Backup** → Backups are in `F:\erp\backend\backups`
5. **Stop** → Close terminal windows when done

---

## Backup Recommendations

- Backups are automatic after each operation
- Copy `F:\erp\backend\database\erp.db` to USB weekly
- Copy `F:\erp\backend\backups` folder to external drive monthly

---

**🎉 You're all set! Enjoy using your Mobile Shop ERP system!**
