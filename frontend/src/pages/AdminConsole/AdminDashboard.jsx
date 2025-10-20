import { useState } from "react";
import UsersPanel from "./UsersPanel.jsx";
import ListingsPanel from "./ListingsPanel.jsx";
import ReportsPanel from "./ReportsPanel.jsx";

const TABS = [
  { key: "users", label: "Manage Users" },
  { key: "listings", label: "Manage Listings" },
  { key: "reports", label: "View Reports" },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("users");
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ paddingTop: '120px' }}>
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center" style={{ marginTop: 0 }}>Admin Console</h1>
        <p className="text-center text-gray-600 mt-2">Moderate users and listings for a safe marketplace.</p>
      </section>

      <nav className="mx-auto max-w-6xl px-6 mt-8 flex items-center justify-center gap-4" role="tablist" aria-label="Admin sections">
        {TABS.map(t => (
          <TabPill key={t.key} isActive={active === t.key} onClick={() => setActive(t.key)}>{t.label}</TabPill>
        ))}
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow border border-gray-200 p-6">
          {active === "users" && <UsersPanel />}
          {active === "listings" && <ListingsPanel />}
          {active === "reports" && <ReportsPanel />}
        </div>
      </main>
    </div>
  );
}

function TabPill({ isActive, onClick, children }) {
  const base = "px-6 py-3 rounded-xl text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 cursor-pointer";
  const active = "bg-gradient-to-r from-blue-500 to-blue-700 border-2 border-blue-600 shadow-lg transform scale-105";
  const inactive = "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400";
  
  const style = isActive ? { color: 'white' } : {};
  
  return (
    <button type="button" role="tab" aria-selected={isActive} className={`${base} ${isActive ? active : inactive}`} style={style} onClick={onClick}>
      {children}
    </button>
  );
}
