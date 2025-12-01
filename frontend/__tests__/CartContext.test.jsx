import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../src/contexts/CartContext.jsx';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds items and aggregates quantities', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart({ id: 1, name: 'Pen', price: 2 }, 1));
    act(() => result.current.addToCart({ id: 1, name: 'Pen', price: 2 }, 2));

    expect(result.current.cartItems).toEqual([{ id: 1, name: 'Pen', price: 2, quantity: 3 }]);
    expect(result.current.getCartTotal()).toBe(6);
    expect(result.current.getCartItemsCount()).toBe(3);
  });

  it('updates quantity and removes when zero or below', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart({ id: 2, name: 'Book', price: 10 }, 1));
    act(() => result.current.updateQuantity(2, 5));
    expect(result.current.cartItems[0].quantity).toBe(5);

    act(() => result.current.updateQuantity(2, 0));
    expect(result.current.cartItems).toHaveLength(0);
  });
});
