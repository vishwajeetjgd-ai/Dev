const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: { type: String, required: true },     // snapshot at order time
    price: { type: Number, required: true },     // snapshot at order time
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [arr => arr.length > 0, 'Order must have at least one item'],
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    couponUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Cancelled'],
      default: 'Pending',
    },
    cancelReason: {
      type: String,
      default: '',
    },
    statusHistory: [statusHistorySchema],
    estimatedPrepTime: {
      type: Number, // max prep time among items in minutes
    },
    autoCancelAt: {
      type: Date, // set to now + 30 min on creation
    },
  },
  { timestamps: true }
);

// Indexes for common queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ tokenNumber: 1, createdAt: -1 });
orderSchema.index({ autoCancelAt: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
