const User = require('../models/User');

// Seed admin user on startup (idempotent - skips if admin exists)
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists, skipping seed');
      return;
    }

    await User.create({
      name: 'Canteen Admin',
      email: process.env.ADMIN_EMAIL || 'admin@canteen.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      welcomeCouponAssigned: true, // admin doesn't get welcome coupon
    });

    console.log('Admin user seeded successfully');
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

module.exports = { seedAdmin };
