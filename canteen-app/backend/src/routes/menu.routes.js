const express = require('express');
const { body } = require('express-validator');
const {
  getMenuItems, getMenuItem, createMenuItem,
  updateMenuItem, deleteMenuItem, toggleAvailability,
} = require('../controllers/menu.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

const menuValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['snacks', 'beverages', 'meals', 'desserts', 'combo']).withMessage('Invalid category'),
  body('prepTime').isInt({ min: 1 }).withMessage('Prep time must be at least 1 minute'),
];

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);

// Admin-only routes
router.post('/', authenticate, authorize('admin'), menuValidation, createMenuItem);
router.put('/:id', authenticate, authorize('admin'), updateMenuItem);
router.delete('/:id', authenticate, authorize('admin'), deleteMenuItem);
router.patch('/:id/availability', authenticate, authorize('admin'), toggleAvailability);

module.exports = router;
