import { FiPlus, FiClock } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';

export default function MenuCard({ item, onAddToCart, showAddButton = true }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">🍽️</div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Unavailable
            </span>
          </div>
        )}
        <span className="absolute top-2 right-2 bg-white/90 text-gray-700 px-2 py-0.5 rounded-full text-xs capitalize">
          {item.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-canteen-700">{formatCurrency(item.price)}</span>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <FiClock className="w-3 h-3" />
              <span>{item.prepTime} min</span>
            </div>
          </div>

          {showAddButton && item.isAvailable && (
            <button
              onClick={() => onAddToCart(item)}
              className="flex items-center gap-1 px-3 py-1.5 bg-canteen-500 text-white rounded-lg text-sm font-medium hover:bg-canteen-600 transition-colors"
            >
              <FiPlus className="w-4 h-4" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
