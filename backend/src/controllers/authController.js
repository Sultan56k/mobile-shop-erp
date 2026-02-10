import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { User } from '../models/index.js';

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    console.log('🔐 [BACKEND] Login attempt');
    console.log('🔐 [BACKEND] Username:', username);
    console.log('🔐 [BACKEND] Origin:', req.get('origin'));

    // Validate input
    if (!username || !password) {
      console.log('❌ [BACKEND] Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    console.log('🔍 [BACKEND] Searching for user...');
    // Find user
    const user = await User.findOne({ where: { username } });

    if (!user) {
      console.log('❌ [BACKEND] User not found');
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    console.log('✅ [BACKEND] User found, isActive:', user.isActive);

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ [BACKEND] User inactive');
      return res.status(401).json({
        success: false,
        error: 'Account is disabled'
      });
    }

    console.log('🔑 [BACKEND] Verifying password...');
    // Verify password
    const isValidPassword = await user.verifyPassword(password);
    console.log('🔑 [BACKEND] Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ [BACKEND] Invalid password');
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    console.log('🎟️ [BACKEND] Generating token...');
    // Generate token
    const token = generateToken(user);
    console.log('✅ [BACKEND] Login successful!');

    // Return user data and token
    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token
      }
    });
  } catch (error) {
    console.error('💥 [BACKEND] Login error:', error.message);
    console.error('💥 [BACKEND] Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function getCurrentUser(req, res) {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
}

/**
 * Change password
 * POST /api/auth/change-password
 */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    // Get user from database
    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isValidPassword = await user.verifyPassword(currentPassword);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
}

export default { login, getCurrentUser, changePassword };
