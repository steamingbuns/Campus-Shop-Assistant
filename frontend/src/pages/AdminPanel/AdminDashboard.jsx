import { useState } from "react";
import AdminHeader from "./AdminHeader.jsx";
import UsersPanel from "./UsersPanel.jsx";
import ListingsPanel from "./ListingsPanel.jsx";

const TABS = [
  { key: "users", label: "Manage Users" },
  { key: "listings", label: "Manage Listings" },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("users");
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <AdminHeader />

      <section className="mx-auto max-w-6xl px-6 pt-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">Admin Console</h1>
        <p className="text-center text-gray-600 mt-2">Moderate users and listings for a safe marketplace.</p>
      </section>

      <nav className="mx-auto max-w-6xl px-6 mt-8 flex items-center justify-center gap-3" role="tablist" aria-label="Admin sections">
        {TABS.map(t => (
          <TabPill key={t.key} isActive={active === t.key} onClick={() => setActive(t.key)}>{t.label}</TabPill>
        ))}
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow border border-gray-200 p-5">
          {active === "users" && <UsersPanel />}
          {active === "listings" && <ListingsPanel />}
        </div>
      </main>
    </div>
  );
}

function TabPill({ isActive, onClick, children }) {
  const base = "px-5 py-2 rounded-xl text-sm md:text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400";
  const active = "bg-blue-600 text-white border border-transparent hover:bg-blue-700";
  const inactive = "bg-white text-gray-900 border border-gray-300 hover:bg-gray-100";
  return (
    <button type="button" role="tab" aria-selected={isActive} className={`${base} ${isActive ? active : inactive}`} onClick={onClick}>
      {children}
    </button>
  );
}
