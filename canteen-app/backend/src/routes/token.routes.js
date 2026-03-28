const express = require('express');
const { getCurrentToken, advanceToken, getQueue } = require('../controllers/token.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

// Public routes
router.get('/current', getCurrentToken);
router.get('/queue', getQueue);

// Admin-only route
router.patch('/advance', authenticate, authorize('admin'), advanceToken);

module.exports = router;
