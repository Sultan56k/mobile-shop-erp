# Mobile Shop Inventory & Sales Management System (Local ERP)

## 1. Project Overview
This project is a **web-based Inventory, Sales, and Shop Record Management System** for a **mobile phone shop**, similar in concept to pharmacy ERP systems but customized for mobile retail business needs.

The system will run **locally on the shop computer**, store data in a **local database**, and work **without internet**. The goal is to replace manual registers with a reliable, fast, and organized digital system.

---

## 2. Key Objectives
- Maintain accurate records of all shop items
- Track mobile phones by **IMEI**
- Record sales and purchases
- Monitor stock levels and profit
- Provide clear reports for business decisions
- Keep all data stored **locally and securely**

---

## 3. System Type & Environment
- **Web-based application**
- Runs on **local PC (Windows)**
- Accessed via browser (Chrome/Edge)
- Backend + database hosted on same machine
- No cloud hosting required

---

## 4. Core Modules & Features

### 4.1 Inventory Management
- Add, edit, delete products
- Product categories:
  - Mobile phones
  - Accessories (chargers, handsfree, covers, etc.)
- Fields for mobile phones:
  - Brand
  - Model
  - IMEI (unique)
  - Purchase price
  - Selling price
  - Status (In Stock / Sold)
- Fields for accessories:
  - Product name
  - Quantity
  - Purchase price
  - Selling price
- Low stock indication for accessories

---

### 4.2 Sales Management
- Create new sales entries
- Select product(s) from inventory
- Automatic stock update after sale
- IMEI-based sale for mobile phones
- Sale details:
  - Date
  - Items sold
  - Total amount
  - Profit calculation
- Optional simple invoice view (printable)

---

### 4.3 Purchase Management
- Record new purchases from suppliers
- Auto-increase inventory stock
- Store purchase history
- Purchase date and cost tracking

---

### 4.4 Customer Records (Optional but Preferred)
- Customer name
- Phone number
- Purchased item
- IMEI (if mobile)
- Warranty period notes (if any)

---

### 4.5 Reports & Analytics
- Daily sales report
- Monthly sales summary
- Profit & loss report
- Remaining stock value
- Sold vs unsold mobiles
- IMEI sales history

---

## 5. User Roles
- **Admin (Shop Owner)**
  - Full access
- **Staff (Optional)**
  - Sales entry only
  - No delete permissions

---

## 6. Data Storage Requirements
- Use **local database** (MySQL / PostgreSQL preferred)
- Do NOT use browser localStorage or IndexedDB
- IMEI must be enforced as a **unique field**
- Data must persist even if browser is closed

---

## 7. Backup Strategy (Mandatory)
- Daily automatic database backup to local folder
- Option to export backup to USB
- Manual restore option for admin

---

## 8. Non-Functional Requirements
- Simple and clean UI (non-technical user friendly)
- Fast performance on low-end PC
- Urdu/English text support (optional)
- Secure login system
- No internet dependency for core features

---

## 9. Technology Preferences (Flexible)
- Frontend: React / HTML-CSS-JS
- Backend: Node.js (Express) / Django / Laravel
- Database: MySQL / PostgreSQL / SQLite (small setup)
- Runs locally via localhost

---

## 10. Future Enhancements (Not in Phase 1)
- Android app version
- Barcode / IMEI scanner support
- Cloud sync (optional)
- SMS invoice notifications
- Multi-shop support

---

## 11. Success Criteria
- Shop owner can:
  - Easily add products
  - Record sales without confusion
  - View stock anytime
  - Check profit without manual calculation
- Data remains safe locally
- System replaces paper registers completely
