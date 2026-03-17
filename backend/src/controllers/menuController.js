const prisma = require('../utils/prisma');

const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to retrieve menu items.' });
  }
};

const getMenuItemById = async (req, res) => {
  const itemId = parseInt(req.params.id);

  if (isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid item ID.' });
  }

  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    res.status(200).json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to retrieve menu item.' });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock, isAvailable, popular } = req.body;

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        category,
        imageUrl,
        stock,
        isAvailable,
        popular
      }
    });

    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Menu item with this name already exists.' });
    }
    res.status(500).json({ error: 'Failed to create menu item.' });
  }
};

const updateMenuItem = async (req, res) => {
  const itemId = parseInt(req.params.id);

  if (isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid item ID.' });
  }

  try {
    const { name, description, price, category, imageUrl, stock, isAvailable, popular } = req.body;

    const menuItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        name,
        description,
        price,
        category,
        imageUrl,
        stock,
        isAvailable,
        popular
      }
    });

    res.status(200).json({ success: true, menuItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    res.status(500).json({ error: 'Failed to update menu item.' });
  }
};

const deleteMenuItem = async (req, res) => {
  const itemId = parseInt(req.params.id);

  if (isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid item ID.' });
  }

  try {
    await prisma.menuItem.delete({
      where: { id: itemId }
    });

    res.status(200).json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    res.status(500).json({ error: 'Failed to delete menu item.' });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};