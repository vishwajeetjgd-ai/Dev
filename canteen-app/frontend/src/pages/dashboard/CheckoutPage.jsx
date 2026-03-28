import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { placeOrder } from '../../services/orderService';
import { validateCoupon } from '../../services/couponService';
import CartItem from '../../components/cart/CartItem';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const {
    items, subtotal, discount, total, coupon,
    updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon,
  } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(couponCode, subtotal);
      applyCoupon(couponCode, res.data.discount);
      toast.success(`Coupon applied! You save ${formatCurrency(res.data.discount)}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setOrderLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({ menuItem: i.menuItem, quantity: i.quantity })),
      };
      if (coupon) orderData.couponCode = coupon;

      const res = await placeOrder(orderData);
      clearCart();
      toast.success(`Order placed! Token #${res.data.order.tokenNumber}`);
      navigate(`/dashboard/orders/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        message="Browse the menu and add items to get started"
        action={
          <Link
            to="/dashboard/menu"
            className="px-4 py-2 bg-canteen-500 text-white rounded-lg text-sm font-medium hover:bg-canteen-600"
          >
            Browse Menu
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>

      {/* Cart items */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 mb-3">Your Items ({items.length})</h2>
        {items.map((item) => (
          <CartItem
            key={item.menuItem}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      {/* Coupon */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 mb-3">Apply Coupon</h2>
        {coupon ? (
          <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
            <div>
              <span className="text-green-700 font-medium">{coupon}</span>
              <span className="text-green-600 text-sm ml-2">(-{formatCurrency(discount)})</span>
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-canteen-500 outline-none text-sm"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              className="px-4 py-2 bg-canteen-500 text-white rounded-lg text-sm font-medium hover:bg-canteen-600 disabled:opacity-50"
            >
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold">
            <span>Total</span>
            <span className="text-canteen-700">{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={orderLoading}
          className="w-full mt-4 py-3 bg-canteen-500 text-white rounded-lg font-medium hover:bg-canteen-600 disabled:opacity-50 transition-colors"
        >
          {orderLoading ? 'Placing Order...' : `Place Order - ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  );
}
