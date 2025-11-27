import { useState, useEffect } from 'react';
import { Package2, CheckCircle2, Clock3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';

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
    return <div className="text-sm text-slate-600">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.length === 0 ? (
        <p className="text-sm text-slate-600">You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.order_id}
            className="rounded-2xl border border-blue-50 bg-white/80 p-4 shadow-sm shadow-blue-50"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Order Code: {order.order_code}
                </h3>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  order.order_status === 'completed'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {order.order_status}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p className="flex items-center gap-2 text-blue-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-semibold">Completion Code:</span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {order.completion_code}
                </span>
              </p>
              <p className="flex items-center gap-2 text-slate-600">
                <Clock3 className="h-4 w-4" />
                <span className="font-semibold text-slate-800">Order Date:</span>
                {new Date(order.create_at).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Total:</span>{' '}
                {new Intl.NumberFormat('vi-VN').format(order.total_price)} đ
              </p>
              <div>
                <p className="font-semibold text-slate-800">Items:</p>
                <ul className="mt-1 space-y-1 text-xs text-slate-600">
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.name} - {item.quantity} x {new Intl.NumberFormat('vi-VN').format(item.price)} đ
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderTracking;
