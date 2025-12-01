import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import InventoryManagement from '../src/pages/SellerDashboard/InventoryManagement';
import productDetailsService from '../src/services/productDetailsService';
import { AuthProvider } from '../src/contexts/AuthContext';

vi.mock('../src/services/productDetailsService', () => ({
  default: {
    getSellerInventory: vi.fn(),
    getCategories: vi.fn(),
    createProduct: vi.fn(),
    deleteProduct: vi.fn(),
    updateProduct: vi.fn(),
  }
}));

const mockInventory = [
  { id: 1, name: 'Item 1', category: 'Books', price: 10, stock: 5, lowStockThreshold: 2, description: 'Desc' },
];

function renderWithAuth(ui) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
}

describe('InventoryManagement', () => {
  beforeEach(() => {
    localStorage.setItem('campusShopUser', JSON.stringify({ role: 'seller' }));
    localStorage.setItem('campusShopToken', 'test-token');
    vi.clearAllMocks();
    productDetailsService.getSellerInventory.mockResolvedValue(mockInventory);
    productDetailsService.getCategories.mockResolvedValue([{ name: 'Books' }]);
  });
  
  afterEach(() => {
    localStorage.clear();
  });

  it('renders inventory list', async () => {
    renderWithAuth(<InventoryManagement />);
    expect(await screen.findByText('Item 1')).toBeInTheDocument();
  });

  it('opens add modal and validates fields', async () => {
    renderWithAuth(<InventoryManagement />);
    await screen.findByText('Item 1');

    fireEvent.click(screen.getByRole('button', { name: /Add New Item/i }));

    fireEvent.change(await screen.findByLabelText(/Product Name/i), { target: { value: 'New Item' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/Initial Stock/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/Low Stock Threshold/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Books' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Desc' } });

    productDetailsService.createProduct.mockResolvedValue({
      id: 2,
      name: 'New Item',
      category: 'Books',
      price: 12,
      stock: 3,
      lowStockThreshold: 1,
      description: 'Desc',
    });

    const addForm = screen.getByRole('button', { name: /Add Item/i }).closest('form');
    fireEvent.submit(addForm);

    await waitFor(() => {
      expect(productDetailsService.createProduct).toHaveBeenCalled();
    });
  });
});
