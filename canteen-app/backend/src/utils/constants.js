// User roles
const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
};

// Order status values
const ORDER_STATUS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  CANCELLED: 'Cancelled',
};

// Valid status transitions: current status -> allowed next statuses
const STATUS_TRANSITIONS = {
  Pending: ['Accepted', 'Cancelled'],
  Accepted: ['Preparing', 'Cancelled'],
  Preparing: ['Ready', 'Cancelled'],
  Ready: [],       // terminal state
  Cancelled: [],   // terminal state
};

// Coupon types
const COUPON_TYPES = {
  FLAT: 'flat',
  PERCENTAGE: 'percentage',
};

// Menu categories
const CATEGORIES = ['snacks', 'beverages', 'meals', 'desserts', 'combo'];

module.exports = { ROLES, ORDER_STATUS, STATUS_TRANSITIONS, COUPON_TYPES, CATEGORIES };
