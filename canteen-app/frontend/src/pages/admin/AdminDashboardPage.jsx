import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiDollarSign, FiClock, FiTrendingUp } from 'react-icons/fi';
import { getDashboard, getQueueInfo, advanceToken } from '../../services/adminService';
import { useSocket } from '../../hooks/useSocket';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [queue, setQueue] = useState({ currentServing: 0, totalTokens: 0 });
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, queueRes] = await Promise.all([getDashboard(), getQueueInfo()]);
        setStats(dashRes.data);
        setQueue(queueRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Listen for new orders in real-time
  useEffect(() => {
    const cleanup = on('order:new', (data) => {
      toast.success(`New order #${data.tokenNumber} from ${data.userName}`);
      // Refresh dashboard stats
      getDashboard().then((res) => setStats(res.data)).catch(() => {});
    });
    return cleanup;
  }, [on]);

  const handleAdvanceToken = async () => {
    try {
      const res = await advanceToken();
      setQueue({
        currentServing: res.data.currentServing,
        totalTokens: res.data.totalTokens,
      });
      toast.success(`Now serving token #${res.data.currentServing}`);
    } catch (err) {
      toast.error('Failed to advance token');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Today\'s Orders',
      value: stats?.todayOrders || 0,
      icon: FiPackage,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Today\'s Revenue',
      value: formatCurrency(stats?.todayRevenue || 0),
      icon: FiDollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: FiClock,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Now Serving',
      value: `#${queue.currentServing}`,
      icon: FiTrendingUp,
      color: 'bg-canteen-50 text-canteen-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleAdvanceToken}
          className="px-4 py-2 bg-canteen-500 text-white rounded-lg text-sm font-medium hover:bg-canteen-600"
        >
          Next Token
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      {stats?.statusBreakdown && Object.keys(stats.statusBreakdown).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Order Status Breakdown</h2>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <Badge status={status} />
                <span className="text-sm font-medium text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-canteen-600 hover:underline">
            View all
          </Link>
        </div>

        {stats?.recentOrders?.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No orders today</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">Token</th>
                  <th className="text-left py-2 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-2 font-medium text-gray-500">Items</th>
                  <th className="text-left py-2 font-medium text-gray-500">Amount</th>
                  <th className="text-left py-2 font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100">
                    <td className="py-2 font-bold text-canteen-700">#{order.tokenNumber}</td>
                    <td className="py-2">
                      <span className="text-gray-800">{order.user?.name}</span>
                      <span className="text-xs text-gray-400 ml-1 capitalize">({order.user?.role})</span>
                    </td>
                    <td className="py-2 text-gray-600">{order.items.length} item(s)</td>
                    <td className="py-2 font-medium">{formatCurrency(order.finalAmount)}</td>
                    <td className="py-2"><Badge status={order.status} /></td>
                    <td className="py-2 text-gray-400">{formatTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
