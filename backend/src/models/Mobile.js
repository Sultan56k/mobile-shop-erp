import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { validateIMEI, cleanIMEI } from '../utils/imeiValidator.js';

/**
 * Mobile Model
 * Stores mobile phone inventory with IMEI tracking
 */
const Mobile = sequelize.define('Mobile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  imei: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: {
      msg: 'This IMEI already exists in the system'
    },
    validate: {
      notEmpty: {
        msg: 'IMEI is required'
      },
      isValidIMEI(value) {
        const cleaned = cleanIMEI(value);
        const validation = validateIMEI(cleaned);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }
    }
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isGreaterThanPurchase(value) {
        if (parseFloat(value) < parseFloat(this.purchasePrice)) {
          throw new Error('Selling price must be greater than or equal to purchase price');
        }
      }
    }
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('in_stock', 'sold'),
    defaultValue: 'in_stock',
    allowNull: false
  },
  supplier: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  storage: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Storage capacity (e.g., 64GB, 128GB)'
  },
  condition: {
    type: DataTypes.ENUM('new', 'used', 'refurbished'),
    defaultValue: 'new'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'mobiles',
  timestamps: true,
  hooks: {
    // Clean IMEI before saving
    beforeValidate: (mobile) => {
      if (mobile.imei) {
        mobile.imei = cleanIMEI(mobile.imei);
      }
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['imei']
    },
    {
      fields: ['status']
    },
    {
      fields: ['brand', 'model']
    }
  ]
});

/**
 * Instance method to calculate profit
 */
Mobile.prototype.calculateProfit = function() {
  return parseFloat(this.sellingPrice) - parseFloat(this.purchasePrice);
};

/**
 * Instance method to mark as sold
 */
Mobile.prototype.markAsSold = async function() {
  this.status = 'sold';
  await this.save();
};

export default Mobile;
