const Order = require('../models/Order');
const { getIO } = require('../config/socket');

// In-memory map of active auto-cancel timers: orderId -> timeoutId
const activeTimers = new Map();

// Schedule auto-cancel for an order after specified delay
const scheduleAutoCancel = (orderId, delayMs) => {
  const cancelMinutes = parseInt(process.env.AUTO_CANCEL_MINUTES) || 30;
  const delay = delayMs || cancelMinutes * 60 * 1000;

  const timeoutId = setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);

      // Only cancel if still pending
      if (!order || order.status !== 'Pending') {
        activeTimers.delete(orderId.toString());
        return;
      }

      order.status = 'Cancelled';
      order.cancelReason = 'Auto-cancelled: not accepted within time limit';
      order.statusHistory.push({ status: 'Cancelled', changedAt: new Date() });
      await order.save();

      // Notify via Socket.IO
      try {
        const io = getIO();
        io.to(`user:${order.user}`).to('admin').emit('order:autoCancelled', {
          orderId: order._id,
          tokenNumber: order.tokenNumber,
          reason: order.cancelReason,
        });
      } catch (socketErr) {
        console.error('Socket emit failed for auto-cancel:', socketErr.message);
      }

      console.log(`Order ${orderId} auto-cancelled (token #${order.tokenNumber})`);
      activeTimers.delete(orderId.toString());
    } catch (err) {
      console.error(`Auto-cancel failed for order ${orderId}:`, err.message);
    }
  }, delay);

  activeTimers.set(orderId.toString(), timeoutId);
};

// Clear auto-cancel timer (called when admin accepts or user cancels)
const clearAutoCancel = (orderId) => {
  const timeoutId = activeTimers.get(orderId.toString());
  if (timeoutId) {
    clearTimeout(timeoutId);
    activeTimers.delete(orderId.toString());
  }
};

// Safety net: sweep expired pending orders (called by cron and on startup)
const sweepExpiredOrders = async () => {
  try {
    const now = new Date();
    const expiredOrders = await Order.find({
      status: 'Pending',
      autoCancelAt: { $lte: now },
    });

    for (const order of expiredOrders) {
      order.status = 'Cancelled';
      order.cancelReason = 'Auto-cancelled: not accepted within time limit';
      order.statusHistory.push({ status: 'Cancelled', changedAt: now });
      await order.save();

      try {
        const io = getIO();
        io.to(`user:${order.user}`).to('admin').emit('order:autoCancelled', {
          orderId: order._id,
          tokenNumber: order.tokenNumber,
          reason: order.cancelReason,
        });
      } catch (socketErr) {
        // Socket might not be ready on startup
      }

      console.log(`Sweep: Order ${order._id} auto-cancelled`);
    }

    if (expiredOrders.length > 0) {
      console.log(`Sweep cancelled ${expiredOrders.length} expired order(s)`);
    }
  } catch (err) {
    console.error('Sweep expired orders error:', err.message);
  }
};

module.exports = { scheduleAutoCancel, clearAutoCancel, sweepExpiredOrders };
