import { useEffect, useState } from "react";
import "./admin-ui.css";

export default function ListingsPanel() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("all"); // 'pending' | 'approved' | 'all'
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // fallback demo nếu API lỗi
  const SEED_LISTINGS = [
    { id: "l1", title: "A4 Notebook",     status: "pending",  description: "Lined 200 pages" },
    { id: "l2", title: "Calculator FX-570", status: "approved", description: "Like new" },
    { id: "l3", title: "Highlighter set", status: "pending",  description: "Pack of 6" },
  ];

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/listings?status=${status}`);
      if (r.ok) {
        const data = await r.json();
        setItems(data.length ? data : SEED_LISTINGS);
      } else {
        setItems(SEED_LISTINGS);
      }
    } catch {
      setItems(SEED_LISTINGS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  async function approve(id) {
    await fetch(`${API}/api/admin/listings/${id}/approve`, { method: "POST" });
    load();
  }

  async function updateItem(id, title, description) {
    await fetch(`${API}/api/admin/listings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    });
    load();
  }

  async function removeItem(id) {
    await fetch(`${API}/api/admin/listings/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Inappropriate" })
    });
    load();
  }

  const statusChip = (s) => {
    if (s === "approved") return "chip chip--approved";
    if (s === "removed")  return "chip chip--removed";
    return "chip chip--pending"; // default pending
    // (nếu backend còn trạng thái khác, thêm case tương ứng)
  };

  if (loading) return <div>Loading listings…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Manage Listings</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.id}</td>
                <td className="p-2">{it.title}</td>
                <td className="p-2">
                  <span className={statusChip(it.status)}>{it.status}</span>
                </td>
                <td className="p-2">
                  <div className="actions">
                    <button
                      onClick={() => approve(it.id)}
                      className="btn btn-approve"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        updateItem(
                          it.id,
                          prompt("New title", it.title) || it.title,
                          prompt("New description", it.description || "") ||
                            it.description
                        )
                      }
                      className="btn btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeItem(it.id)}
                      className="btn btn-remove"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={4}>
                  No listings
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
