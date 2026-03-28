const MenuItem = require('../models/MenuItem');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/menu - Get all menu items (public)
const getMenuItems = asyncHandler(async (req, res) => {
  const { category, search, available } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (available !== undefined) filter.isAvailable = available === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

  res.json({
    success: true,
    data: { items, count: items.length },
  });
});

// GET /api/menu/:id - Get single menu item
const getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Menu item not found');

  res.json({ success: true, data: { item } });
});

// POST /api/menu - Create menu item (admin only)
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, price, image, category, isAvailable, prepTime, description } = req.body;

  const item = await MenuItem.create({
    name, price, image, category, isAvailable, prepTime, description,
  });

  res.status(201).json({
    success: true,
    message: 'Menu item created',
    data: { item },
  });
});

// PUT /api/menu/:id - Update menu item (admin only)
const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) throw new ApiError(404, 'Menu item not found');

  res.json({
    success: true,
    message: 'Menu item updated',
    data: { item },
  });
});

// DELETE /api/menu/:id - Delete menu item (admin only)
const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, 'Menu item not found');

  res.json({ success: true, message: 'Menu item deleted' });
});

// PATCH /api/menu/:id/availability - Toggle availability (admin only)
const toggleAvailability = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Menu item not found');

  item.isAvailable = !item.isAvailable;
  await item.save();

  res.json({
    success: true,
    message: `Item ${item.isAvailable ? 'available' : 'unavailable'}`,
    data: { item },
  });
});

module.exports = { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability };
