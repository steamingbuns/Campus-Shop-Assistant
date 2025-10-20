// backend/app.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());            // cho phép gọi từ Vite (5173)
app.use(express.json());    // parse JSON body

// ====================== Seed data (demo) ======================
const users = [
  { id: "u1", name: "Alice", email: "alice@campus.edu", status: "active", warnings: 0, role: "user" },
  { id: "u2", name: "Bob",   email: "bob@campus.edu",   status: "active", warnings: 1, role: "user" },
  { id: "u3", name: "Carol", email: "carol@campus.edu", status: "active", warnings: 0, role: "user" },
  { id: "admin", name: "Admin", email: "admin@campus.edu", status: "active", warnings: 0, role: "admin" }
];

const listings = [
  { id: "l1", title: "A4 Notebook",     description: "Lined, 200 pages", sellerId: "u1", status: "pending",  createdAt: Date.now() - 86400000 },
  { id: "l2", title: "Calculator FX-570", description: "Like new",       sellerId: "u2", status: "approved", createdAt: Date.now() - 43200000 },
  { id: "l3", title: "Highlighter set", description: "Pack of 6",        sellerId: "u3", status: "pending",  createdAt: Date.now() - 21600000 }
];

// ========================= Health =============================
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    users: users.length,
    listings: listings.length
  });
});

// ====================== Manage Users ==========================
app.get("/api/admin/users", (_req, res) => {
  res.json(users);
});

app.post("/api/admin/users/:id/warn", (req, res) => {
  const { id } = req.params;
  const { message = "Please follow community guidelines." } = req.body || {};
  const u = users.find((x) => x.id === id);
  if (!u) return res.status(404).json({ error: "User not found" });

  u.warnings = (u.warnings || 0) + 1;
  if (!u.warnHistory) u.warnHistory = [];
  u.warnHistory.push({ at: Date.now(), message });

  return res.json({ ok: true, user: u });
});

app.post("/api/admin/users/:id/suspend", (req, res) => {
  const { id } = req.params;
  const { reason = "Policy violation" } = req.body || {};
  const u = users.find((x) => x.id === id);
  if (!u) return res.status(404).json({ error: "User not found" });
  if (u.role === "admin") return res.status(403).json({ error: "Cannot suspend admin" });

  u.status = "suspended";
  u.suspendReason = reason;

  return res.json({ ok: true, user: u });
});

// ===================== Manage Listings ========================
app.get("/api/admin/listings", (req, res) => {
  const { status = "pending" } = req.query;
  const data = status === "all" ? listings : listings.filter((l) => l.status === status);
  res.json(data);
});

app.post("/api/admin/listings/:id/approve", (req, res) => {
  const l = listings.find((x) => x.id === req.params.id);
  if (!l) return res.status(404).json({ error: "Listing not found" });
  if (l.status === "removed") return res.status(409).json({ error: "Cannot approve removed listing" });

  l.status = "approved";
  res.json({ ok: true, listing: l });
});

app.put("/api/admin/listings/:id", (req, res) => {
  const l = listings.find((x) => x.id === req.params.id);
  if (!l) return res.status(404).json({ error: "Listing not found" });

  const { title, description } = req.body || {};
  if (title) l.title = String(title).trim();
  if (description) l.description = String(description).trim();

  res.json({ ok: true, listing: l });
});

app.delete("/api/admin/listings/:id", (req, res) => {
  const l = listings.find((x) => x.id === req.params.id);
  if (!l) return res.status(404).json({ error: "Listing not found" });

  const { reason = "Inappropriate" } = req.body || {};
  l.status = "removed";
  l.removedReason = reason;

  res.json({ ok: true, listing: l });
});

// ========================= Start ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Admin API running at http://localhost:${PORT}`);
});


// Đăng nhập (trả về thông tin user, không JWT để đơn giản demo)
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const acc = accounts.find(a => a.username === username && a.password === password);
  if (!acc) return res.status(401).json({ error: "Invalid credentials" });

  // Trả về payload tối thiểu cho frontend
  res.json({ id: acc.id, username: acc.username, role: acc.role, name: acc.name });
});

// (Tuỳ chọn) Không cho đăng ký admin qua API
app.post("/api/auth/signup", (req, res) => {
  const { username, password, name } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });
  if (accounts.some(a => a.username === username)) return res.status(409).json({ error: "Username exists" });

  // LƯU Ý: luôn tạo role = 'user'. Không tạo admin ở đây.
  const acc = { id: "u" + (100 + accounts.length), username, password, role: "user", name: name || username };
  accounts.push(acc);
  res.json({ id: acc.id, username: acc.username, role: acc.role, name: acc.name });
});