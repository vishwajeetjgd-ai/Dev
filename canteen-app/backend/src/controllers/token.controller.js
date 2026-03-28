const asyncHandler = require('../utils/asyncHandler');
const { getCurrentServing, advanceServing, getQueueInfo } = require('../services/token.service');
const { getIO } = require('../config/socket');

// GET /api/tokens/current - Get current serving token
const getCurrentToken = asyncHandler(async (req, res) => {
  const currentServing = await getCurrentServing();
  res.json({ success: true, data: { currentServing } });
});

// PATCH /api/tokens/advance - Advance serving token (admin only)
const advanceToken = asyncHandler(async (req, res) => {
  const counter = await advanceServing();

  // Broadcast token update to all connected clients
  try {
    const io = getIO();
    io.emit('token:update', {
      currentServing: counter.currentServing,
      totalTokens: counter.lastTokenNumber,
    });
  } catch (err) {
    console.error('Socket emit failed:', err.message);
  }

  res.json({
    success: true,
    message: `Now serving token #${counter.currentServing}`,
    data: { currentServing: counter.currentServing, totalTokens: counter.lastTokenNumber },
  });
});

// GET /api/tokens/queue - Get queue info
const getQueue = asyncHandler(async (req, res) => {
  const queueInfo = await getQueueInfo();
  res.json({ success: true, data: queueInfo });
});

module.exports = { getCurrentToken, advanceToken, getQueue };
