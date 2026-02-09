# Mobile Shop ERP - Complete System

A **local-only**, web-based inventory and sales management system for mobile phone shops. Runs entirely on a Windows PC without internet connectivity.

## 🎯 Key Features

### ✅ Phase 1 (MVP) - IMPLEMENTED

- ✅ **User Authentication** - Secure login with JWT tokens
- ✅ **Mobile Inventory** - Full CRUD with IMEI validation (15-digit, Luhn algorithm)
- ✅ **Accessory Inventory** - Quantity-based tracking with low stock alerts
- ✅ **Sales Management** - Create sales with automatic stock updates
- ✅ **Customer Records** - Track customer information
- ✅ **Dashboard** - Real-time business metrics
- ✅ **Reports** - Sales reports with date range filtering
- ✅ **Database Backups** - Manual and automatic backup utilities
- ✅ **Local Storage** - SQLite database (no cloud, no browser storage)
- ✅ **Offline-First** - Works completely without internet
- ✅ **📱 Mobile Responsive** - Works on phones, tablets, laptops, and desktops

### 📋 Phase 2 (Future Enhancements)

- Staff role with restricted permissions
- Purchase management module
- Advanced IMEI history tracking
- PDF invoice generation
- Excel export for reports
- Automatic daily backups
- Audit logs
- Barcode/IMEI scanner integration

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│           Windows PC (Local Machine)            │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐         ┌──────────────────┐  │
│  │   Frontend  │ ◄─────► │     Backend      │  │
│  │   React     │  HTTP   │   Node.js +      │  │
│  │ (Port 5173) │         │   Express        │  │
│  └─────────────┘         │   (Port 5000)    │  │
│         │                └──────────────────┘  │
│         │                         │            │
│         │                         ▼            │
│         │                ┌──────────────────┐  │
│         │                │  SQLite Database │  │
│         └───────────────►│   (erp.db file)  │  │
│      (Access via         └──────────────────┘  │
│       Browser)                                  │
└─────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS
- React Router v6
- Axios for API calls
- Lucide React (icons)

**Backend:**
- Node.js + Express
- Sequelize ORM
- SQLite3 database
- JWT authentication
- bcrypt password hashing

---

## 📥 Installation Guide

### Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Install and verify: `node --version`

2. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

### Step-by-Step Setup

#### 1. Backend Setup

```bash
# Navigate to backend folder
cd F:\erp\backend

# Install dependencies
npm install

# Create initial admin user
npm run db:seed

# Start backend server
npm run dev
```

**Expected Output:**
```
=================================
Mobile Shop ERP - Starting...
=================================

✓ Database connection established successfully
✓ Database synchronized

=================================
✓ Server is running!
✓ Local: http://localhost:5000
✓ Database: ./database/erp.db
=================================
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

#### 2. Frontend Setup

Open a **new terminal/command prompt** window:

```bash
# Navigate to frontend folder
cd F:\erp\frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

#### 3. Access the System

1. Open your web browser (Chrome/Edge recommended)
2. Go to: **http://localhost:5173**
3. Login with admin credentials
4. **Important:** Change the default password after first login!

---

## 🚀 Usage Guide

### Adding a Mobile Phone

1. Go to **Mobiles** page
2. Click **"Add Mobile"** button
3. Fill in the form:
   - **IMEI**: Must be 15 digits (validated with Luhn algorithm)
   - **Brand & Model**: Required
   - **Prices**: Selling price must be ≥ purchase price
   - **Other details**: Color, storage, condition, etc.
4. Click **"Add Mobile"**

**IMEI Validation:**
- ✅ Only 15 digits allowed
- ✅ Checksum validation (Luhn algorithm)
- ✅ Unique constraint (no duplicates)
- ✅ Real-time validation feedback

### Creating a Sale

1. Go to **Sales** → **"New Sale"**
2. Select customer (optional)
3. Add items:
   - Select item type (Mobile/Accessory)
   - Choose the item
   - For accessories, specify quantity
   - Click **+** to add to cart
4. Review total amount
5. Click **"Complete Sale"**

**What Happens Automatically:**
- ✅ Mobile marked as "sold"
- ✅ Accessory stock decreased
- ✅ Total amount calculated
- ✅ Profit computed
- ✅ Transaction recorded

### Viewing Reports

