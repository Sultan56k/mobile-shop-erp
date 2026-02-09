import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

/**
 * User Model
 * Stores admin and staff user accounts
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff'),
    defaultValue: 'staff',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    // Hash password before saving
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

/**
 * Instance method to verify password
 */
User.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * Instance method to return safe user data (without password)
 */
User.prototype.toSafeObject = function() {
  const { password, ...safeUser } = this.toJSON();
  return safeUser;
};

export default User;
