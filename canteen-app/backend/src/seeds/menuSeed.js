const MenuItem = require('../models/MenuItem');

// Seed sample menu items in development (idempotent)
const seedMenu = async () => {
  try {
    const count = await MenuItem.countDocuments();
    if (count > 0) {
      console.log(`Menu already has ${count} items, skipping seed`);
      return;
    }

    const items = [
      {
        name: 'Samosa',
        price: 15,
        category: 'snacks',
        prepTime: 5,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        description: 'Crispy fried pastry with spiced potato filling',
      },
      {
        name: 'Veg Sandwich',
        price: 40,
        category: 'snacks',
        prepTime: 8,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
        description: 'Grilled sandwich with fresh vegetables and cheese',
      },
      {
        name: 'Masala Chai',
        price: 15,
        category: 'beverages',
        prepTime: 3,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
        description: 'Indian spiced tea with ginger and cardamom',
      },
      {
        name: 'Cold Coffee',
        price: 50,
        category: 'beverages',
        prepTime: 5,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        description: 'Chilled coffee blended with ice cream',
      },
      {
        name: 'Thali Meal',
        price: 80,
        category: 'meals',
        prepTime: 15,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        description: 'Full meal with roti, rice, dal, sabzi, and salad',
      },
      {
        name: 'Paneer Fried Rice',
        price: 70,
        category: 'meals',
        prepTime: 12,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        description: 'Fried rice with paneer cubes and vegetables',
      },
      {
        name: 'Gulab Jamun',
        price: 30,
        category: 'desserts',
        prepTime: 2,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1666190020955-1a0da6250537?w=400',
        description: 'Sweet milk dumplings soaked in sugar syrup',
      },
      {
        name: 'Combo Meal',
        price: 99,
        category: 'combo',
        prepTime: 15,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        description: 'Sandwich + Cold Coffee + Gulab Jamun - value deal!',
      },
      {
        name: 'Maggi Noodles',
        price: 30,
        category: 'snacks',
        prepTime: 8,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400',
        description: 'Classic Maggi noodles with extra veggies',
      },
      {
        name: 'Fresh Lime Soda',
        price: 25,
        category: 'beverages',
        prepTime: 3,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400',
        description: 'Refreshing lime soda - sweet or salty',
      },
    ];

    await MenuItem.insertMany(items);
    console.log(`${items.length} menu items seeded successfully`);
  } catch (error) {
    console.error('Error seeding menu:', error.message);
  }
};

module.exports = { seedMenu };
