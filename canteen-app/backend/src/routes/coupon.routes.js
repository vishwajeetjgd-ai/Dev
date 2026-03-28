const express = require('express');
const { body } = require('express-validator');
const {
  createCoupon, getCoupons, updateCoupon,
  deleteCoupon, validateCoupon, getMyCoupons,
} = require('../controllers/coupon.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

// All coupon routes require authentication
router.use(authenticate);

// Student/Teacher routes
router.post('/validate', authorize('student', 'teacher'), validateCoupon);
router.get('/my', authorize('student', 'teacher'), getMyCoupons);

// Admin-only routes
router.post(
  '/',
  authorize('admin'),
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('type').isIn(['flat', 'percentage']).withMessage('Type must be flat or percentage'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be positive'),
    body('validFrom').notEmpty().withMessage('Valid from date is required'),
    body('validUntil').notEmpty().withMessage('Valid until date is required'),
  ],
  createCoupon
);
router.get('/', authorize('admin'), getCoupons);
router.put('/:id', authorize('admin'), updateCoupon);
router.delete('/:id', authorize('admin'), deleteCoupon);

module.exports = router;
