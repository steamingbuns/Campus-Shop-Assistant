import { useEffect, useState } from "react";
export default function UsersPanel() {
  const [users, setUsers] = useState([]), [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function load(){ setLoading(true); const r=await fetch(`${API}/api/admin/users`); setUsers(await r.json()); setLoading(false); }
  useEffect(()=>{ load(); },[]);

  const warn = async(id)=>{ await fetch(`${API}/api/admin/users/${id}/warn`,{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Please follow community guidelines.'})}); load(); };
  const suspend = async(id)=>{ await fetch(`${API}/api/admin/users/${id}/suspend`,{method:"POST",headers:{'Content-Type':'application/json'},body:JSON.stringify({reason:'Policy violation'})}); load(); };

  if (loading) return <div>Loading users…</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Manage Users</h2>
      <div className="overflow-x-auto border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Warnings</th><th className="p-2 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.id}</td><td className="p-2">{u.name}</td><td className="p-2">{u.email}</td>
                <td className="p-2">{u.status}</td><td className="p-2">{u.warnings || 0}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={()=>warn(u.id)} className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-300">Warn</button>
                  <button onClick={()=>suspend(u.id)} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-400">Suspend</button>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
