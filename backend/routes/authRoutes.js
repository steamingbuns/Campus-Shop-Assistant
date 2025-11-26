import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sql from '../db/index.js'; // your pg wrapper

const router = express.Router();

// helper: find user by email
async function findUserByEmail(email) {
  const rows = await sql`
    SELECT user_id, name, email, role, status, warnings, password_hash
    FROM public."User"
    WHERE email = ${email}
    LIMIT 1
  `;
  return rows[0];
}

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // only allow admin to use the admin APIs
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const token = jwt.sign(
      { sub: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret-change-me',
      { expiresIn: '2h' }
    );

    return res.json({
      token,
      user: { id: user.user_id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
