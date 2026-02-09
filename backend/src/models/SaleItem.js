import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * SaleItem Model
 * Stores individual items in each sale (line items)
 */
const SaleItem = sequelize.define('SaleItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sales',
      key: 'id'
    }
  },
  itemType: {
    type: DataTypes.ENUM('mobile', 'accessory'),
    allowNull: false,
    comment: 'Type of item being sold'
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the mobile or accessory'
  },
  itemName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Name/description of item (for record keeping)'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  profit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'sale_items',
  timestamps: true,
  indexes: [
    {
      fields: ['saleId']
    },
    {
      fields: ['itemType', 'itemId']
    }
  ]
});

export default SaleItem;
