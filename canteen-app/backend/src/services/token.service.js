const TokenCounter = require('../models/TokenCounter');

// Get today's date string in YYYY-MM-DD format
const getTodayString = () => new Date().toISOString().slice(0, 10);

// Atomically get next token number for today (auto-increments, resets daily)
const getNextToken = async () => {
  const today = getTodayString();
  const counter = await TokenCounter.findOneAndUpdate(
    { date: today },
    { $inc: { lastTokenNumber: 1 } },
    { upsert: true, new: true }
  );
  return counter.lastTokenNumber;
};

// Get current serving token for today
const getCurrentServing = async () => {
  const today = getTodayString();
  const counter = await TokenCounter.findOne({ date: today });
  return counter ? counter.currentServing : 0;
};

// Advance the serving token by 1
const advanceServing = async () => {
  const today = getTodayString();
  const counter = await TokenCounter.findOneAndUpdate(
    { date: today },
    { $inc: { currentServing: 1 } },
    { upsert: true, new: true }
  );
  return counter;
};

// Get queue info for today
const getQueueInfo = async () => {
  const today = getTodayString();
  const counter = await TokenCounter.findOne({ date: today });

  if (!counter) {
    return { currentServing: 0, totalTokens: 0, queueLength: 0 };
  }

  return {
    currentServing: counter.currentServing,
    totalTokens: counter.lastTokenNumber,
    queueLength: Math.max(0, counter.lastTokenNumber - counter.currentServing),
  };
};

module.exports = { getNextToken, getCurrentServing, advanceServing, getQueueInfo };
