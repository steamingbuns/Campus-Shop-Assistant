import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

describe('AuthContext', () => {
  let originalLocalStorage;
  let storageMock;

  beforeEach(() => {
    originalLocalStorage = global.localStorage;
    storageMock = mockLocalStorage();
    Object.defineProperty(global, 'localStorage', {
      value: storageMock,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  const renderAuth = () =>
    renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

  it('logs in and persists user/token', () => {
    const { result } = renderAuth();

    act(() => {
      result.current.login({ id: 1, name: 'Tester' }, 'token-123');
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(storageMock.setItem).toHaveBeenCalledWith(
      'campusShopUser',
      JSON.stringify({ id: 1, name: 'Tester' })
    );
    expect(storageMock.setItem).toHaveBeenCalledWith('campusShopToken', 'token-123');
  });

  it('logs out and clears storage', () => {
    const { result } = renderAuth();
    act(() => {
      result.current.login({ id: 1, name: 'Tester' }, 'token-123');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(storageMock.removeItem).toHaveBeenCalledWith('campusShopUser');
    expect(storageMock.removeItem).toHaveBeenCalledWith('campusShopToken');
    expect(storageMock.removeItem).toHaveBeenCalledWith('campusShopCart');
  });
});
