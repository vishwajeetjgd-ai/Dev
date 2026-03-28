const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { validateAndCalculateDiscount } = require('../services/coupon.service');

// POST /api/coupons - Create coupon (admin only)
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code, type, value, minOrderAmount, maxDiscount,
    validFrom, validUntil, usageLimit, isWelcome,
  } = req.body;

  const coupon = await Coupon.create({
    code,
    type,
    value,
    minOrderAmount: minOrderAmount || 0,
    maxDiscount: maxDiscount || null,
    isWelcome: isWelcome || false,
    validFrom: new Date(validFrom),
    validUntil: new Date(validUntil),
    usageLimit: usageLimit || 1,
    isActive: true,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created',
    data: { coupon },
  });
});

// GET /api/coupons - List all coupons (admin only)
const getCoupons = asyncHandler(async (req, res) => {
  const { active } = req.query;
  const filter = {};
  if (active !== undefined) filter.isActive = active === 'true';

  const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

  res.json({ success: true, data: { coupons } });
});

// PUT /api/coupons/:id - Update coupon (admin only)
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) throw new ApiError(404, 'Coupon not found');

  res.json({
    success: true,
    message: 'Coupon updated',
    data: { coupon },
  });
});

// DELETE /api/coupons/:id - Deactivate coupon (admin only)
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!coupon) throw new ApiError(404, 'Coupon not found');

  res.json({ success: true, message: 'Coupon deactivated' });
});

// POST /api/coupons/validate - Validate coupon against cart (student/teacher)
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code || !cartTotal) {
    throw new ApiError(400, 'Coupon code and cart total are required');
  }

  const { discount } = await validateAndCalculateDiscount(code, cartTotal, req.user._id);

  res.json({
    success: true,
    data: { code: code.toUpperCase(), discount, finalTotal: cartTotal - discount },
  });
});

// GET /api/coupons/my - Get available coupons for current user
const getMyCoupons = asyncHandler(async (req, res) => {
  const now = new Date();

  const coupons = await Coupon.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { isWelcome: true, createdBy: req.user._id },
      { isWelcome: false },
    ],
    usedBy: { $ne: req.user._id }, // exclude already used
  });

  // Filter out coupons that hit usage limit
  const available = coupons.filter((c) => c.usedCount < c.usageLimit);

  res.json({ success: true, data: { coupons: available } });
});

module.exports = { createCoupon, getCoupons, updateCoupon, deleteCoupon, validateCoupon, getMyCoupons };
