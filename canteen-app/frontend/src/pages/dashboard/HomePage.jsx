import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { getMenu } from '../../services/menuService';
import { getActiveOrders } from '../../services/orderService';
import { getQueueInfo } from '../../services/adminService';
import MenuCard from '../../components/menu/MenuCard';
import OrderTimeline from '../../components/orders/OrderTimeline';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { on } = useSocket();
  const [featured, setFeatured] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [queue, setQueue] = useState({ currentServing: 0, totalTokens: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, ordersRes, queueRes] = await Promise.all([
          getMenu({ available: true }),
          getActiveOrders(),
          getQueueInfo(),
        ]);
        setFeatured(menuRes.data.items.slice(0, 4));
        setActiveOrders(ordersRes.data.orders);
        setQueue(queueRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Listen for real-time order status updates
  useEffect(() => {
    const cleanup = on('order:statusUpdate', (data) => {
      setActiveOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId ? { ...o, status: data.status } : o
        ).filter((o) => !['Ready', 'Cancelled'].includes(o.status))
      );
      toast.success(`Order #${data.tokenNumber}: ${data.status}`);
    });

    const cleanupCancel = on('order:autoCancelled', (data) => {
      setActiveOrders((prev) => prev.filter((o) => o._id !== data.orderId));
      toast.error(`Order #${data.tokenNumber} was auto-cancelled`);
    });

    const cleanupToken = on('token:update', (data) => {
      setQueue(data);
    });

    return () => { cleanup(); cleanupCancel(); cleanupToken(); };
  }, [on]);

  const handleAddToCart = (item) => {
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-canteen-500 to-canteen-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-canteen-100 mt-1">What would you like to eat today?</p>
        <Link
          to="/dashboard/menu"
          className="inline-block mt-3 px-4 py-2 bg-white text-canteen-700 rounded-lg text-sm font-medium hover:bg-canteen-50 transition-colors"
        >
          Browse Menu
        </Link>
      </div>

      {/* Queue status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Currently Serving</p>
            <p className="text-3xl font-bold text-canteen-700">
              Token #{queue.currentServing || '-'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Tokens Today</p>
            <p className="text-xl font-semibold text-gray-700">{queue.totalTokens}</p>
          </div>
        </div>
      </div>

      {/* Active orders */}
      {activeOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Active Orders</h2>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <Link
                key={order._id}
                to={`/dashboard/orders/${order._id}`}
                className="block bg-white rounded-xl border border-canteen-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-canteen-700">Token #{order.tokenNumber}</span>
                  <span className="text-sm font-medium text-canteen-600">{formatCurrency(order.finalAmount)}</span>
                </div>
                <OrderTimeline status={order.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Popular Items</h2>
          <Link to="/dashboard/menu" className="text-sm text-canteen-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((item) => (
            <MenuCard key={item._id} item={item} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </div>
    </div>
  );
}
