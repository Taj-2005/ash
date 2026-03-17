/**
 * Integration Tests – Auth API Routes
 *
 * Spins up the full Express app (mocking only Prisma so no real DB needed).
 * Tests that the HTTP layer + controller + middleware all wire together correctly.
 */

jest.mock('@prisma/client', () => {
  const mUser = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ user: mUser })) };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_pw'),
  compare: jest.fn(),
}));

const request  = require('supertest');
const bcrypt   = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

// Set env BEFORE requiring the app
process.env.JWT_SECRET  = 'integration-test-secret';
process.env.PORT        = '0'; // Let OS pick a free port

// Disable Pusher so it doesn't throw during test
jest.mock('../../utils/pusher', () => ({
  sendOrderUpdate: jest.fn(),
  sendVendorOrderAlert: jest.fn(),
  broadcastStoreStatus: jest.fn(),
}));

const app = require('../../../server');

let prisma;

beforeEach(() => {
  prisma = new PrismaClient();
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
describe('POST /api/auth/signup', () => {
  test('201 – creates a new user and returns a JWT', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null); // no duplicate
    prisma.user.create.mockResolvedValueOnce({
      id: 1,
      name: 'Alice',
      email: 'alice@uni.edu',
      role: 'CUSTOMER',
    });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice', email: 'alice@uni.edu', password: 'Pass1234' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('alice@uni.edu');
  });

  test('400 – rejects when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ password: 'Pass1234' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 – rejects duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: 'dup@uni.edu' });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Dup', email: 'dup@uni.edu', password: 'Pass1234' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('POST /api/auth/login', () => {
  test('200 – valid credentials returns token', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 2,
      name: 'Bob',
      email: 'bob@uni.edu',
      passwordHash: 'hashed_pw',
      role: 'CUSTOMER',
    });
    bcrypt.compare.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@uni.edu', password: 'correctpass' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('CUSTOMER');
  });

  test('401 – wrong password', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 3,
      email: 'carol@uni.edu',
      passwordHash: 'hashed_pw',
      role: 'CUSTOMER',
      name: 'Carol',
    });
    bcrypt.compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'carol@uni.edu', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  test('401 – user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@uni.edu', password: 'anypass' });

    expect(res.status).toBe(401);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('GET /api/status', () => {
  test('200 – health-check endpoint', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Backend');
  });
});
