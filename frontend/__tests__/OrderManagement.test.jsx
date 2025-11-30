import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '../src/contexts/AuthContext';
import OrderManagement from '../src/pages/SellerDashboard/OrderManagement';
import ordersInventoryService from '../src/services/ordersInventoryService';

vi.mock('../src/services/ordersInventoryService', () => ({
  default: {
    getSellerOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

const mockOrders = [
  {
    id: 1,
    customer: 'Customer A',
    email: 'a@example.com',
    date: new Date().toISOString(),
    items: [{ name: 'Item1', quantity: 1 }],
    total: 20,
    status: 'pending',
  },
];

function renderWithAuth(ui) {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
}

describe('OrderManagement', () => {
  let consoleSpy;

  beforeEach(() => {
    localStorage.setItem('campusShopUser', JSON.stringify({ role: 'seller' }));
    localStorage.setItem('campusShopToken', 'test-token');
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    ordersInventoryService.getSellerOrders.mockResolvedValue(mockOrders);
  });
  
  afterEach(() => {
    localStorage.clear();
    consoleSpy.mockRestore();
  });

  it('renders orders when fetch succeeds', async () => {
    renderWithAuth(<OrderManagement />);
    expect(await screen.findByText('Customer A')).toBeInTheDocument();
    expect(ordersInventoryService.getSellerOrders).toHaveBeenCalled();
  });

  it('shows error when unauthorized', async () => {
    ordersInventoryService.getSellerOrders.mockRejectedValue({ status: 401 });
    renderWithAuth(<OrderManagement />);
    expect(await screen.findByText(/Unauthorized/i)).toBeInTheDocument();
  });
});
