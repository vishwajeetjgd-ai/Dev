import { NavLink } from 'react-router-dom';
import {
  FiHome, FiList, FiShoppingBag, FiClock, FiUser, FiTag,
  FiGrid, FiPackage, FiPieChart,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

// Navigation links for each role
const studentLinks = [
  { to: '/dashboard', icon: FiHome, label: 'Home' },
  { to: '/dashboard/menu', icon: FiList, label: 'Menu' },
  { to: '/dashboard/checkout', icon: FiShoppingBag, label: 'Cart / Checkout' },
  { to: '/dashboard/active-orders', icon: FiClock, label: 'Active Orders' },
  { to: '/dashboard/orders', icon: FiPackage, label: 'Order History' },
  { to: '/dashboard/profile', icon: FiUser, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/orders', icon: FiPackage, label: 'Orders' },
  { to: '/admin/menu', icon: FiList, label: 'Menu Management' },
  { to: '/admin/coupons', icon: FiTag, label: 'Coupons & Offers' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-canteen-500 text-white'
        : 'text-gray-600 hover:bg-canteen-50 hover:text-canteen-700'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 space-y-1">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {user?.role === 'admin' ? 'Administration' : 'Menu'}
            </p>
          </div>

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard' || link.to === '/admin/dashboard'}
              className={linkClasses}
              onClick={onClose}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Queue info at bottom */}
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-canteen-50 rounded-lg">
          <p className="text-xs text-canteen-700 font-medium">Campus Canteen</p>
          <p className="text-xs text-gray-500 mt-0.5">Open 8 AM - 8 PM</p>
        </div>
      </aside>
    </>
  );
}
