import jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../controllers/userController.js';

/**
 * Authentication middleware
 * Verifies JWT tokens in the Authorization header
 */
export function authenticate(req, res, next) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    // Check if it exists and has the Bearer format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Please provide a valid Bearer token",
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Check if token is blacklisted (logged out)
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        error: "This session has been logged out. Please login again.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If verification is successful, add user info to req object
    req.user = decoded;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Your session has expired. Please login again.",
      });
    }

    return res.status(401).json({
      error: "Authentication failed. Please login again.",
    });
  }
}

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 * @param {string[]} allowedRoles - Array of roles that have access
 */
export function authorize(allowedRoles) {
  return (req, res, next) => {
    // First ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(req.user.role)) {
      return next();
    } else {
      return res.status(403).json({
        error: `You don't have permission to access this resource. You can only access this resource if you are ${allowedRoles.join(
          ", "
        )}`,
      });
    }
  };
}
