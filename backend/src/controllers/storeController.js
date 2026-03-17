const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStoreStatus = async (req, res) => {
  try {
    console.log('[Store] 📖 Fetching store status...');

    const storeSetting = await prisma.storeSetting.findUnique({
      where: { key: 'isOpen' },
    });

    if (storeSetting) {
      const isOpen = storeSetting.value === 'true';
      console.log('[Store] ✅ Status from DB:', isOpen);
      return res.json({ isOpen });
    }

    console.log('[Store] ℹ️ No status found, creating default (open)');
    await prisma.storeSetting.create({
      data: {
        key: 'isOpen',
        value: 'true',
      },
    });

    res.json({ isOpen: true });
  } catch (error) {
    console.error('[Store] ❌ Error getting status:', error);
    res.json({ isOpen: true });
  }
};

const updateStoreStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Only vendors can update store status' });
    }

    const { isOpen } = req.body;

    if (typeof isOpen !== 'boolean') {
      return res.status(400).json({ error: 'isOpen must be a boolean' });
    }

    console.log(`[Store] 🔄 Updating status to: ${isOpen ? 'OPEN' : 'CLOSED'}`);

    // upsert result intentionally not stored — we only need side effects
    await prisma.storeSetting.upsert({
      where: { key: 'isOpen' },
      update: { value: isOpen.toString() },
      create: {
        key: 'isOpen',
        value: isOpen.toString(),
      },
    });

    console.log('[Store] ✅ Status updated successfully');

    if (global.broadcastStoreStatus) {
      await global.broadcastStoreStatus(isOpen);
      console.log('[Store] 📡 Broadcasted status change to all users');
    }

    res.json({
      success: true,
      isOpen,
      message: `Store is now ${isOpen ? 'OPEN' : 'CLOSED'}`,
    });
  } catch (error) {
    console.error('[Store] ❌ Error updating status:', error);
    res.status(500).json({ error: 'Failed to update store status' });
  }
};

module.exports = {
  getStoreStatus,
  updateStoreStatus,
};
