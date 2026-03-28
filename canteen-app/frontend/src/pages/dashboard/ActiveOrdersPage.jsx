import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveOrders } from '../../services/orderService';
import { useSocket } from '../../hooks/useSocket';
import OrderTimeline from '../../components/orders/OrderTimeline';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getActiveOrders();
        setOrders(res.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const cleanup = on('order:statusUpdate', (data) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === data.orderId ? { ...o, status: data.status } : o))
            .filter((o) => !['Ready', 'Cancelled'].includes(o.status))
      );
      toast.success(`Order #${data.tokenNumber}: ${data.status}`);
    });

    const cleanupCancel = on('order:autoCancelled', (data) => {
      setOrders((prev) => prev.filter((o) => o._id !== data.orderId));
      toast.error(`Order #${data.tokenNumber} auto-cancelled`);
    });

    return () => { cleanup(); cleanupCancel(); };
  }, [on]);

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-40 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Active Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon="🕐"
          title="No active orders"
          message="Place an order from the menu to see it here"
          action={
            <Link to="/dashboard/menu" className="px-4 py-2 bg-canteen-500 text-white rounded-lg text-sm font-medium hover:bg-canteen-600">
              Browse Menu
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/dashboard/orders/${order._id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-bold text-canteen-700">Token #{order.tokenNumber}</span>
                <span className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                {' '}- {formatCurrency(order.finalAmount)}
              </p>
              <OrderTimeline status={order.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
