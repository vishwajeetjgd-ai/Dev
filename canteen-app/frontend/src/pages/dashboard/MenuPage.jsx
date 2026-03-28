import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { getMenu } from '../../services/menuService';
import { useCart } from '../../hooks/useCart';
import MenuCard from '../../components/menu/MenuCard';
import CategoryFilter from '../../components/menu/CategoryFilter';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category !== 'all') params.category = category;
        if (search) params.search = search;
        const res = await getMenu(params);
        setItems(res.data.items);
      } catch (err) {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchMenu, 300);
    return () => clearTimeout(debounce);
  }, [category, search]);

  const handleAddToCart = (item) => {
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Menu</h1>

      {/* Search bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 focus:border-canteen-500 outline-none"
        />
      </div>

      {/* Category filter */}
      <CategoryFilter selected={category} onSelect={setCategory} />

      {/* Menu grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-64 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🍽️"
          title="No items found"
          message="Try changing the category or search query"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <MenuCard key={item._id} item={item} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
