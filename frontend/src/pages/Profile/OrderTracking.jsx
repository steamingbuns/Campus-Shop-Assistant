import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import './OrderTracking.css';

function OrderTracking() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const response = await orderService.getUserOrders(token);
        setOrders(response);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders.');
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, [token]);

  if (isLoading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="order-tracking-section">
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.order_id} className="order-card">
              <div className="order-card-header">
                <h3>Order Code: {order.order_code}</h3>
                <span className={`order-status ${order.order_status}`}>{order.order_status}</span>
              </div>
              <div className="order-card-body">
                <p><strong>Completion Code:</strong> <span className="completion-code">{order.completion_code}</span></p>
                <p><strong>Order Date:</strong> {new Date(order.create_at).toLocaleDateString()}</p>
                <p><strong>Total:</strong> {new Intl.NumberFormat('vi-VN').format(order.total_price)} đ</p>
                <h4>Items:</h4>
                <ul>
                  {order.items.map(item => (
                    <li key={item.productId}>{item.name} - {item.quantity} x {new Intl.NumberFormat('vi-VN').format(item.price)} đ</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderTracking;
