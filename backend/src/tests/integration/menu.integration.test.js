/**
 * Integration Tests – Menu API Routes
 * Tests the full HTTP → route → controller → (mocked) DB path.
 */

// ── Mock Prisma shared util ────────────────────────────────────────────────────
jest.mock('../../utils/prisma', () => ({
  menuItem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// ── Mock Pusher so the app boots cleanly ──────────────────────────────────────
jest.mock('../../utils/pusher', () => ({
  sendOrderUpdate: jest.fn(),
  sendVendorOrderAlert: jest.fn(),
  broadcastStoreStatus: jest.fn(),
}));

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const prisma  = require('../../utils/prisma');

process.env.JWT_SECRET = 'menu-integration-secret';
process.env.PORT       = '0';

const app = require('../../../server');

// ── Helper: create auth header for a given role ────────────────────────────────
const makeAuthHeader = (role = 'CUSTOMER') => {
  const token = jwt.sign(
    { id: role === 'VENDOR' ? 99 : 1, email: `${role.toLowerCase()}@test.com`, role, name: role },
    'menu-integration-secret',
    { expiresIn: '1h' },
  );
  return `Bearer ${token}`;
};

const SAMPLE_ITEM = {
  id: 1,
  name: 'Masala Chai',
  description: 'Hot spiced tea',
  price: '20.00',
  category: 'Beverages',
  isAvailable: true,
  stock: 100,
  popular: false,
};

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════════
describe('GET /api/menu/items', () => {
  test('200 – returns available menu items (public route)', async () => {
    prisma.menuItem.findMany.mockResolvedValueOnce([SAMPLE_ITEM]);

    const res = await request(app).get('/api/menu/items');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Masala Chai');
  });

  test('500 – returns error on DB failure', async () => {
    prisma.menuItem.findMany.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app).get('/api/menu/items');
    expect(res.status).toBe(500);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('GET /api/menu/items/:id', () => {
  test('200 – returns a single item by id', async () => {
    prisma.menuItem.findUnique.mockResolvedValueOnce(SAMPLE_ITEM);

    const res = await request(app).get('/api/menu/items/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Masala Chai');
  });

  test('404 – item not found', async () => {
    prisma.menuItem.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/menu/items/999');
    expect(res.status).toBe(404);
  });

  test('400 – non-numeric id', async () => {
    const res = await request(app).get('/api/menu/items/abc');
    expect(res.status).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('POST /api/menu/items (vendor protected)', () => {
  test('401 – rejects request without auth token', async () => {
    const res = await request(app)
      .post('/api/menu/items')
      .send({ name: 'New Item', price: 50 });

    expect(res.status).toBe(401);
  });

  test('403 – rejects CUSTOMER trying to create item', async () => {
    const res = await request(app)
      .post('/api/menu/items')
      .set('Authorization', makeAuthHeader('CUSTOMER'))
      .send({ name: 'New Item', price: 50 });

    expect(res.status).toBe(403);
  });

  test('201 – VENDOR can create a menu item', async () => {
    prisma.menuItem.create.mockResolvedValueOnce(SAMPLE_ITEM);

    const res = await request(app)
      .post('/api/menu/items')
      .set('Authorization', makeAuthHeader('VENDOR'))
      .send({ name: 'Masala Chai', price: 20, category: 'Beverages', stock: 100 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('DELETE /api/menu/items/:id (vendor protected)', () => {
  test('403 – CUSTOMER cannot delete', async () => {
    const res = await request(app)
      .delete('/api/menu/items/1')
      .set('Authorization', makeAuthHeader('CUSTOMER'));

    expect(res.status).toBe(403);
  });

  test('200 – VENDOR can delete', async () => {
    prisma.menuItem.delete.mockResolvedValueOnce(SAMPLE_ITEM);

    const res = await request(app)
      .delete('/api/menu/items/1')
      .set('Authorization', makeAuthHeader('VENDOR'));

    expect(res.status).toBe(200);
  });
});
