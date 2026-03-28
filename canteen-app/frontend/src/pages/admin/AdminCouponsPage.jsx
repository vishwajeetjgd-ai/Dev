import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import * as couponService from '../../services/couponService';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const emptyForm = {
  code: '', type: 'percentage', value: '', minOrderAmount: '',
  maxDiscount: '', validFrom: '', validUntil: '', usageLimit: '1',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await couponService.getCoupons();
      setCoupons(res.data.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await couponService.createCoupon({
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: Number(form.usageLimit) || 1,
      });
      toast.success('Coupon created');
      setModalOpen(false);
      setForm(emptyForm);
      fetchCoupons();
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this coupon?')) return;
    try {
      await couponService.deleteCoupon(id);
      setCoupons((prev) => prev.map((c) => (c._id === id ? { ...c, isActive: false } : c)));
      toast.success('Coupon deactivated');
    } catch (err) {
      toast.error('Failed to deactivate');
    }
  };

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Coupons & Offers</h1>
        <button
          onClick={() => { setForm(emptyForm); setModalOpen(true); }}
          className="flex items-center gap-1 px-4 py-2 bg-canteen-500 text-white rounded-lg text-sm font-medium hover:bg-canteen-600"
        >
          <FiPlus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon="🏷️" title="No coupons" message="Create your first coupon" />
      ) : (
        <div className="grid gap-3">
          {coupons.map((c) => (
            <div key={c._id} className={`bg-white rounded-xl border p-4 ${c.isActive ? 'border-gray-200' : 'border-red-200 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-canteen-700 text-lg">{c.code}</span>
                    {c.isWelcome && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Welcome</span>
                    )}
                    {!c.isActive && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {c.type === 'flat' ? `₹${c.value} off` : `${c.value}% off`}
                    {c.minOrderAmount > 0 ? ` on orders above ₹${c.minOrderAmount}` : ''}
                    {c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Valid: {formatDate(c.validFrom)} - {formatDate(c.validUntil)} | Used: {c.usedCount}/{c.usageLimit}
                  </p>
                </div>
                {c.isActive && (
                  <button onClick={() => handleDelete(c._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none" placeholder="e.g. SAVE20" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none" min="0" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (₹)</label>
              <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
              <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
              <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
            <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none" min="1" required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-canteen-500 text-white rounded-lg font-medium hover:bg-canteen-600 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
