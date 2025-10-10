import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import InventoryManagement from './InventoryManagement';
import OrderManagement from './OrderManagement';
import './SellerDashboard.css';

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
    <div className="seller-dashboard">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Seller Dashboard</h1>
        <p className="dashboard-subtitle">Manage your products, orders, and sales</p>

        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <span className="tab-icon">📦</span>
            Inventory
          </button>
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="tab-icon">📋</span>
            Orders
          </button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
