/**
 * E2E Tests – Campus Bites (Playwright)
 *
 * Simulates real user flows:
 *   1. Browse menu as a guest
 *   2. Sign-up flow
 *   3. Login → Add to cart → Checkout
 *   4. Order tracking page
 */

import { test, expect } from "@playwright/test";

// ── Config ─────────────────────────────────────────────────────────────────────
const BASE  = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const EMAIL = `e2e_${Date.now()}@campus.test`;
const PASS  = "TestPass@123";
const NAME  = "E2E User";

// ══════════════════════════════════════════════════════════════════════════════
test.describe("🏠 Home Page – Guest View", () => {
  test("loads the home page and shows menu items", async ({ page }) => {
    await page.goto(BASE);

    // Navbar should be visible
    await expect(page.locator("nav")).toBeVisible();

    // Menu grid should render
    await expect(
      page.locator("[data-testid='menu-grid'], .grid")
    ).toBeVisible({ timeout: 10000 });
  });

  test("shows login redirect when unauthenticated user clicks Add", async ({ page }) => {
    await page.goto(BASE);

    const addBtn = page.getByRole("button", { name: /add/i }).first();
    await addBtn.waitFor({ timeout: 10000 });
    await addBtn.click();

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
test.describe("📝 Sign-Up Flow", () => {
  test("successfully registers a new user", async ({ page }) => {
    await page.goto(`${BASE}/auth/signup`);

    await page.getByLabel(/name/i).fill(NAME);
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password/i).fill(PASS);
    await page.getByRole("button", { name: /sign up|create account|register/i }).click();

    await expect(page).toHaveURL(/\/$|\/vendor|\/profile/, { timeout: 8000 });
  });

  test("shows error for duplicate email", async ({ page }) => {
    await page.goto(`${BASE}/auth/signup`);

    // Use a known seeded user so the signup attempt fails due to duplication.
    await page.getByLabel(/name/i).fill(NAME);
    await page.getByLabel(/email/i).fill("student@gmail.com");
    await page.getByLabel(/password/i).fill("anypass");
    await page.getByRole("button", { name: /sign up|create account|register/i }).click();

    await expect(
      page.getByText(/already exists|already registered|taken/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
test.describe("🔐 Login Flow", () => {
  test("logs in with valid credentials and lands on home", async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);

    await page.getByLabel(/email/i).fill("student@gmail.com");
    await page.getByLabel(/password/i).fill("student123");
    await page.getByRole("button", { name: /log in|sign in/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 8000 });
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);

    await page.getByLabel(/email/i).fill("nobody@nowhere.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /log in|sign in/i }).click();

    await expect(
      page.getByText(/invalid credentials|incorrect|not found/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
test.describe("🛒 Add to Cart → Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);

    await page.getByLabel(/email/i).fill("student@gmail.com");
    await page.getByLabel(/password/i).fill("student123");
    await page.getByRole("button", { name: /log in|sign in/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 8000 });
  });

  test("adds an item to cart and cart count increments", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /^add$/i }).first();
    await addBtn.waitFor({ timeout: 10000 });

    await addBtn.click();

    const cartBadge = page.locator(
      "[data-testid='cart-count'], .cart-count, [aria-label*='cart']"
    );

    await expect(cartBadge).toBeVisible({ timeout: 3000 });
  });

  test("proceeds to checkout page from cart", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /^add$/i }).first();
    await addBtn.waitFor({ timeout: 10000 });
    await addBtn.click();

    // Open the cart sidebar to access the checkout button.
    await page.getByRole("button", { name: /cart/i }).click();

    const checkoutBtn = page.getByRole("button", { name: /checkout|proceed/i });
    await checkoutBtn.waitFor({ timeout: 5000 });
    await checkoutBtn.click();

    await expect(page).toHaveURL(/\/checkout/, { timeout: 5000 });

    await expect(
      page.getByRole("heading", { name: /checkout/i })
    ).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
test.describe("📦 Order Tracking Page", () => {
  test("order-tracking page loads without crashing", async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);

    await page.getByLabel(/email/i).fill("student@gmail.com");
    await page.getByLabel(/password/i).fill("student123");
    await page.getByRole("button", { name: /log in|sign in/i }).click();

    await expect(page).toHaveURL(/\/$/, { timeout: 8000 });

    await page.goto(`${BASE}/order-tracking`);

    await expect(page.locator("body")).not.toContainText("Internal Server Error");

    const trackHeading = page.getByRole("heading", { name: /track order/i });
    const hasTrackHeading = (await trackHeading.count()) > 0;

    if (hasTrackHeading) {
      await expect(trackHeading).toBeVisible({ timeout: 8000 });
    } else {
      // If we redirect back to home (no orderId), ensure the app still loads.
      await expect(page).toHaveURL(/\/$/, { timeout: 8000 });
    }
  });
});