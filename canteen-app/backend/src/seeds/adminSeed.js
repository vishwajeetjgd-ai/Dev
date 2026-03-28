const User = require('../models/User');

// Seed admin user on startup (idempotent - skips if admin exists)
const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@canteen.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Delete existing admin and re-create to ensure password is hashed correctly
    await User.deleteOne({ email, role: 'admin' });

    await User.create({
      name: 'Canteen Admin',
      email,
      password,
      role: 'admin',
      welcomeCouponAssigned: true,
    });

    console.log('Admin user seeded successfully');
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

module.exports = { seedAdmin };
