import * as U from '../models/adminUserModel.js';
import * as L from '../models/adminListingModel.js';
import * as O from '../models/adminOrderModel.js';

/* ===== Users ===== */
export async function getUsers(req, res) {
  try {
    const users = await U.listAllUsers();
    res.json(users);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function postWarnUser(req, res) {
  try {
    const row = await U.warnUser(req.params.id, req.body?.message);
    if (!row) return res.status(403).json({ ok: false, error: 'Not allowed or user not found' });
    res.json({ ok: true, user: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function postSuspendUser(req, res) {
  try {
    const row = await U.suspendUser(req.params.id, req.body?.reason);
    if (!row) return res.status(403).json({ ok: false, error: 'Not allowed or user not found' });
    res.json({ ok: true, user: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function postUnsuspendUser(req, res) {
  try {
    const row = await U.unsuspendUser(req.params.id);
    if (!row) return res.status(403).json({ ok: false, error: 'Not allowed or user not found' });
    res.json({ ok: true, user: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

/* ===== Listings (Product) ===== */
export async function getListings(req, res) {
  try {
    const rows = await L.listListings(req.query.status);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function postApproveListing(req, res) {
  try {
    const row = await L.approveListing(req.params.id);
    if (!row) return res.status(404).json({ ok: false, error: 'Listing not found' });
    res.json({ ok: true, listing: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function putEditListing(req, res) {
  try {
    const row = await L.editListing(req.params.id, req.body || {});
    if (!row) return res.status(404).json({ ok: false, error: 'Listing not found' });
    res.json({ ok: true, listing: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function deleteListing(req, res) {
  try {
    const reason = req.body?.reason ?? req.query?.reason ?? 'Inappropriate content';
    const row = await L.removeListing(req.params.id, reason);
    if (!row) return res.status(404).json({ ok: false, error: 'Listing not found' });
    res.json({ ok: true, listing: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

/* ===== Transactions ===== */
export async function getTransactions(req, res) {
  try {
    const rows = await O.listAllTransactions();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

// ---- Alias exports để khớp với adminRoutes.js ----
export {
  getUsers as listUsers,
  postWarnUser as warnUser,
  postSuspendUser as suspendUser,
  postUnsuspendUser as unsuspendUser,

  getListings as listListings,
  postApproveListing as approveListing,
  putEditListing as updateListing,
  getTransactions as listTransactions,
  //deleteListing as deleteListing, // giữ tên giống nhau cho rõ ràng
};
