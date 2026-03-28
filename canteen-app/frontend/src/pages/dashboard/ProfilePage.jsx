import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMyCoupons } from '../../services/couponService';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await getMyCoupons();
        setCoupons(res.data.coupons);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-canteen-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-canteen-700">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-canteen-100 text-canteen-700 text-xs rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-canteen-500 text-white rounded-lg font-medium hover:bg-canteen-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Available coupons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Coupons</h2>
        {coupons.length === 0 ? (
          <p className="text-sm text-gray-500">No coupons available</p>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-3 bg-canteen-50 rounded-lg border border-canteen-200">
                <div>
                  <span className="font-mono font-bold text-canteen-700">{c.code}</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.type === 'flat' ? `₹${c.value} off` : `${c.value}% off`}
                    {c.minOrderAmount > 0 ? ` on orders above ₹${c.minOrderAmount}` : ''}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  Expires {formatDate(c.validUntil)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
