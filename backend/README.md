# Mobile Shop ERP - Backend API

Local-only backend server for mobile shop inventory and sales management.

## Features

- ✅ **Zero Configuration** - Auto-generates JWT secrets, no manual setup needed
- ✅ **SQLite Database** - Single file database, perfect for local deployment
- ✅ **IMEI Validation** - Enforces unique IMEI with Luhn algorithm validation
- ✅ **Automatic Stock Updates** - Sales automatically update inventory
- ✅ **Transaction Safety** - Database transactions ensure data consistency
- ✅ **Role-Based Access** - Admin and Staff roles with permission control
- ✅ **Backup & Restore** - Built-in database backup utilities

## Tech Stack

- Node.js + Express
- Sequelize ORM
- SQLite3
- JWT Authentication
- bcrypt password hashing

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration and database setup
│   ├── models/          # Database models
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication & validation
│   └── utils/           # Helper functions (IMEI validation, backup)
├── database/            # SQLite database file (auto-created)
├── backups/             # Database backups (auto-created)
└── package.json
```

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Initial Admin User

```bash
npm run db:seed
```

**Default admin credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change password after first login!**

### 3. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start at: **http://localhost:5000**

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Mobiles
- `GET /api/mobiles` - Get all mobiles (with filters)
- `GET /api/mobiles/:id` - Get mobile by ID
- `GET /api/mobiles/imei/:imei` - Get mobile by IMEI
- `POST /api/mobiles` - Add new mobile
- `PUT /api/mobiles/:id` - Update mobile
- `DELETE /api/mobiles/:id` - Delete mobile (admin only)

### Accessories
- `GET /api/accessories` - Get all accessories
- `GET /api/accessories/:id` - Get accessory by ID
- `POST /api/accessories` - Add new accessory
- `PUT /api/accessories/:id` - Update accessory
- `DELETE /api/accessories/:id` - Delete accessory (admin only)
- `GET /api/accessories/alerts/low-stock` - Get low stock items

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer with purchase history
- `POST /api/customers` - Add new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (admin only)

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create new sale (auto-updates stock)
- `DELETE /api/sales/:id` - Delete sale (admin only, reverses stock)

### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/sales` - Sales report (date range)
- `GET /api/reports/profit` - Profit analysis
- `GET /api/reports/inventory` - Inventory report

## IMEI Validation

The system enforces strict IMEI validation:

1. **Length Check**: Must be 15 digits (or 14 without checksum)
2. **Format Check**: Only numeric digits allowed
3. **Luhn Algorithm**: Validates checksum for 15-digit IMEIs
4. **Uniqueness**: No duplicate IMEIs allowed in the system

Example valid IMEI: `357631085678932`

## Creating a Sale

Sales automatically update inventory. Example request:

```json
POST /api/sales

{
  "customerId": 1,
  "saleDate": "2024-02-09",
  "paymentMethod": "cash",
  "items": [
    {
      "itemType": "mobile",
      "itemId": 5
    },
    {
      "itemType": "accessory",
      "itemId": 12,
      "quantity": 2
    }
  ],
  "notes": "Customer requested warranty extension"
}
```

**What happens automatically:**
- ✅ Mobile marked as "sold"
- ✅ Accessory stock decreased by quantity
- ✅ Total amount and profit calculated
- ✅ Sale record created with line items
- ✅ All operations wrapped in transaction (rollback on error)

## Database Backup

Create manual backup:

```javascript
import { createBackup } from './src/utils/backup.js';
await createBackup();
```

Backups are stored in `backups/` directory with timestamp.

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- JWT secret auto-generated on first run
- Role-based access control (admin/staff)
- SQL injection protection via Sequelize ORM

## Deployment (Windows PC)

1. Install Node.js (v18 or higher)
2. Copy entire `backend` folder to PC
3. Run `npm install`
4. Run `npm run db:seed` (first time only)
5. Run `npm start`

**Optional**: Create Windows shortcut to auto-start on boot.

## Troubleshooting

**Port 5000 already in use:**
Edit `src/config/config.js` and change the port number.

**Database locked error:**
Ensure no other process is accessing the database file.

**Permission errors:**
Run terminal as Administrator (Windows).

## License

MIT
