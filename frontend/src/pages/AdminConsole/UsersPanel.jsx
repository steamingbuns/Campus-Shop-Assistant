import { useEffect, useState } from "react";
import { AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import adminService from "../../services/adminService";

export default function UsersPanel() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminService.getUsers(token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  const warn = async (id) => {
    try {
      await adminService.warnUser(id, "Please follow community guidelines.", token);
      load();
    } catch (error) {
      console.error("Failed to warn user:", error);
      alert("Failed to warn user");
    }
  };

  const suspend = async (id) => {
    if (!window.confirm("Are you sure you want to suspend this user?")) return;
    try {
      await adminService.suspendUser(id, "Policy violation", token);
      load();
    } catch (error) {
      console.error("Failed to suspend user:", error);
      alert("Failed to suspend user");
    }
  };

  const unsuspend = async (id) => {
    if (!window.confirm("Are you sure you want to unsuspend this user?")) return;
    try {
      await adminService.unsuspendUser(id, token);
      load();
    } catch (error) {
      console.error("Failed to unsuspend user:", error);
      alert("Failed to unsuspend user");
    }
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
      <div className="overflow-x-auto rounded-2xl border border-blue-50 bg-white/80 shadow-sm shadow-blue-50">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
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
              <tr key={u.id} className="border-t border-blue-50 hover:bg-blue-50/40">
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
                    {u.status === 'suspended' ? (
                      <button onClick={() => unsuspend(u.id)} className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm shadow-green-100">
                        <CheckCircle2 className="h-4 w-4" />
                        Unsuspend
                      </button>
                    ) : (
                      <button onClick={() => suspend(u.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm shadow-red-100">
                        <Ban className="h-4 w-4" />
                        Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={7}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
