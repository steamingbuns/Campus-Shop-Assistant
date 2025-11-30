import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, PackageOpen, X, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ordersInventoryService from '../../services/ordersInventoryService';
import orderService from '../../services/orderService';

function OrderManagement() {
  const { token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setError('Please log in as a seller to view orders.');
      setOrders([]);
      setLoading(false);
      return;
    }

    fetchOrders();
  }, [token, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersInventoryService.getSellerOrders(token);
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err?.status === 401 || err?.status === 403) {
        setError('Unauthorized. Please log in as a seller.');
      } else {
        setError('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const openCodeModal = (orderId) => {
    setSelectedOrderId(orderId);
    setCodeInput('');
    setShowCodeModal(true);
  };

  const closeCodeModal = () => {
    setSelectedOrderId(null);
    setShowCodeModal(false);
    setCodeInput('');
    setCompletingId(null);
  };
  
  const openDetailsModal = (order) => {
    setSelectedOrderForDetails(order);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedOrderForDetails(null);
    setShowDetailsModal(false);
  };

  const handleCompleteWithPrompt = async () => {
    if (!codeInput.trim() || !selectedOrderId) {
      setError('Please enter the completion code provided by the buyer.');
      return;
    }
    setCompletingId(selectedOrderId);
    try {
      await orderService.completeOrder({ completion_code: codeInput.trim() }, token);
      setOrders(orders.map(order =>
        order.id === selectedOrderId
          ? { ...order, status: 'completed' }
          : order
      ));
      setError(null);
      closeCodeModal();
    } catch (err) {
      console.error('Error completing order:', err);
      setError(err.message || 'Failed to complete order. Check the code and try again.');
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'completed': return 'status-done';
      default: return '';
    }
  };

  const getStatusText = (status) => status.charAt(0).toUpperCase() + status.slice(1);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
          <p className="text-sm text-slate-600">View and manage your customer orders</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-50 bg-white/80 p-3 shadow-sm shadow-blue-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
            <PackageOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Pending Orders</p>
            <p className="text-lg font-bold text-slate-900">{pendingOrders.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-blue-50 bg-white/80 p-3 shadow-sm shadow-blue-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Completed Orders</p>
            <p className="text-lg font-bold text-slate-900">{completedOrders.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-blue-50 bg-white/80 p-3 shadow-sm shadow-blue-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Orders</p>
            <p className="text-lg font-bold text-slate-900">{orders.length}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-blue-50 bg-white/80 shadow-sm shadow-blue-50">
        {loading ? (
          <div className="p-6 text-sm text-slate-600">Loading orders...</div>
        ) : error ? (
          <div className="p-6 text-sm font-semibold text-red-600">{error}</div>
        ) : (
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-blue-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-blue-50 hover:bg-blue-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{order.id}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-900">{order.customer}</p>
                      <p className="text-xs text-slate-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{Number(order.total).toFixed(2)}đ</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        getStatusColor(order.status) === 'status-pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm shadow-blue-50 transition hover:border-blue-200 hover:text-blue-600"
                        onClick={() => openDetailsModal(order)}
                        title="View Customer Preference"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {order.status === 'pending' ? (
                        <button
                          className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md"
                          disabled={completingId === order.id}
                          onClick={() => openCodeModal(order.id)}
                        >
                          {completingId === order.id ? '...' : 'Complete'}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-green-700">Completed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900">Enter Completion Code</h3>
              </div>
              <button
                type="button"
                onClick={closeCodeModal}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Please input the code provided by the buyer to mark this order as completed.
            </p>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="mt-3 w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
              placeholder="Completion code"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-200"
                onClick={closeCodeModal}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg disabled:opacity-70"
                disabled={completingId === selectedOrderId}
                onClick={handleCompleteWithPrompt}
              >
                {completingId === selectedOrderId ? 'Completing...' : 'Confirm Completion'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
          </div>
        </div>
      )}
      
      {showDetailsModal && selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl shadow-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900">Customer Preference</h3>
              </div>
              <button
                type="button"
                onClick={closeDetailsModal}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="rounded-xl bg-blue-50/50 p-4 ring-1 ring-blue-100">
                <h4 className="mb-2 font-semibold text-blue-700">Meeting Details</h4>
                {selectedOrderForDetails.meeting_details ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-700">
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="font-medium">{selectedOrderForDetails.meeting_details.meetingDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Time</p>
                      <p className="font-medium">{selectedOrderForDetails.meeting_details.meetingTime}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="font-medium">
                        {selectedOrderForDetails.meeting_details.meetingTower}, {selectedOrderForDetails.meeting_details.meetingLocation}
                      </p>
                    </div>
                    <div className="col-span-2 border-t border-blue-100 pt-2 mt-1">
                      <p className="text-xs text-slate-500">Contact</p>
                      <p className="font-medium">{selectedOrderForDetails.meeting_details.fullName}</p>
                      <p className="text-xs">{selectedOrderForDetails.meeting_details.phone}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No meeting details provided.</p>
                )}
              </div>
              
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <h4 className="mb-2 font-semibold text-slate-800">Order Notes</h4>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {selectedOrderForDetails.notes || <span className="italic text-slate-400">No additional notes.</span>}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-200"
                onClick={closeDetailsModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
