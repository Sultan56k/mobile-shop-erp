import { Sequelize } from 'sequelize';
import config from './config.js';

/**
 * Initialize SQLite database with Sequelize ORM
 * Database file will be created automatically at: database/erp.db
 */
const sequelize = new Sequelize(config.database);

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to database:', error.message);
    return false;
  }
}

/**
 * Sync all models with database
 * Creates tables if they don't exist
 */
export async function syncDatabase() {
  try {
    await sequelize.sync({ alter: false }); // Use { alter: true } only in development
    console.log('✓ Database synchronized');
  } catch (error) {
    console.error('✗ Database sync failed:', error.message);
    throw error;
  }
}

export default sequelize;
