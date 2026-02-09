import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Accessory Model
 * Stores accessories inventory (chargers, covers, headphones, etc.)
 */
const Accessory = sequelize.define('Accessory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'e.g., Charger, Handsfree, Cover, Screen Protector, Cable',
    validate: {
      notEmpty: true
    }
  },
  brand: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
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
  reorderLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    comment: 'Minimum quantity before low stock alert',
    validate: {
      min: 0
    }
  },
  supplier: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'accessories',
  timestamps: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['quantity']
    }
  ]
});

/**
 * Instance method to check if stock is low
 */
Accessory.prototype.isLowStock = function() {
  return this.quantity <= this.reorderLevel;
};

/**
 * Instance method to calculate profit per unit
 */
Accessory.prototype.calculateUnitProfit = function() {
  return parseFloat(this.sellingPrice) - parseFloat(this.purchasePrice);
};

/**
 * Instance method to calculate total stock value
 */
Accessory.prototype.calculateStockValue = function() {
  return parseFloat(this.purchasePrice) * this.quantity;
};

/**
 * Instance method to update quantity after sale
 */
Accessory.prototype.decreaseStock = async function(quantity) {
  if (this.quantity < quantity) {
    throw new Error('Insufficient stock');
  }
  this.quantity -= quantity;
  await this.save();
};

/**
 * Instance method to update quantity after purchase
 */
Accessory.prototype.increaseStock = async function(quantity) {
  this.quantity += quantity;
  await this.save();
};

export default Accessory;
