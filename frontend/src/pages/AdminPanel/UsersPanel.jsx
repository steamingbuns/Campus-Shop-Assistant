import { useEffect, useState } from "react";
import "./admin-ui.css"; 

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

  if (loading) return <div>Loading users…</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Manage Users</h2>
      <div className="overflow-x-auto border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Warnings</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <span className={`chip ${u.status === 'active' ? 'chip--active' : 'chip--suspended'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-2">{u.warnings || 0}</td>
                <td className="p-2">
                  <div className="actions">
                    <button onClick={() => warn(u.id)} className="btn btn-warn">Warn</button>
                    <button onClick={() => suspend(u.id)} className="btn btn-suspend">Suspend</button>
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
