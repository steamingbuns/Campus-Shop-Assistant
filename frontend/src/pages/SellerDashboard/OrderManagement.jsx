import { useState } from 'react';
import './OrderManagement.css';

function OrderManagement() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      email: 'john@example.com',
      items: [
        { name: 'Laptop Stand', quantity: 2, price: 29.99 }
      ],
      total: 59.98,
      status: 'pending',
      date: '2025-10-08',
      trackingNumber: ''
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      items: [
        { name: 'Notebook Set', quantity: 3, price: 12.99 },
        { name: 'Coffee Mug', quantity: 1, price: 14.99 }
      ],
      total: 53.96,
      status: 'shipped',
      date: '2025-10-07',
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      items: [
        { name: 'USB Cable', quantity: 5, price: 9.99 }
      ],
      total: 49.95,
      status: 'pending',
      date: '2025-10-09',
      trackingNumber: ''
    },
    {
      id: 'ORD-004',
      customer: 'Sarah Williams',
      email: 'sarah@example.com',
      items: [
        { name: 'Laptop Stand', quantity: 1, price: 29.99 },
        { name: 'USB Cable', quantity: 2, price: 9.99 }
      ],
      total: 49.97,
      status: 'delivered',
      date: '2025-10-05',
      trackingNumber: 'TRK987654321'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleMarkAsShipped = (orderId) => {
    setSelectedOrder(orders.find(o => o.id === orderId));
    setShowTrackingModal(true);
  };

  const handleSubmitTracking = (e) => {
    e.preventDefault();
    setOrders(orders.map(order =>
      order.id === selectedOrder.id
        ? { ...order, status: 'shipped', trackingNumber: trackingNumber }
        : order
    ));
    setShowTrackingModal(false);
    setTrackingNumber('');
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const shippedOrders = orders.filter(o => o.status === 'shipped');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

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
          <div className="stat-icon shipped">🚚</div>
          <div className="stat-info">
            <h3>{shippedOrders.length}</h3>
            <p>Shipped Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon delivered">✅</div>
          <div className="stat-info">
            <h3>{deliveredOrders.length}</h3>
            <p>Delivered Orders</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Tracking</th>
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
                <td className="total-cell">${order.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td>
                  {order.trackingNumber ? (
                    <span className="tracking-number">{order.trackingNumber}</span>
                  ) : (
                    <span className="no-tracking">—</span>
                  )}
                </td>
                <td className="actions-cell">
                  {order.status === 'pending' && (
                    <button
                      className="btn-ship"
                      onClick={() => handleMarkAsShipped(order.id)}
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <span className="shipped-label">✓ Shipped</span>
                  )}
                  {order.status === 'delivered' && (
                    <span className="delivered-label">✓ Delivered</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="modal-overlay" onClick={() => setShowTrackingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Mark Order as Shipped</h3>
            <p className="order-id-modal">Order: {selectedOrder?.id}</p>
            <form onSubmit={handleSubmitTracking}>
              <div className="form-group">
                <label>Tracking Number (Optional)</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
                <small>Provide a tracking number for the customer to track their shipment</small>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowTrackingModal(false);
                    setTrackingNumber('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Confirm Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
