const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getNextToken } = require('../services/token.service');
const { scheduleAutoCancel, clearAutoCancel } = require('../services/autoCancelTimer');
const { validateAndCalculateDiscount, markCouponUsed } = require('../services/coupon.service');
const { STATUS_TRANSITIONS } = require('../utils/constants');
const { getIO } = require('../config/socket');

// POST /api/orders - Place a new order
const placeOrder = asyncHandler(async (req, res) => {
  const { items, couponCode } = req.body;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must have at least one item');
  }

  // Validate and fetch menu items
  const orderItems = [];
  let totalAmount = 0;
  let maxPrepTime = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    if (!menuItem) throw new ApiError(404, `Menu item not found: ${item.menuItem}`);
    if (!menuItem.isAvailable) throw new ApiError(400, `${menuItem.name} is currently unavailable`);

    const quantity = item.quantity || 1;
    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
    });

    totalAmount += menuItem.price * quantity;
    maxPrepTime = Math.max(maxPrepTime, menuItem.prepTime);
  }

  // Apply coupon if provided
  let discount = 0;
  let couponUsed = null;

  if (couponCode) {
    const result = await validateAndCalculateDiscount(couponCode, totalAmount, req.user._id);
    discount = result.discount;
    couponUsed = result.coupon._id;
  }

  const finalAmount = totalAmount - discount;

  // Generate token number
  const tokenNumber = await getNextToken();

  // Set auto-cancel time
  const cancelMinutes = parseInt(process.env.AUTO_CANCEL_MINUTES) || 30;
  const autoCancelAt = new Date(Date.now() + cancelMinutes * 60 * 1000);

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    discount,
    finalAmount,
    couponUsed,
    tokenNumber,
    status: 'Pending',
    statusHistory: [{ status: 'Pending', changedAt: new Date() }],
    estimatedPrepTime: maxPrepTime,
    autoCancelAt,
  });

  // Mark coupon as used
  if (couponUsed) {
    await markCouponUsed(couponUsed, req.user._id);
  }

  // Schedule auto-cancel timer
  scheduleAutoCancel(order._id);

  // Notify admin via Socket.IO (no-op on serverless)
  try {
    const io = getIO();
    if (io) io.to('admin').emit('order:new', {
      orderId: order._id,
      tokenNumber: order.tokenNumber,
      items: order.items,
      finalAmount: order.finalAmount,
      userName: req.user.name,
      userRole: req.user.role,
    });
  } catch (err) {
    console.error('Socket emit failed:', err.message);
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order },
  });
});

// GET /api/orders - Get current user's orders
const getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('couponUsed', 'code type value');

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: { orders, total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// GET /api/orders/active - Get user's active (non-terminal) orders
const getActiveOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    status: { $in: ['Pending', 'Accepted', 'Preparing'] },
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: { orders } });
});

// GET /api/orders/:id - Get single order
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('couponUsed', 'code type value');

  if (!order) throw new ApiError(404, 'Order not found');

  // Users can only see their own orders, admin can see all
  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  res.json({ success: true, data: { order } });
});

// PATCH /api/orders/:id/cancel - Cancel own pending order
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) throw new ApiError(404, 'Order not found');
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  if (order.status !== 'Pending') {
    throw new ApiError(400, 'Only pending orders can be cancelled');
  }

  order.status = 'Cancelled';
  order.cancelReason = 'Cancelled by user';
  order.statusHistory.push({ status: 'Cancelled', changedAt: new Date() });
  await order.save();

  // Clear auto-cancel timer
  clearAutoCancel(order._id);

  // Notify via Socket.IO
  try {
    const io = getIO();
    if (io) io.to('admin').emit('order:statusUpdate', {
      orderId: order._id,
      tokenNumber: order.tokenNumber,
      status: 'Cancelled',
    });
  } catch (err) {
    console.error('Socket emit failed:', err.message);
  }

  res.json({ success: true, message: 'Order cancelled', data: { order } });
});

// PATCH /api/orders/:id/status - Update order status (admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) throw new ApiError(404, 'Order not found');

  // Validate status transition
  const allowedTransitions = STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(status)) {
    throw new ApiError(400, `Cannot transition from ${order.status} to ${status}`);
  }

  order.status = status;
  order.statusHistory.push({ status, changedAt: new Date() });

  if (status === 'Cancelled') {
    order.cancelReason = req.body.reason || 'Cancelled by admin';
  }

  await order.save();

  // Clear auto-cancel timer when order is accepted or cancelled
  if (status === 'Accepted' || status === 'Cancelled') {
    clearAutoCancel(order._id);
  }

  // Notify user via Socket.IO
  try {
    const io = getIO();
    if (io) io.to(`user:${order.user}`).to('admin').emit('order:statusUpdate', {
      orderId: order._id,
      tokenNumber: order.tokenNumber,
      status: order.status,
      updatedAt: new Date(),
    });
  } catch (err) {
    console.error('Socket emit failed:', err.message);
  }

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: { order },
  });
});

module.exports = { placeOrder, getMyOrders, getActiveOrders, getOrder, cancelOrder, updateOrderStatus };
