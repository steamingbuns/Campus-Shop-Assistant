import sql from '../db/index.js';
import bcrypt from 'bcrypt';

export async function createUser(userData) {
  const {
    name,
    email,
    password,
    address,
    phone_number,
    role = 'seller',
    status = 'active'
  } = userData;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const newUser = await sql`
    INSERT INTO "User" (
      name,
      email,
      password_hash,
      address,
      phone_number,
      role,
      status,
      create_at,
      updated_at
    ) 
    VALUES (
      ${name},
      ${email},
      ${hashedPassword},
      ${address || null},
      ${phone_number || null},
      ${role},
      ${status},
      NOW(),
      NOW()
    ) 
    RETURNING *
  `;

  return newUser[0];
}

export async function findUserByEmail(email) {
  const result = await sql`
    SELECT * FROM "User"
    WHERE email = ${email}
  `;
  
  return result[0];
}

export async function findUserById(userId) {
  const result = await sql`
    SELECT * FROM "User"
    WHERE user_id = ${userId}
  `;
  
  return result[0];
}

export async function findUserByIdWithPassword(userId) {
  const result = await sql`
    SELECT * FROM "User"
    WHERE user_id = ${userId}
  `;
  
  return result[0];
}

/**
 * Find user by phone number
 * @param {string} phoneNumber - The phone number to search
 * @returns {Promise<Object|null>} - The user object if found, null otherwise
 */
export async function findUserByPhoneNumber(phoneNumber) {
  try {
    // Normalize phone number by removing hyphens, spaces, and other separators
    const normalizedPhoneNumber = phoneNumber.replace(/[-\s()]/g, '');
    
    // Query using a pattern match that ignores formatting characters
    const users = await sql`
      SELECT * FROM "User"
      WHERE REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(phone_number, '-', ''),
                ' ', ''),
              '(', ''),
            ')', '') = ${normalizedPhoneNumber}
    `;
    
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error("Error in findUserByPhoneNumber:", error);
    throw error;
  }
}

export async function updateUser(userId, updates) {
  const { name, address, phone_number, email } = updates;
  
  // Build update object with only provided fields
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (address !== undefined) updateFields.address = address;
  if (phone_number !== undefined) updateFields.phone_number = phone_number;
  if (email !== undefined) updateFields.email = email;
  
  // If no fields to update, return current user
  if (Object.keys(updateFields).length === 0) {
    return await findUserById(userId);
  }
  
  // Build the SQL query dynamically
  const setClause = Object.keys(updateFields)
    .map(key => `${key} = $${key}`)
    .join(', ');
  
  const result = await sql`
    UPDATE "User"
    SET ${sql(updateFields)}, updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING *
  `;
  
  return result[0];
}

export async function updatePassword(userId, newPasswordHash) {
  const result = await sql`
    UPDATE "User"
    SET 
      password_hash = ${newPasswordHash},
      updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING user_id, email
  `;
  
  return result[0];
}

export async function emailExists(email) {
  const result = await sql`
    SELECT COUNT(*) as count FROM "User"
    WHERE email = ${email}
  `;
  
  return result[0].count > 0;
}

// Get all users (admin function)
export async function getAllUsers() {
  const result = await sql`
    SELECT user_id, name, email, address, phone_number, role, status, create_at, updated_at
    FROM "User"
    ORDER BY create_at DESC
  `;
  
  return result;
}

// Update user status (admin function)
export async function updateUserStatus(userId, status) {
  const result = await sql`
    UPDATE "User"
    SET 
      status = ${status},
      updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING user_id, email, status
  `;
  
  return result[0];
}

// Promote user to admin (admin function)
export async function promoteToAdmin(userId) {
  const result = await sql`
    UPDATE "User"
    SET 
      role = 'admin',
      updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING user_id, name, email, role
  `;
  
  return result[0];
}
