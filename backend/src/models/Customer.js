import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Customer Model
 * Stores customer information for warranty tracking and records
 */
const Customer = sequelize.define('Customer', {
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
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true,
      is: /^[\d\s\-\+\(\)]+$/i // Allow digits, spaces, dashes, plus, parentheses
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [
    {
      fields: ['phone']
    },
    {
      fields: ['name']
    }
  ]
});

export default Customer;
