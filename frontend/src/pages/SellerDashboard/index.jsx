import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Boxes, ClipboardList } from 'lucide-react';
import InventoryManagement from './InventoryManagement';
import OrderManagement from './OrderManagement';

function SellerDashboard() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement />;
      default:
        return <InventoryManagement />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">Seller</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Seller Dashboard</h1>
        <p className="text-sm text-slate-600">Manage your products, orders, and sales.</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl bg-white/80 p-3 shadow-sm shadow-blue-50 ring-1 ring-blue-50">
        <button
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'inventory'
              ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-md shadow-blue-200'
              : 'bg-white text-slate-700 ring-1 ring-blue-100 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('inventory')}
        >
          <Boxes className="h-4 w-4" />
          Inventory
        </button>
        <button
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-md shadow-blue-200'
              : 'bg-white text-slate-700 ring-1 ring-blue-100 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          <ClipboardList className="h-4 w-4" />
          Orders
        </button>
      </div>

      <div className="rounded-3xl bg-white/80 p-4 shadow-lg shadow-blue-100 ring-1 ring-blue-50">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default SellerDashboard;
