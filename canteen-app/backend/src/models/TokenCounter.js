const mongoose = require('mongoose');

// One document per day - tracks token numbers and current serving position
const tokenCounterSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true, // 'YYYY-MM-DD' format, one per day
  },
  lastTokenNumber: {
    type: Number,
    default: 0,
  },
  currentServing: {
    type: Number,
    default: 0,
  },
});

tokenCounterSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('TokenCounter', tokenCounterSchema);
