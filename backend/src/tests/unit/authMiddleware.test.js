/**
 * Unit Tests – auth middleware (authenticateToken & checkVendorRole)
 */

const jwt = require('jsonwebtoken');
const { authenticateToken, checkVendorRole } = require('../../middleware/auth');

process.env.JWT_SECRET = 'test-secret';

// Helper: create a valid JWT for testing
const makeToken = (payload) => jwt.sign(payload, 'test-secret', { expiresIn: '1h' });

// Helper: minimal res mock
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ══════════════════════════════════════════════════════════════════════════════
describe('authenticateToken middleware', () => {
  test('calls next() and sets req.user for a valid token', () => {
    const token = makeToken({ id: 1, email: 'a@a.com', role: 'CUSTOMER', name: 'A' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 1, email: 'a@a.com', role: 'CUSTOMER' });
  });

  test('returns 401 when no Authorization header is present', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 for an expired / tampered token', () => {
    const req = { headers: { authorization: 'Bearer invalidtoken123' } };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization header is malformed', () => {
    const req = { headers: { authorization: 'Basictoken123' } };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('checkVendorRole middleware', () => {
  test('calls next() for VENDOR role', () => {
    const req = { user: { id: 10, role: 'VENDOR' } };
    const res = mockRes();
    const next = jest.fn();

    checkVendorRole(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('returns 403 for CUSTOMER role', () => {
    const req = { user: { id: 5, role: 'CUSTOMER' } };
    const res = mockRes();
    const next = jest.fn();

    checkVendorRole(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 500 when req.user is missing', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    checkVendorRole(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
