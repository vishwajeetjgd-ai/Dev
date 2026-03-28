import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-xl">🍽️</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 truncate">{item.name}</h4>
        <p className="text-sm text-canteen-600 font-semibold">{formatCurrency(item.price)}</p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.menuItem, item.quantity - 1)}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
        >
          <FiMinus className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.menuItem, item.quantity + 1)}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
        >
          <FiPlus className="w-4 h-4" />
        </button>
        <button
          onClick={() => onRemove(item.menuItem)}
          className="p-1 rounded-md hover:bg-red-50 text-red-500 ml-1"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
