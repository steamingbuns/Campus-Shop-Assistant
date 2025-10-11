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
      completionCode: 'A7K9X2'
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
      status: 'done',
      date: '2025-10-07',
      completionCode: 'B3M5N8'
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
      completionCode: 'P4T7W1'
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
      status: 'done',
      date: '2025-10-05',
      completionCode: 'Q8R2L5'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleMarkAsDone = (orderId) => {
    setSelectedOrder(orders.find(o => o.id === orderId));
    setShowCompletionModal(true);
    setCodeError('');
  };

  const handleSubmitCompletion = (e) => {
    e.preventDefault();
    
    // Verify the completion code
    if (enteredCode.trim().toUpperCase() !== selectedOrder.completionCode.toUpperCase()) {
      setCodeError('Invalid completion code. Please ask the customer for their code.');
      return;
    }

    // Mark order as done
    setOrders(orders.map(order =>
      order.id === selectedOrder.id
        ? { ...order, status: 'done' }
        : order
    ));
    
    setShowCompletionModal(false);
    setEnteredCode('');
    setCodeError('');
    setSelectedOrder(null);
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
                <td className="total-cell">${order.total.toFixed(2)}</td>
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
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="modal-overlay" onClick={() => setShowCompletionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Order</h3>
            <p className="order-id-modal">Order: {selectedOrder?.id}</p>
            <p className="modal-instruction">
              Ask the customer for their completion code to verify the handover.
            </p>
            <form onSubmit={handleSubmitCompletion}>
              <div className="form-group">
                <label>Completion Code *</label>
                <input
                  type="text"
                  value={enteredCode}
                  onChange={(e) => {
                    setEnteredCode(e.target.value);
                    setCodeError('');
                  }}
                  placeholder="Enter 6-character code"
                  maxLength="6"
                  required
                  className={codeError ? 'error' : ''}
                  style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}
                />
                {codeError && <small className="error-message">{codeError}</small>}
                {!codeError && <small>The customer should have received this code with their order</small>}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowCompletionModal(false);
                    setEnteredCode('');
                    setCodeError('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Complete Order
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
