import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../../services/orderService';
import { useSocket } from '../../hooks/useSocket';
import OrderTimeline from '../../components/orders/OrderTimeline';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { on } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data.order);
      } catch (err) {
        toast.error('Order not found');
        navigate('/dashboard/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  // Listen for real-time status updates
  useEffect(() => {
    const cleanup = on('order:statusUpdate', (data) => {
      if (data.orderId === id) {
        setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
        toast.success(`Order status: ${data.status}`);
      }
    });

    const cleanupCancel = on('order:autoCancelled', (data) => {
      if (data.orderId === id) {
        setOrder((prev) => prev ? { ...prev, status: 'Cancelled', cancelReason: data.reason } : prev);
        toast.error('Order was auto-cancelled');
      }
    });

    return () => { cleanup(); cleanupCancel(); };
  }, [id, on]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await cancelOrder(id);
      setOrder((prev) => prev ? { ...prev, status: 'Cancelled', cancelReason: 'Cancelled by user' } : prev);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>;
  }

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order #{order.tokenNumber}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge status={order.status} />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <OrderTimeline status={order.status} />
      </div>

      {/* Cancel reason */}
      {order.cancelReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm font-medium">Reason: {order.cancelReason}</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 mb-3">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <span className="text-sm font-medium text-gray-800">{item.name}</span>
              <span className="text-xs text-gray-500 ml-2">x{item.quantity}</span>
            </div>
            <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t font-bold text-base">
          <span>Total</span>
          <span className="text-canteen-700">{formatCurrency(order.finalAmount)}</span>
        </div>
      </div>

      {/* Cancel button */}
      {order.status === 'Pending' && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full py-3 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 disabled:opacity-50"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}
