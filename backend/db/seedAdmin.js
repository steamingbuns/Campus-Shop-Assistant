import sql from '../db/index.js';     // dùng kết nối hiện có của bạn
import bcrypt from 'bcrypt';

async function run() {
  const email = 'admin@campus.edu';
  const name = 'Administrator';
  const plain = 'admin123';
  const hash = await bcrypt.hash(plain, 10);

  await sql`
    INSERT INTO public."User" (name, email, password_hash, role, status)
    VALUES (${name}, ${email}, ${hash}, 'admin', 'active')
    ON CONFLICT (email) DO UPDATE
      SET role='admin', password_hash=${hash}
  `;

  const [row] = await sql`
    SELECT user_id, name, email, role, status
    FROM public."User" WHERE email=${email}
  `;
  console.log('Seeded admin:', row);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