1. Go to **Reports** page
2. Select date range
3. Click **"Generate Report"**
4. View:
   - Total sales
   - Total profit
   - Daily breakdown
   - Top selling items

---

## 🗄️ Database Schema

### Tables

**mobiles**
- IMEI (unique, validated)
- Brand, Model
- Purchase/Selling prices
- Status (in_stock/sold)
- Color, Storage, Condition

**accessories**
- Name, Category
- Quantity
- Purchase/Selling prices
- Reorder level (low stock alert)

**sales**
- Sale date
- Customer reference
- Total amount, Profit
- Payment method

**sale_items**
- Sale reference
- Item type (mobile/accessory)
- Quantity, Prices

**customers**
- Name, Phone, Email
- Address, Notes

**users**
- Username, Password (hashed)
- Role (admin/staff)

---

## 💾 Backup & Restore

### Manual Backup

```bash
cd F:\erp\backend

# Create backup
node -e "import('./src/utils/backup.js').then(m => m.createBackup())"
```

Backups are stored in: `F:\erp\backend\backups\`

### Restore from Backup

```bash
# Copy backup file to main database location
copy backups\erp-backup-YYYY-MM-DD.db database\erp.db
```

### USB Backup (Manual)

Simply copy the entire `backups` folder to a USB drive:
```bash
xcopy /E /I F:\erp\backend\backups E:\erp-backups
```

---

## 🛠️ Development

### Project Structure

```
F:\erp\
├── backend/
│   ├── src/
│   │   ├── config/          # Database & app configuration
│   │   ├── models/          # Sequelize models
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth & validation
│   │   ├── utils/           # IMEI validator, backup tools
│   │   └── server.js        # Main server file
│   ├── database/
│   │   └── erp.db           # SQLite database (auto-created)
│   ├── backups/             # Database backups
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── services/        # API service layer
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   └── package.json
│
├── context.md               # Project requirements
└── README.md                # This file
```

### API Endpoints

See `backend/README.md` for complete API documentation.

---

## 🔒 Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens for authentication (7-day expiry)
- ✅ Auto-generated JWT secret (stored securely)
- ✅ Role-based access control
- ✅ SQL injection protection (Sequelize ORM)
- ✅ No sensitive data in localStorage
- ✅ CORS configured for local access only

---

## 🐛 Troubleshooting

### Backend won't start
- Check if Node.js is installed: `node --version`
- Check if port 5000 is free
- Delete `node_modules` and run `npm install` again

### Frontend won't start
- Check if port 5173 is free
- Clear browser cache
- Check backend is running first

### Database locked error
- Close all connections to the database
- Restart the backend server
- Check if another process is using the file

### IMEI validation failing
- Ensure IMEI is exactly 15 digits
- Use a valid IMEI with correct checksum
- Example valid IMEI: `357631085678932`

---

## 📝 Production Deployment

For deploying to shop owner's PC:

1. **Install Node.js** on the target PC
2. **Copy entire project folder** to PC
3. **Run setup commands**:
   ```bash
   cd backend
   npm install
   npm run db:seed

   cd ../frontend
   npm install
   npm run build
   ```
4. **Create startup scripts**:
   - `start-backend.bat`:
     ```batch
     cd backend
     npm start
     ```
   - `start-frontend.bat`:
     ```batch
     cd frontend
     npm run preview
     ```
5. **Add to Windows startup** (optional)

---

## 📞 Support

For issues or questions:
1. Check `backend/README.md` for API documentation
2. Review error messages in browser console (F12)
3. Check backend server logs

---

## 📄 License

MIT License - Free to use and modify

---

## ✅ Implementation Status

**Completed (Phase 1 MVP):**
- ✅ Backend API (all endpoints)
- ✅ Database models with relationships
- ✅ IMEI validation (Luhn algorithm)
- ✅ User authentication
- ✅ Frontend UI (all main pages)
- ✅ Sales workflow with stock updates
- ✅ Dashboard with metrics
- ✅ Reports functionality
- ✅ Backup utilities

**Next Steps (Optional Phase 2):**
- Add staff role functionality
- Implement purchase management
- Add PDF invoice generation
- Create Excel export for reports
- Add automatic daily backups
- Implement audit logs

---

**System is ready for testing and deployment! 🎉**
