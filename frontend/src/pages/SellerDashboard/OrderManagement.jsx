import { useState, useEffect } from 'react';
import ordersInventoryService from '../../services/ordersInventoryService';
import './OrderManagement.css';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersInventoryService.getSellerOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = async (orderId) => {
    try {
      await ordersInventoryService.updateOrderStatus(orderId, 'done');
      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'done' }
          : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'done': return 'status-done';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'done');

  return (
    <div className="order-management">
      <div className="order-header">
        <div>
          <h2>Order Management</h2>
          <p>View and manage your customer orders</p>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="order-stats">
        <div className="stat-card">
          <div className="stat-icon pending">📦</div>
          <div className="stat-info">
            <h3>{pendingOrders.length}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done">✅</div>
          <div className="stat-info">
            <h3>{completedOrders.length}</h3>
            <p>Completed Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-info">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {loading ? (
          <div className="loading-state">Loading orders...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="order-id-cell">{order.id}</td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.customer}</strong>
                      <small>{order.email}</small>
                    </div>
                  </td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>
                    <div className="items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="item-detail">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="total-cell">${Number(order.total).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {order.status === 'pending' && (
                      <button
                        className="btn-complete"
                        onClick={() => handleMarkAsDone(order.id)}
                      >
                        Mark as Done
                      </button>
                    )}
                    {order.status === 'done' && (
                      <span className="done-label">✓ Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OrderManagement;
