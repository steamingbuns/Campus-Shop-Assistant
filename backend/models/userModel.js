import sql from '../db/index.js';

export async function createUser(userData) {
  const { name, email, password_hash, role = 'user', status = 'active' } = userData;
  
  const result = await sql`
    INSERT INTO "User" (name, email, password_hash, role, status, create_at, updated_at)
    VALUES (${name}, ${email}, ${password_hash}, ${role}, ${status}, NOW(), NOW())
    RETURNING user_id, name, email, role, status, create_at
  `;
  
  return result[0];
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
    SELECT user_id, name, email, address, phone_number, role, status, create_at, updated_at
    FROM "User"
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

export async function updateUser(userId, updates) {
  const { name, address, phone_number } = updates;
  
  const result = await sql`
    UPDATE "User"
    SET 
      name = COALESCE(${name}, name),
      address = COALESCE(${address}, address),
      phone_number = COALESCE(${phone_number}, phone_number),
      updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING user_id, name, email, address, phone_number, role, status, updated_at
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
