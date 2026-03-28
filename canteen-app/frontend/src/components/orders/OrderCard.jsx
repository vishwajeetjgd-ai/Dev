import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

export default function OrderCard({ order }) {
  return (
    <Link
      to={`/dashboard/orders/${order._id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-canteen-700">#{order.tokenNumber}</span>
          <Badge status={order.status} />
        </div>
        <span className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</span>
      </div>

      {/* Items summary */}
      <div className="text-sm text-gray-600">
        {order.items.slice(0, 3).map((item, i) => (
          <span key={i}>
            {item.name} x{item.quantity}
            {i < Math.min(order.items.length, 3) - 1 ? ', ' : ''}
          </span>
        ))}
        {order.items.length > 3 && (
          <span className="text-gray-400"> +{order.items.length - 3} more</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-500">{order.items.length} item(s)</span>
        <span className="font-semibold text-canteen-700">{formatCurrency(order.finalAmount)}</span>
      </div>
    </Link>
  );
}
