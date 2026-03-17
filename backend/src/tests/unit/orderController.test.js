/**
 * Unit Tests – orderController.js
 */

jest.mock('@prisma/client', () => {
  const mOrder = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mOrderItem = { deleteMany: jest.fn() };
  return { PrismaClient: jest.fn(() => ({ order: mOrder, orderItem: mOrderItem })) };
});

const { PrismaClient } = require('@prisma/client');
const {
  createCheckout,
  confirmOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require('../../controllers/orderController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const AUTHED_CUSTOMER = { id: 1, role: 'CUSTOMER', name: 'Alice', email: 'alice@test.com' };
const AUTHED_VENDOR   = { id: 99, role: 'VENDOR',   name: 'Vendor', email: 'v@test.com' };

const SAMPLE_ORDER = {
  id: 10,
  userId: 1,
  total: '120.00',
  status: 'PENDING',
  items: [
    { id: 1, menuItemId: 5, quantity: 2, menuItem: { name: 'Samosa', price: '15.00' } },
  ],
  user: { id: 1, name: 'Alice', email: 'alice@test.com' },
};

// ══════════════════════════════════════════════════════════════════════════════
describe('createCheckout', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 401 when user is not authenticated', async () => {
    const req = { body: { totalAmount: 100, items: [{}] } };
    const res = mockRes();
    await createCheckout(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 400 when items array is empty', async () => {
    const req = { user: AUTHED_CUSTOMER, body: { totalAmount: 100, items: [] } };
    const res = mockRes();
    await createCheckout(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when totalAmount is invalid', async () => {
    const req = { user: AUTHED_CUSTOMER, body: { totalAmount: 0, items: [{ id: 1 }] } };
    const res = mockRes();
    await createCheckout(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns mock orderId on valid input', async () => {
    const req = {
      user: AUTHED_CUSTOMER,
      body: { totalAmount: 120, items: [{ menuItemId: 5, quantity: 2 }] },
    };
    const res = mockRes();
    await createCheckout(req, res);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.orderId).toMatch(/^order_/);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('confirmOrder', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
    global.sendOrderUpdate = jest.fn();
    global.sendVendorOrderAlert = jest.fn();
  });

  test('returns 401 without auth', async () => {
    const req = { body: { totalAmount: 100, items: [{}] } };
    const res = mockRes();
    await confirmOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('creates order and returns 201', async () => {
    prisma.order.create.mockResolvedValueOnce(SAMPLE_ORDER);

    const req = {
      user: AUTHED_CUSTOMER,
      body: {
        totalAmount: 120,
        items: [{ menuItemId: 5, quantity: 2 }],
        paymentId: 'pay_test_123',
      },
    };
    const res = mockRes();
    await confirmOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('getAllOrders', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  test('returns 401 without auth', async () => {
    const req = {};
    const res = mockRes();
    await getAllOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('customer sees only their own orders', async () => {
    prisma.order.findMany.mockResolvedValueOnce([SAMPLE_ORDER]);
    const req = { user: AUTHED_CUSTOMER };
    const res = mockRes();
    await getAllOrders(req, res);
    // Should have called findMany with userId filter
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } }),
    );
  });

  test('vendor sees all orders', async () => {
    prisma.order.findMany.mockResolvedValueOnce([SAMPLE_ORDER]);
    const req = { user: AUTHED_VENDOR };
    const res = mockRes();
    await getAllOrders(req, res);
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('updateOrderStatus', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
    global.sendOrderUpdate = jest.fn();
  });

  test('returns 400 for invalid status value', async () => {
    const req = { user: AUTHED_VENDOR, params: { id: '10' }, body: { status: 'INVALID' } };
    const res = mockRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 404 when order not found', async () => {
    prisma.order.findUnique.mockResolvedValueOnce(null);
    const req = { user: AUTHED_VENDOR, params: { id: '999' }, body: { status: 'READY' } };
    const res = mockRes();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updates status successfully', async () => {
    prisma.order.findUnique.mockResolvedValueOnce(SAMPLE_ORDER);
    prisma.order.update.mockResolvedValueOnce({ ...SAMPLE_ORDER, status: 'READY' });

    const req = { user: AUTHED_VENDOR, params: { id: '10' }, body: { status: 'READY' } };
    const res = mockRes();
    await updateOrderStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
