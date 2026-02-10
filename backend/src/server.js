import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import { testConnection, syncDatabase } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import mobileRoutes from './routes/mobiles.js';
import accessoryRoutes from './routes/accessories.js';
import customerRoutes from './routes/customers.js';
import saleRoutes from './routes/sales.js';
import reportRoutes from './routes/reports.js';

const app = express();

// ===== Middleware =====
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.get('origin'));
  console.log('Full URL:', req.originalUrl);
  next();
});

// ===== Routes =====
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile Shop ERP API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      mobiles: '/api/mobiles',
      accessories: '/api/accessories',
      customers: '/api/customers',
      sales: '/api/sales',
      reports: '/api/reports'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/mobiles', mobileRoutes);
app.use('/api/accessories', accessoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);

// ===== Error Handling =====
app.use((req, res) => {
  console.log('❌ 404 - Endpoint not found:', req.method, req.originalUrl);
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ===== Start Server =====
async function startServer() {
  try {
    console.log('\n=================================');
    console.log('Mobile Shop ERP - Starting...');
    console.log('=================================\n');

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Sync database (create tables)
    await syncDatabase();

    // Start listening
    app.listen(config.port, () => {
      console.log('\n=================================');
      console.log('✓ Server is running!');
      console.log(`✓ Local: http://localhost:${config.port}`);
      console.log(`✓ Database: ${config.database.storage}`);
      console.log(`✓ CORS: Allowing Vercel apps + env FRONTEND_URL`);
      console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
      console.log('=================================\n');
      console.log('Press Ctrl+C to stop\n');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
