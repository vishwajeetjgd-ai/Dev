// API base URL - proxied through Vite in dev
export const API_BASE_URL = '/api';

// Socket URL - connects to same origin in dev
export const SOCKET_URL = 'http://localhost:5000';

// User roles
export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
};

// Order status values and their display colors
export const ORDER_STATUS = {
  Pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  Accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  Preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800', icon: '👨‍🍳' },
  Ready: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: '🎉' },
  Cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

// Menu categories
export const CATEGORIES = [
  { value: 'all', label: 'All Items' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'meals', label: 'Meals' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'combo', label: 'Combos' },
];
