require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorMiddleware = require('./src/middlewares/error.middleware');
const { seedAdmin } = require('./src/seeds/adminSeed');
const { seedMenu } = require('./src/seeds/menuSeed');
const { sweepExpiredOrders } = require('./src/services/autoCancelTimer');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const menuRoutes = require('./src/routes/menu.routes');
const orderRoutes = require('./src/routes/order.routes');
const couponRoutes = require('./src/routes/coupon.routes');
const tokenRoutes = require('./src/routes/token.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();

// Global middlewares
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// DB connection (cached for serverless - connects once per cold start)
let isConnected = false;
const ensureDBConnected = async () => {
  if (!isConnected) {
    await connectDB();
    await seedAdmin();
    await seedMenu();
    await sweepExpiredOrders();
    isConnected = true;
  }
};

// For Vercel serverless: ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDBConnected();
    next();
  } catch (err) {
    next(err);
  }
});

// API Routes (registered after DB middleware)
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (must be last middleware)
app.use(errorMiddleware);

const isVercel = process.env.VERCEL === '1';

if (!isVercel) {
  // Local development: use Socket.IO and cron jobs
  const { initSocket } = require('./src/config/socket');
  const cron = require('node-cron');

  const server = http.createServer(app);
  initSocket(server);

  const PORT = process.env.PORT || 5000;

  connectDB().then(async () => {
    await seedAdmin();
    await seedMenu();
    await sweepExpiredOrders();
    isConnected = true;

    cron.schedule('*/5 * * * *', async () => {
      await sweepExpiredOrders();
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  });
}

// Export for Vercel serverless
module.exports = app;
