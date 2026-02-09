import { testConnection, syncDatabase } from './database.js';
import { User } from '../models/index.js';

/**
 * Seed database with initial admin user
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');

    // Connect to database
    await testConnection();
    await syncDatabase();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });

    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      console.log(`  Username: ${existingAdmin.username}`);
      console.log('\nNo seeding needed.\n');
      return;
    }

    // Create default admin user
    const admin = await User.create({
      username: 'admin',
      password: 'admin123', // Will be hashed automatically by model hook
      fullName: 'Shop Administrator',
      role: 'admin',
      isActive: true
    });

    console.log('✓ Admin user created successfully!');
    console.log('\n=================================');
    console.log('DEFAULT ADMIN CREDENTIALS:');
    console.log('=================================');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('=================================');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seeding
seedDatabase();
