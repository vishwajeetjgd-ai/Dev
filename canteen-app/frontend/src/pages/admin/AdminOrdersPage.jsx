import { useState, useEffect } from 'react';
import { getAllOrders } from '../../services/adminService';
import { updateOrderStatus } from '../../services/orderService';
import { useSocket } from '../../hooks/useSocket';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const STATUS_ACTIONS = {
  Pending: [
    { label: 'Accept', next: 'Accepted', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Reject', next: 'Cancelled', color: 'bg-red-500 hover:bg-red-600' },
  ],
  Accepted: [
    { label: 'Start Preparing', next: 'Preparing', color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'Cancel', next: 'Cancelled', color: 'bg-red-500 hover:bg-red-600' },
  ],
  Preparing: [
    { label: 'Mark Ready', next: 'Ready', color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Cancel', next: 'Cancelled', color: 'bg-red-500 hover:bg-red-600' },
  ],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null);
  const { on } = useSocket();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter) params.status = filter;
      const res = await getAllOrders(params);
      setOrders(res.data.orders);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter, page]);

  // Listen for new orders
  useEffect(() => {
    const cleanup = on('order:new', () => { fetchOrders(); });
    return cleanup;
  }, [on, filter, page]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      toast.success(`Order updated to ${status}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const statusFilters = ['', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Cancelled'];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Manage Orders</h1>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === s
                ? 'bg-canteen-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders found" message="Orders will appear here" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-canteen-700">#{order.tokenNumber}</span>
                  <Badge status={order.status} />
                  <span className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{order.user?.name}</span>
                  <span className="text-xs text-gray-400 capitalize">({order.user?.role})</span>
                </div>
              </div>

              {/* Items */}
              <div className="text-sm text-gray-600 mb-3">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.name} x{item.quantity}
                    {i < order.items.length - 1 ? ', ' : ''}
                  </span>
                ))}
                <span className="font-semibold text-canteen-700 ml-2">
                  {formatCurrency(order.finalAmount)}
                </span>
              </div>

              {/* Action buttons */}
              {STATUS_ACTIONS[order.status] && (
                <div className="flex gap-2">
                  {STATUS_ACTIONS[order.status].map((action) => (
                    <button
                      key={action.next}
                      onClick={() => handleStatusUpdate(order._id, action.next)}
                      disabled={updating === order._id}
                      className={`px-3 py-1.5 text-white rounded-lg text-sm font-medium disabled:opacity-50 ${action.color}`}
                    >
                      {updating === order._id ? '...' : action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Previous</button>
          <span className="px-3 py-1 text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
