const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');

// Validate and calculate discount for a coupon
const validateAndCalculateDiscount = async (code, cartTotal, userId) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) {
    throw new ApiError(400, 'Invalid coupon code');
  }

  const now = new Date();

  // Check validity period
  if (now < coupon.validFrom || now > coupon.validUntil) {
    throw new ApiError(400, 'Coupon has expired or is not yet valid');
  }

  // Check usage limit
  if (coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }

  // Check if user already used this coupon
  if (coupon.usedBy.includes(userId)) {
    throw new ApiError(400, 'You have already used this coupon');
  }

  // Check minimum order amount
  if (cartTotal < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount is ₹${coupon.minOrderAmount}`);
  }

  // Calculate discount
  let discount;
  if (coupon.type === 'flat') {
    discount = coupon.value;
  } else {
    discount = (cartTotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  // Discount should never exceed cart total
  discount = Math.min(discount, cartTotal);

  return { coupon, discount: Math.round(discount * 100) / 100 };
};

// Mark coupon as used by a user
const markCouponUsed = async (couponId, userId) => {
  await Coupon.findByIdAndUpdate(couponId, {
    $inc: { usedCount: 1 },
    $push: { usedBy: userId },
  });
};

module.exports = { validateAndCalculateDiscount, markCouponUsed };
