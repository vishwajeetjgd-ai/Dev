import { CATEGORIES } from '../../config/constants';

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onSelect(cat.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selected === cat.value
              ? 'bg-canteen-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-canteen-300'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
