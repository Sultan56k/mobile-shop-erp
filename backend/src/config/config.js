import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Path to store generated secrets
const SECRETS_FILE = join(ROOT_DIR, 'database', '.secrets.json');

/**
 * Generate a secure random JWT secret
 */
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Load or generate secrets on first run
 */
function loadSecrets() {
  try {
    // Check if secrets file exists
    if (fs.existsSync(SECRETS_FILE)) {
      const data = fs.readFileSync(SECRETS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('No existing secrets found, generating new ones...');
  }

  // Generate new secrets
  const secrets = {
    jwtSecret: generateJWTSecret(),
    generatedAt: new Date().toISOString()
  };

  // Ensure database directory exists
  const dbDir = join(ROOT_DIR, 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Save secrets to file
  fs.writeFileSync(SECRETS_FILE, JSON.stringify(secrets, null, 2));
  console.log('✓ Generated new JWT secret');

  return secrets;
}

// Load secrets
const secrets = loadSecrets();

/**
 * Application Configuration
 * Auto-configured for local deployment - no manual setup needed
 */
const config = {
  // Server
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'production',

  // Security
  jwtSecret: secrets.jwtSecret,
  jwtExpiresIn: '7d', // Token valid for 7 days

  // Database
  database: {
    dialect: 'sqlite',
    storage: join(ROOT_DIR, 'database', 'erp.db'),
    logging: false // Set to console.log to see SQL queries
  },

  // Paths
  paths: {
    root: ROOT_DIR,
    database: join(ROOT_DIR, 'database'),
    backups: join(ROOT_DIR, 'backups'),
    uploads: join(ROOT_DIR, 'uploads')
  },

  // Backup settings
  backup: {
    autoBackup: true,
    schedule: '0 0 * * *', // Daily at midnight
    retentionDays: 30 // Keep backups for 30 days
  },

  // CORS (for local and production frontend)
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // List of allowed origins
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5000',
        process.env.FRONTEND_URL,
        process.env.RAILWAY_STATIC_URL
      ].filter(Boolean); // Remove undefined values

      // Check if origin is in allowed list or matches Vercel pattern
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

// Ensure required directories exist
Object.values(config.paths).forEach(path => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
});

export default config;
