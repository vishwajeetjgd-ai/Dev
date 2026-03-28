const express = require('express');
const { getDashboard, getAllOrders } = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);

module.exports = router;
