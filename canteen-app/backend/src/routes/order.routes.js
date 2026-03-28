const express = require('express');
const {
  placeOrder, getMyOrders, getActiveOrders,
  getOrder, cancelOrder, updateOrderStatus,
} = require('../controllers/order.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Student/Teacher routes
router.post('/', authorize('student', 'teacher'), placeOrder);
router.get('/', authorize('student', 'teacher'), getMyOrders);
router.get('/active', authorize('student', 'teacher'), getActiveOrders);

// Admin route - must be before /:id to avoid conflict
router.patch('/:id/status', authorize('admin'), updateOrderStatus);

// Shared routes
router.get('/:id', getOrder);
router.patch('/:id/cancel', authorize('student', 'teacher'), cancelOrder);

module.exports = router;
