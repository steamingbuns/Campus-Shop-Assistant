import { useEffect, useState } from "react";
import { CheckCircle2, Trash2, Edit3 } from "lucide-react";

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
    if (s === "approved") return "bg-green-50 text-green-700";
    if (s === "removed") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  if (loading) return <div>Loading listings…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Manage Listings</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm shadow-blue-50"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-blue-50 bg-white/80 shadow-sm shadow-blue-50">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-blue-50 hover:bg-blue-50/40">
                <td className="p-3 font-semibold text-slate-900">{it.id}</td>
                <td className="p-3 text-slate-700">{it.title}</td>
                <td className="p-3 text-slate-700">{it.seller_name || '—'}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusChip(it.status)}`}>
                    {it.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => approve(it.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm shadow-green-100"
                    >
                      <CheckCircle2 className="h-4 w-4" />
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
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm shadow-blue-100"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => removeItem(it.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm shadow-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
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
