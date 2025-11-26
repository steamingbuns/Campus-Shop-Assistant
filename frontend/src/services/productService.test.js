import { describe, expect, it, vi, beforeEach } from 'vitest';
import productService from './productService';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists products with filters', async () => {
    api.get.mockResolvedValue({ items: [] });
    await productService.listProducts({ search: 'pen', page: 2 });
    expect(api.get).toHaveBeenCalledWith('/product', expect.objectContaining({ params: expect.any(Object) }));
  });

  it('gets product details', async () => {
    api.get.mockResolvedValue({ id: 1 });
    await productService.getProduct(1);
    expect(api.get).toHaveBeenCalledWith('/product/1');
  });

  it('creates product with token', async () => {
    api.post.mockResolvedValue({ id: 10 });
    await productService.createProduct({ name: 'New' }, 'token123');
    expect(api.post).toHaveBeenCalledWith('/product', { data: { name: 'New' }, token: 'token123' });
  });
});
