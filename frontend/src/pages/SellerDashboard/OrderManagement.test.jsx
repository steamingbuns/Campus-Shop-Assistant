import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '../../contexts/AuthContext';
import OrderManagement from './OrderManagement';
import ordersInventoryService from '../../services/ordersInventoryService';

vi.mock('../../services/ordersInventoryService', () => ({
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
  beforeEach(() => {
    vi.clearAllMocks();
    ordersInventoryService.getSellerOrders.mockResolvedValue(mockOrders);
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
