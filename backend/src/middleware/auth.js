import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { User } from '../models/index.js';

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header or cookies
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from database
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
    }

    // Attach user to request
    req.user = user.toSafeObject();
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
}

/**
 * Optional authentication (attach user if token exists, but don't fail)
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findByPk(decoded.id);
      if (user && user.isActive) {
        req.user = user.toSafeObject();
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  next();
}

export default { authenticate, isAdmin, optionalAuth };
