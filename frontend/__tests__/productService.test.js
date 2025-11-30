import productService from '../src/services/productService.js';
import api from '../src/services/api.js';

vi.mock('../src/services/api.js', () => ({
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
    Object.values(api).forEach((fn) => fn.mockReset());
  });

  it('lists products with normalized filters', async () => {
    api.get.mockResolvedValue({ items: [] });
    await productService.listProducts({ search: 'pen', categoryId: 2, empty: undefined });
    expect(api.get).toHaveBeenCalledWith('/product', { params: { q: 'pen', categoryId: 2 } });
  });

  it('fetches categories and single product assets', async () => {
    await productService.getCategories();
    await productService.getProduct(1);
    await productService.getProductImages(1);
    await productService.getProductReviews(1);

    expect(api.get).toHaveBeenCalledWith('/product/categories');
    expect(api.get).toHaveBeenCalledWith('/product/1');
    expect(api.get).toHaveBeenCalledWith('/product/1/images');
    expect(api.get).toHaveBeenCalledWith('/product/1/reviews');
  });

  it('creates, updates, and deletes products with token', async () => {
    await productService.createProduct({ name: 'Pen' }, 'tok');
    expect(api.post).toHaveBeenCalledWith('/product', { data: { name: 'Pen' }, token: 'tok' });

    await productService.updateProduct(1, { price: 5 }, 'tok');
    expect(api.put).toHaveBeenCalledWith('/product/1', { data: { price: 5 }, token: 'tok' });

    await productService.deleteProduct(1, 'tok');
    expect(api.delete).toHaveBeenCalledWith('/product/1', { token: 'tok' });
  });

  it('handles stock changes and reviews', async () => {
    await productService.updateProductStock(1, { stock: 4 }, 'tok');
    expect(api.patch).toHaveBeenCalledWith('/product/1/stock', { data: { stock: 4 }, token: 'tok' });

    await productService.decreaseProductStock([{ productId: 1, quantity: 2 }], 'tok');
    expect(api.patch).toHaveBeenCalledWith('/product/stock/decrease', { data: { items: [{ productId: 1, quantity: 2 }] }, token: 'tok' });

    await productService.addReview(1, { rating: 5 }, 'tok');
    expect(api.post).toHaveBeenCalledWith('/product/1/reviews', { data: { rating: 5 }, token: 'tok' });

    await productService.updateReview(1, 3, { rating: 4 }, 'tok');
    expect(api.put).toHaveBeenCalledWith('/product/1/reviews/3', { data: { rating: 4 }, token: 'tok' });

    await productService.deleteReview(1, 3, 'tok');
    expect(api.delete).toHaveBeenCalledWith('/product/1/reviews/3', { token: 'tok' });
  });
});
