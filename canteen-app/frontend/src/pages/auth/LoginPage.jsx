import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState('student'); // student | teacher | admin
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill admin credentials for convenience
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      setForm({ email: 'admin@canteen.com', password: 'Admin@123' });
    } else {
      setForm({ email: '', password: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-canteen-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-canteen-500 p-6 text-center">
          <span className="text-4xl">🍽️</span>
          <h1 className="text-2xl font-bold text-white mt-2">Campus Canteen</h1>
          <p className="text-canteen-100 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Role tabs */}
        <div className="flex border-b border-gray-200">
          {['student', 'teacher', 'admin'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-canteen-600 border-b-2 border-canteen-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 focus:border-canteen-500 outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 focus:border-canteen-500 outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-canteen-500 text-white rounded-lg font-medium hover:bg-canteen-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {activeTab !== 'admin' && (
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-canteen-600 font-medium hover:underline">
                Register
              </Link>
            </p>
          )}

          {activeTab === 'admin' && (
            <p className="text-center text-xs text-gray-400">
              Admin account is pre-configured
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
