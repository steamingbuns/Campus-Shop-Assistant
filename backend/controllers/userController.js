import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import * as userModel from '../models/userModel.js';
import * as productModel from '../models/productModel.js';

// Token blacklist for logout functionality
export const tokenBlacklist = new Set();

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Register a new user
 * POST /api/users/register
 */
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    const requestedRole = req.body.role ? String(req.body.role).toLowerCase() : null;
    const allowedRoles = new Set(['seller']);
    const role = requestedRole && allowedRoles.has(requestedRole) ? requestedRole : 'seller';

    // Create user (password will be hashed in the model)
    const newUser = await userModel.createUser({
      name,
      email,
      password,
      address: req.body.address,
      phone_number: req.body.phone_number,
      role,
      status: 'active'
    });

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });

  } catch (error) {
    
    res.status(500).json({
      error: 'Failed to register user. Please try again.'
    });
  }
}

/**
 * Login user
 * POST /api/users/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        error: `Your account is ${user.status}. Please contact support.`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    
    res.status(500).json({
      error: 'Failed to login. Please try again.'
    });
  }
}

/**
 * Logout user
 * POST /api/users/logout
 * Requires authentication
 */
export async function logout(req, res) {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Add token to blacklist
      tokenBlacklist.add(token);
    }

    res.json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    
    res.status(500).json({
      error: 'Failed to logout. Please try again.'
    });
  }
}

/**
 * Get current user profile
 * GET /api/users/me
 * Requires authentication
 */
export async function getCurrentUser(req, res) {
  try {
    const userId = req.user.userId;

    const user = await userModel.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        address: user.address,
        phoneNumber: user.phone_number,
        role: user.role,
        status: user.status,
        createdAt: user.create_at
      }
    });

  } catch (error) {
    
    res.status(500).json({
      error: 'Failed to get user profile'
    });
  }
}

/**
 * Update user profile
 * PUT /api/users/me
 * Requires authentication
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    // Accept phone_number (snake_case from frontend) OR phoneNumber (camelCase)
    const { name, address, phoneNumber, phone_number, email } = req.body;
    const newPhoneNumber = phone_number || phoneNumber;

    // Validate at least one field to update
    if (!name && !address && !newPhoneNumber && !email) {
      return res.status(400).json({
        error: 'Please provide at least one field to update'
      });
    }

    // If email is being updated, check if it's already taken
    if (email) {
      // Check if email is different from current user's email
      const currentUser = await userModel.findUserById(userId);
      if (email !== currentUser.email) {
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({
            error: 'Email already registered'
          });
        }
      }
    }

    const updatedUser = await userModel.updateUser(userId, {
      name,
      address,
      phone_number: newPhoneNumber,
      email
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        userId: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
        phone: updatedUser.phone_number, // Normalize response to 'phone' to match frontend expectation if possible, or keep as is
        phone_number: updatedUser.phone_number, // Include snake_case for consistency
        phoneNumber: updatedUser.phone_number, // Keep camelCase for legacy/other clients
        role: updatedUser.role
      }
    });

  } catch (error) {
    
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
}

/**
 * Change password
 * POST /api/users/change-password
 * Requires authentication
 */
export async function changePassword(req, res) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await userModel.findUserByIdWithPassword(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await userModel.updatePassword(userId, newPasswordHash);

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password'
    });
  }
}

/**
 * Refresh token
 * POST /api/users/refresh
 */
export async function refresh_token(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required'
      });
    }

    // Verify the old token (even if expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        error: 'Token has been invalidated'
      });
    }

    // Get user to ensure they still exist
    const user = await userModel.findUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Generate new token
    const newToken = generateToken(user);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Invalid token'
    });
  }
}

/**
 * Test token validity
 * GET /api/users/test-token
 * Requires authentication
 */
export async function test_token(req, res) {
  try {
    res.json({
      message: 'Token is valid',
      user: {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Test token error:', error);
    res.status(500).json({
      error: 'Failed to test token'
    });
  }
}

/**
 * Get all users (Admin only)
 * GET /api/users
 * Requires authentication and staff role
 */
export async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();

    res.json({
      message: 'Users retrieved successfully',
      count: users.length,
      users: users.map(user => ({
        userId: user.user_id,
        name: user.name,
        email: user.email,
        address: user.address,
        phoneNumber: user.phone_number,
        role: user.role,
        status: user.status,
        createdAt: user.create_at
      }))
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Failed to retrieve users'
    });
  }
}

export async function checkReviewEligibility(req, res) {
  try {
    const { productId } = req.params;
    const { userId } = req.user;

    const order = await productModel.findCompletedOrderForProductByUser({
      userId,
      productId: parseInt(productId, 10),
    });

    res.json({ eligible: !!order });
  } catch (error) {
    console.error('Check review eligibility error:', error);
    res.status(500).json({ error: 'Failed to check review eligibility' });
  }
}
