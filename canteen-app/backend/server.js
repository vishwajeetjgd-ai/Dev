require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
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
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Global middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
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

const PORT = process.env.PORT || 5000;

// Connect to DB, seed data, start cron jobs, then listen
connectDB().then(async () => {
  // Seed admin user and sample menu items
  await seedAdmin();
  await seedMenu();

  // Run initial sweep for any orders that expired while server was down
  await sweepExpiredOrders();

  // Cron job: sweep expired pending orders every 5 minutes (safety net)
  cron.schedule('*/5 * * * *', async () => {
    await sweepExpiredOrders();
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
});
