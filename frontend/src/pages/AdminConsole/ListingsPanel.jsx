import { useEffect, useState } from "react";
import { CheckCircle2, Trash2, Edit3 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import adminService from "../../services/adminService";

export default function ListingsPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("all"); // 'pending' | 'approved' | 'all'
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminService.getListings({ status }, token);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load listings:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status, token]);

  async function approve(id) {
    try {
      await adminService.approveListing(id, token);
      load();
    } catch (error) {
      console.error("Failed to approve listing:", error);
      alert("Failed to approve listing");
    }
  }

  async function updateItem(id, title, description) {
    try {
      await adminService.editListing(id, { title, description }, token);
      load();
    } catch (error) {
      console.error("Failed to update listing:", error);
      alert("Failed to update listing");
    }
  }

  async function removeItem(id) {
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    try {
      await adminService.deleteListing(id, "Inappropriate", token);
      load();
    } catch (error) {
      console.error("Failed to remove listing:", error);
      alert("Failed to remove listing");
    }
  }

  const statusChip = (s) => {
    if (s === "active" || s === "approved") return "bg-green-50 text-green-700";
    if (s === "removed" || s === "inactive") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  if (loading) return <div className="text-sm text-slate-600">Loading listings…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-slate-900">Manage Listings</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm shadow-blue-50 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="active">Active/Approved</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-blue-50 bg-white/80 shadow-sm shadow-blue-50">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-blue-50 hover:bg-blue-50/40">
                <td className="p-3 font-semibold text-slate-900">{it.id}</td>
                <td className="p-3 text-slate-700">{it.title || it.name}</td>
                <td className="p-3 text-slate-700">{it.seller_name || '—'}</td>
                <td className="p-3 font-semibold text-slate-900">{Number(it.price).toFixed(2)}đ</td>
                <td className="p-3 text-slate-700">{it.stock}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusChip(it.status)}`}>
                    {it.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {it.status !== 'active' && it.status !== 'approved' && (
                      <button
                        onClick={() => approve(it.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm shadow-green-100"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const newName = prompt("New name", it.name || it.title);
                        if (newName === null) return;
                        const newDesc = prompt("New description", it.description || "");
                        if (newDesc === null) return;
                        const newPrice = prompt("New price", it.price);
                        if (newPrice === null || isNaN(parseFloat(newPrice))) return; // Validate price input
                        const newStock = prompt("New stock", it.stock);
                        if (newStock === null || isNaN(parseInt(newStock))) return; // Validate stock input
                        updateItem(it.id, newName, newDesc, parseFloat(newPrice), parseInt(newStock));
                      }}
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
                <td className="p-3 text-center text-gray-500" colSpan={7}>
                  No listings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
