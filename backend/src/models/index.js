/**
 * Models Index
 * Defines all model relationships and exports models
 */
import User from './User.js';
import Mobile from './Mobile.js';
import Accessory from './Accessory.js';
import Customer from './Customer.js';
import Sale from './Sale.js';
import SaleItem from './SaleItem.js';

// ===== Define Relationships =====

// User <-> Sale (One-to-Many)
User.hasMany(Sale, {
  foreignKey: 'createdBy',
  as: 'sales'
});
Sale.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Customer <-> Sale (One-to-Many)
Customer.hasMany(Sale, {
  foreignKey: 'customerId',
  as: 'sales'
});
Sale.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

// Sale <-> SaleItem (One-to-Many)
Sale.hasMany(SaleItem, {
  foreignKey: 'saleId',
  as: 'items'
});
SaleItem.belongsTo(Sale, {
  foreignKey: 'saleId',
  as: 'sale'
});

// Note: We don't define direct relationships between SaleItem and Mobile/Accessory
// because itemType is polymorphic (can reference either table)
// We'll handle these relationships manually in the controllers

// ===== Export Models =====

const models = {
  User,
  Mobile,
  Accessory,
  Customer,
  Sale,
  SaleItem
};

export default models;
export { User, Mobile, Accessory, Customer, Sale, SaleItem };
