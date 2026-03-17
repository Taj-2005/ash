/**
 * Unit Tests – menuController.js
 * Mocks the shared Prisma instance from src/utils/prisma.js
 */

// ── Mock the shared prisma util ────────────────────────────────────────────────
jest.mock('../../utils/prisma', () => ({
  menuItem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../../utils/prisma');
const {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../../controllers/menuController');

// Helper: minimal res mock
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const SAMPLE_ITEM = {
  id: 1,
  name: 'Samosa',
  description: 'Crispy fried pastry',
  price: '15.00',
  category: 'Snacks',
  imageUrl: null,
  stock: 50,
  isAvailable: true,
  popular: true,
};

// ══════════════════════════════════════════════════════════════════════════════
describe('Menu Controller – getAllMenuItems', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns list of available items', async () => {
    prisma.menuItem.findMany.mockResolvedValueOnce([SAMPLE_ITEM]);

    const req = {};
    const res = mockRes();

    await getAllMenuItems(req, res);

    expect(prisma.menuItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isAvailable: true } }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([SAMPLE_ITEM]);
  });

  test('returns 500 on DB error', async () => {
    prisma.menuItem.findMany.mockRejectedValueOnce(new Error('DB error'));

    const req = {};
    const res = mockRes();

    await getAllMenuItems(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('Menu Controller – getMenuItemById', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 for non-numeric id', async () => {
    const req = { params: { id: 'abc' } };
    const res = mockRes();

    await getMenuItemById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 404 when item not found', async () => {
    prisma.menuItem.findUnique.mockResolvedValueOnce(null);

    const req = { params: { id: '99' } };
    const res = mockRes();

    await getMenuItemById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns item when found', async () => {
    prisma.menuItem.findUnique.mockResolvedValueOnce(SAMPLE_ITEM);

    const req = { params: { id: '1' } };
    const res = mockRes();

    await getMenuItemById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(SAMPLE_ITEM);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('Menu Controller – createMenuItem', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates a menu item and returns 201', async () => {
    prisma.menuItem.create.mockResolvedValueOnce(SAMPLE_ITEM);

    const req = {
      body: {
        name: 'Samosa',
        description: 'Crispy fried pastry',
        price: 15,
        category: 'Snacks',
        stock: 50,
        isAvailable: true,
        popular: true,
      },
    };
    const res = mockRes();

    await createMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  test('returns 400 on duplicate name (P2002)', async () => {
    const err = new Error('Unique constraint failed');
    err.code = 'P2002';
    prisma.menuItem.create.mockRejectedValueOnce(err);

    const req = { body: { name: 'Samosa', price: 15 } };
    const res = mockRes();

    await createMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('Menu Controller – updateMenuItem', () => {
  beforeEach(() => jest.clearAllMocks());

  test('updates and returns 200', async () => {
    prisma.menuItem.update.mockResolvedValueOnce({ ...SAMPLE_ITEM, name: 'Updated Samosa' });

    const req = { params: { id: '1' }, body: { name: 'Updated Samosa' } };
    const res = mockRes();

    await updateMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('returns 404 when item not found (P2025)', async () => {
    const err = new Error('Record not found');
    err.code = 'P2025';
    prisma.menuItem.update.mockRejectedValueOnce(err);

    const req = { params: { id: '99' }, body: { name: 'Ghost' } };
    const res = mockRes();

    await updateMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('Menu Controller – deleteMenuItem', () => {
  beforeEach(() => jest.clearAllMocks());

  test('deletes and returns 200', async () => {
    prisma.menuItem.delete.mockResolvedValueOnce(SAMPLE_ITEM);

    const req = { params: { id: '1' } };
    const res = mockRes();

    await deleteMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('returns 400 for non-numeric id', async () => {
    const req = { params: { id: 'xyz' } };
    const res = mockRes();

    await deleteMenuItem(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
