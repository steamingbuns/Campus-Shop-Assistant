import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import adminService from '../../services/adminService.js';

export default function ReportsPanel() {
  const { isLoggedIn, user, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasAccess = isLoggedIn && ['admin', 'staff'].includes(user?.role);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!hasAccess || !token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await adminService.getTransactions(token);
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load transactions.');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [hasAccess, token]);

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter((t) =>
      [t.order_id, t.product_title, t.buyer_name, t.seller_name]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [transactions, search]);

  if (!hasAccess) {
    return <div className="text-sm text-slate-600">You do not have permission to view this page. Please sign in with an admin or staff account.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">Admin</p>
          <h2 className="text-2xl font-bold text-slate-900">Sales & Transaction History</h2>
          <p className="text-sm text-slate-600">Buyer/seller breakdown for recent orders.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order, item, buyer, or seller..."
          className="w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500 sm:max-w-sm"
        />
      </div>

      {loading && <p className="text-sm text-slate-600">Loading transactions...</p>}
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-blue-50 bg-white/80 shadow-sm shadow-blue-50">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Item</th>
                <th className="p-3">Buyer</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.order_id} className="border-t border-blue-50 hover:bg-blue-50/40">
                  <td className="p-3 font-semibold text-slate-900">#{t.order_id}</td>
                  <td className="p-3 text-slate-700">{t.product_title || '—'}</td>
                  <td className="p-3 text-slate-700">{t.buyer_name || '—'}</td>
                  <td className="p-3 text-slate-700">{t.seller_name || '—'}</td>
                  <td className="p-3 font-semibold text-slate-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(t.amount || 0)}
                  </td>
                  <td className="p-3 text-slate-600">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {t.status || 'unknown'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-sm text-slate-600">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
