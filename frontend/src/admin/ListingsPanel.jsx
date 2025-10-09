import { useEffect, useState } from "react";
export default function ListingsPanel() {
  const [items,setItems]=useState([]), [status,setStatus]=useState("pending");
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function load(){ const r=await fetch(`${API}/api/admin/listings?status=${status}`); setItems(await r.json()); }
  useEffect(()=>{ load(); },[status]);

  const approve = async(id)=>{ await fetch(`${API}/api/admin/listings/${id}/approve`,{method:"POST"}); load(); };
  const updateItem = async(id,title,description)=>{ await fetch(`${API}/api/admin/listings/${id}`,{method:"PUT",headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description})}); load(); };
  const removeItem = async(id)=>{ await fetch(`${API}/api/admin/listings/${id}`,{method:"DELETE",headers:{'Content-Type':'application/json'},body:JSON.stringify({reason:'Inappropriate'})}); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Manage Listings</h2>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-2 py-1">
          <option value="pending">Pending</option><option value="approved">Approved</option><option value="all">All</option>
        </select>
      </div>
      <div className="overflow-x-auto border rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Title</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {items.map(it=>(
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.id}</td><td className="p-2">{it.title}</td><td className="p-2">{it.status}</td>
                <td className="p-2 flex gap-2 flex-wrap">
                  <button onClick={()=>approve(it.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">Approve</button>
                  <button onClick={()=>updateItem(it.id, prompt("New title", it.title) || it.title, prompt("New description", it.description) || it.description)} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</button>
                  <button onClick={()=>removeItem(it.id)} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-400">Remove</button>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
