/**
 * Unit Tests – authController.js
 * Mocks PrismaClient and bcryptjs so no real DB is needed.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── Mock Prisma ────────────────────────────────────────────────────────────────
jest.mock('@prisma/client', () => {
  const mUser = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ user: mUser })) };
});

// ── Mock bcryptjs ──────────────────────────────────────────────────────────────
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// ── Pull in controller AFTER mocks are set up ──────────────────────────────────
const { signup, login } = require('../../controllers/authController');
const { PrismaClient } = require('@prisma/client');

// Helper: create minimal Express-style req/res mocks
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

process.env.JWT_SECRET = 'test-secret';

// ══════════════════════════════════════════════════════════════════════════════
describe('Auth Controller – signup', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  test('returns 400 when email is missing', async () => {
    const req = { body: { password: 'pass123' } };
    const res = mockRes();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  test('returns 400 when password is missing', async () => {
    const req = { body: { email: 'test@test.com' } };
    const res = mockRes();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 when user already exists', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: 'dup@test.com' });

    const req = { body: { name: 'Dup', email: 'dup@test.com', password: 'pass' } };
    const res = mockRes();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'User already exists' }),
    );
  });

  test('creates user and returns token on success', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce('hashed_password');
    prisma.user.create.mockResolvedValueOnce({
      id: 1,
      name: 'Alice',
      email: 'alice@test.com',
      role: 'CUSTOMER',
    });

    const req = { body: { name: 'Alice', email: 'alice@test.com', password: 'secret' } };
    const res = mockRes();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('token');
    expect(payload.user.email).toBe('alice@test.com');
  });

  test('returns 500 on unexpected Prisma error', async () => {
    prisma.user.findUnique.mockRejectedValueOnce(new Error('DB down'));

    const req = { body: { name: 'X', email: 'x@test.com', password: 'pass' } };
    const res = mockRes();

    await signup(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('Auth Controller – login', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  test('returns 400 when credentials missing', async () => {
    const req = { body: {} };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 401 when user not found', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    const req = { body: { email: 'nobody@test.com', password: 'pass' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid credentials' }),
    );
  });

  test('returns 401 when password is wrong', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 2,
      email: 'bob@test.com',
      passwordHash: 'hashed',
      role: 'CUSTOMER',
      name: 'Bob',
    });
    bcrypt.compare.mockResolvedValueOnce(false);

    const req = { body: { email: 'bob@test.com', password: 'wrong' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns token and user on successful login', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 3,
      email: 'carol@test.com',
      passwordHash: 'hashed',
      role: 'CUSTOMER',
      name: 'Carol',
    });
    bcrypt.compare.mockResolvedValueOnce(true);

    const req = { body: { email: 'carol@test.com', password: 'correct' } };
    const res = mockRes();

    await login(req, res);

    // status() should NOT have been called (defaults to 200)
    expect(res.status).not.toHaveBeenCalledWith(401);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('token');
    expect(payload.user.email).toBe('carol@test.com');

    // Verify JWT is valid
    const decoded = jwt.verify(payload.token, 'test-secret');
    expect(decoded.id).toBe(3);
    expect(decoded.role).toBe('CUSTOMER');
  });
});
