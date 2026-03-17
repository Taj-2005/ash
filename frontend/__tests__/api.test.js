/**
 * Unit Tests – lib/api.js
 * Mocks global fetch to verify request construction.
 */

// ── Mock localStorage ──────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, value) => { store[key] = String(value); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// ── Mock fetch ─────────────────────────────────────────────────────────────────
global.fetch = jest.fn();

const { api } = require("@/lib/api");

const mockFetchOk = (data) =>
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });

const mockFetchErr = (status, error) =>
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error }),
    status,
  });

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// ══════════════════════════════════════════════════════════════════════════════
describe("api.login", () => {
  test("sends POST to /auth/login with correct body", async () => {
    mockFetchOk({ token: "tok123", user: { id: 1 } });

    const result = await api.login("user@test.com", "pass123");

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toMatch(/\/auth\/login$/);
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toMatchObject({
      email: "user@test.com",
      password: "pass123",
    });
    expect(result.token).toBe("tok123");
  });

  test("throws when server returns error", async () => {
    mockFetchErr(401, "Invalid credentials");
    await expect(api.login("bad@test.com", "wrong")).rejects.toThrow("Invalid credentials");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("api.signup", () => {
  test("sends POST to /auth/signup", async () => {
    mockFetchOk({ token: "newTok", user: { id: 2 } });

    await api.signup("Bob", "bob@test.com", "pass", "9999999999");

    const [url, opts] = fetch.mock.calls[0];
    expect(url).toMatch(/\/auth\/signup$/);
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.name).toBe("Bob");
    expect(body.email).toBe("bob@test.com");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("api.getMenuItems", () => {
  test("sends GET to /menu/items", async () => {
    mockFetchOk([{ id: 1, name: "Samosa" }]);

    const result = await api.getMenuItems();

    const [url, opts] = fetch.mock.calls[0];
    expect(url).toMatch(/\/menu\/items$/);
    expect(opts.method).toBeUndefined(); // default GET
    expect(result).toEqual([{ id: 1, name: "Samosa" }]);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("api – Authorization header", () => {
  test("attaches Bearer token from localStorage when present", async () => {
    localStorageMock.getItem.mockReturnValueOnce("my-jwt-token");
    mockFetchOk([]);

    await api.getMenuItems();

    const [, opts] = fetch.mock.calls[0];
    expect(opts.headers["Authorization"]).toBe("Bearer my-jwt-token");
  });

  test("omits Authorization header when no token", async () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    mockFetchOk([]);

    await api.getMenuItems();

    const [, opts] = fetch.mock.calls[0];
    expect(opts.headers["Authorization"]).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("api.updateOrderStatus", () => {
  test("sends PUT to /orders/:id", async () => {
    mockFetchOk({ success: true });

    await api.updateOrderStatus(42, "READY");

    const [url, opts] = fetch.mock.calls[0];
    expect(url).toMatch(/\/orders\/42$/);
    expect(opts.method).toBe("PUT");
    expect(JSON.parse(opts.body)).toMatchObject({ status: "READY" });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("api.getOrder", () => {
  test("sends GET to /orders/:id", async () => {
    mockFetchOk({ order: { id: 5 } });
    await api.getOrder(5);
    expect(fetch.mock.calls[0][0]).toMatch(/\/orders\/5$/);
  });
});
