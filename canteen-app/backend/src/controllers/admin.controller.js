const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/dashboard - Aggregated stats for today
const getDashboard = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayFilter = { createdAt: { $gte: todayStart, $lte: todayEnd } };

  // Run all queries in parallel
  const [todayOrders, revenueResult, statusBreakdown, recentOrders] = await Promise.all([
    Order.countDocuments(todayFilter),
    Order.aggregate([
      { $match: { ...todayFilter, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]),
    Order.aggregate([
      { $match: todayFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.find(todayFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email role'),
  ]);

  const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
  const statusMap = {};
  statusBreakdown.forEach((s) => { statusMap[s._id] = s.count; });

  res.json({
    success: true,
    data: {
      todayOrders,
      todayRevenue: revenue,
      pendingOrders: statusMap['Pending'] || 0,
      statusBreakdown: statusMap,
      recentOrders,
    },
  });
});

// GET /api/admin/orders - All orders with filters and pagination
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;

  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    filter.createdAt = { $gte: dayStart, $lte: dayEnd };
  }

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('user', 'name email role');

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: {
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  });
});

module.exports = { getDashboard, getAllOrders };
