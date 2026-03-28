import { useState, useEffect } from 'react';
import { getMyOrders } from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (filter) params.status = filter;
        const res = await getMyOrders(params);
        setOrders(res.data.orders);
        setTotalPages(res.data.pages);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filter, page]);

  const statusFilters = ['', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Cancelled'];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Order History</h1>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === s
                ? 'bg-canteen-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-canteen-300'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders found"
          message="Your order history will appear here"
          action={
            <Link to="/dashboard/menu" className="px-4 py-2 bg-canteen-500 text-white rounded-lg text-sm font-medium hover:bg-canteen-600">
              Order Now
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
