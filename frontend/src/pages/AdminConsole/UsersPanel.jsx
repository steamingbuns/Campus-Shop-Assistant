import { useEffect, useState } from "react";
import { AlertTriangle, Ban } from "lucide-react";

export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // 3 account mặc định để test thao tác (khi API lỗi/đang trống)
  const SEEDS = [
    { id: "u1", name: "Alice", email: "alice@campus.edu", status: "active", warnings: 0, role: "user" },
    { id: "u2", name: "Bob",   email: "bob@campus.edu",   status: "active", warnings: 1, role: "user" },
    { id: "u3", name: "Carol", email: "carol@campus.edu", status: "active", warnings: 0, role: "user" },
  ];

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/users`);
      if (r.ok) {
        let data = await r.json();
        // loại admin khỏi list
        data = data.filter(u => u.role !== "admin");
        setUsers(data.length ? data : SEEDS);
      } else {
        setUsers(SEEDS);
      }
    } catch {
      setUsers(SEEDS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const warn = async (id) => {
    await fetch(`${API}/api/admin/users/${id}/warn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Please follow community guidelines." })
    });
    load();
  };

  const suspend = async (id) => {
    await fetch(`${API}/api/admin/users/${id}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Policy violation" })
    });
    load();
  };

  if (loading) return <div className="text-sm text-slate-600">Loading users…</div>;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manage Users</h2>
          <p className="text-sm text-slate-600">All customers & sellers (admins included for visibility)</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-indigo-50 bg-white/80 shadow-sm shadow-indigo-50">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Warnings</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-indigo-50 hover:bg-indigo-50/40">
                <td className="p-3 font-semibold text-slate-900">{u.id}</td>
                <td className="p-3 text-slate-700">{u.name}</td>
                <td className="p-3 text-slate-700">{u.email}</td>
                <td className="p-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {u.role || 'user'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${u.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-3">{u.warnings || 0}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => warn(u.id)} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm shadow-amber-100">
                      <AlertTriangle className="h-4 w-4" />
                      Warn
                    </button>
                    <button onClick={() => suspend(u.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm shadow-red-100">
                      <Ban className="h-4 w-4" />
                      Suspend
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={6}>
                  No users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
