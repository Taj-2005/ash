/**
 * Unit Tests – CartContext
 */

import React from "react";
import { render, act, screen, cleanup } from "@testing-library/react";
import { CartProvider, useCart } from "@/contexts/CartContext";

// Clear localStorage and unmount after every test so cart state never leaks
beforeEach(() => {
  localStorage.clear();
});
afterEach(cleanup);

// ── Helper: component that exposes cart state for assertions ──────────────────
const CartConsumer = () => {
  const { cart, addToCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  return (
    <div>
      <span data-testid="count">{getCartCount()}</span>
      <span data-testid="total">{getCartTotal()}</span>
      {cart.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.name} × {item.quantity}
        </div>
      ))}
      <button onClick={() => addToCart({ id: 1, name: "Samosa", price: "15.00" })}>
        Add Samosa
      </button>
      <button onClick={() => addToCart({ id: 2, name: "Chai", price: "10.00" })}>
        Add Chai
      </button>
      <button onClick={() => updateQuantity(1, 3)}>Set Samosa qty=3</button>
      <button onClick={() => updateQuantity(1, 0)}>Remove Samosa</button>
      <button onClick={() => clearCart()}>Clear</button>
    </div>
  );
};

const renderWithCart = () =>
  render(
    <CartProvider>
      <CartConsumer />
    </CartProvider>
  );

// ═════════════════════════════════════════════════════════════════════════════
describe("CartContext", () => {
  test("starts with an empty cart", () => {
    renderWithCart();
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("total").textContent).toBe("0");
  });

  test("addToCart adds an item with quantity 1", () => {
    renderWithCart();
    act(() => screen.getByText("Add Samosa").click());
    expect(screen.getByTestId("item-1")).toHaveTextContent("Samosa × 1");
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  test("addToCart increments quantity when same item is added again", () => {
    renderWithCart();
    act(() => screen.getByText("Add Samosa").click()); // qty → 1
    act(() => screen.getByText("Add Samosa").click()); // qty → 2
    expect(screen.getByTestId("item-1")).toHaveTextContent("Samosa × 2");
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  test("updateQuantity changes item quantity", () => {
    renderWithCart();
    act(() => screen.getByText("Add Samosa").click());
    act(() => screen.getByText("Set Samosa qty=3").click());
    expect(screen.getByTestId("item-1")).toHaveTextContent("Samosa × 3");
  });

  test("updateQuantity with 0 removes the item from cart", () => {
    renderWithCart();
    act(() => screen.getByText("Add Samosa").click());
    act(() => screen.getByText("Remove Samosa").click());
    expect(screen.queryByTestId("item-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  test("getCartTotal calculates correctly with multiple items", () => {
    renderWithCart();
    act(() => screen.getByText("Add Samosa").click()); // ₹15
    act(() => screen.getByText("Add Chai").click());   // ₹10
    expect(parseFloat(screen.getByTestId("total").textContent)).toBeCloseTo(25);
  });

  test("clearCart empties the cart", () => {
    renderWithCart();
    act(() => screen.getByText("Add Samosa").click());
    act(() => screen.getByText("Add Chai").click());
    act(() => screen.getByText("Clear").click());
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
});