/**
 * Unit Tests – MenuCard component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// ── Mocks ──────────────────────────────────────────────────────────────────────
const mockAddToCart = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockPush = jest.fn();

// Default: authenticated user
const mockUseAuth = jest.fn(() => ({ user: { id: 1, name: "Alice", role: "CUSTOMER" } }));
const mockUseCart = jest.fn(() => ({
  cart: [],
  addToCart: mockAddToCart,
  updateQuantity: mockUpdateQuantity,
}));

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ── Sample item fixture ────────────────────────────────────────────────────────
const ITEM = {
  id: 1,
  name: "Samosa",
  description: "Crispy fried pastry with potato filling",
  price: "15.00",
  category: "Snacks",
  imageUrl: null,
  isAvailable: true,
  popular: true,
  stock: 50,
};

// Import component AFTER all mocks are declared
const MenuCard = require("@/components/ui/MenuCard").default;

beforeEach(() => {
  jest.clearAllMocks();
  // Reset to authenticated user by default
  mockUseAuth.mockReturnValue({ user: { id: 1, name: "Alice", role: "CUSTOMER" } });
  mockUseCart.mockReturnValue({ cart: [], addToCart: mockAddToCart, updateQuantity: mockUpdateQuantity });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("MenuCard – rendering", () => {
  test("renders item name and price", () => {
    render(<MenuCard item={ITEM} />);
    expect(screen.getByText("Samosa")).toBeInTheDocument();
    expect(screen.getByText("₹15")).toBeInTheDocument();
  });

  test("renders description", () => {
    render(<MenuCard item={ITEM} />);
    expect(screen.getByText(/crispy fried pastry/i)).toBeInTheDocument();
  });

  test('shows "Popular" badge for popular items', () => {
    render(<MenuCard item={ITEM} />);
    expect(screen.getByText("Popular")).toBeInTheDocument();
  });

  test('does NOT show "Popular" badge for non-popular items', () => {
    render(<MenuCard item={{ ...ITEM, popular: false }} />);
    expect(screen.queryByText("Popular")).not.toBeInTheDocument();
  });

  test('shows "Add" button when item is not in cart', () => {
    render(<MenuCard item={ITEM} />);
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("MenuCard – interactions (authenticated user)", () => {
  test("calls addToCart when Add button is clicked", () => {
    render(<MenuCard item={ITEM} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(mockAddToCart).toHaveBeenCalledWith(ITEM);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("MenuCard – unauthenticated user", () => {
  test("redirects to login when unauthenticated user clicks Add", () => {
    // Override via the top-level mock function — no module reset needed
    mockUseAuth.mockReturnValue({ user: null });

    render(<MenuCard item={ITEM} />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
    expect(mockAddToCart).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe("MenuCard – quantity controls (item already in cart)", () => {
  test("shows quantity controls when item is in cart", () => {
    mockUseCart.mockReturnValue({
      cart: [{ id: 1, name: "Samosa", quantity: 2 }],
      addToCart: mockAddToCart,
      updateQuantity: mockUpdateQuantity,
    });

    render(<MenuCard item={ITEM} />);

    // When quantity > 0, the +/- stepper replaces the Add button
    expect(screen.queryByRole("button", { name: /^add$/i })).not.toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("calls updateQuantity with +1 when increment clicked", () => {
    mockUseCart.mockReturnValue({
      cart: [{ id: 1, name: "Samosa", quantity: 2 }],
      addToCart: mockAddToCart,
      updateQuantity: mockUpdateQuantity,
    });

    render(<MenuCard item={ITEM} />);
    // The + button
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]); // last button is +
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);
  });
});
