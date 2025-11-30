import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Chatbot from '../src/components/Chatbot/index.jsx';

const sendMessageMock = vi.fn();
const addToCartMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../src/services/chatbotService', () => ({
  sendMessage: (...args) => sendMessageMock(...args),
  formatPrice: (price) => `₫${price}`,
  getInitialMessage: () => ({ sender: 'bot', text: 'Hi there!' }),
  createUserMessage: (text) => ({ sender: 'user', text }),
  createBotMessage: (text, metadata = {}) => ({ sender: 'bot', text, metadata }),
  quickActions: [{ label: 'Help', type: 'guide', message: 'Guide message' }],
}));

vi.mock('../src/contexts/CartContext', () => ({
  useCart: () => ({ addToCart: addToCartMock }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../src/assets/chatbot.jpg', () => ({ default: 'avatar.jpg' }), { virtual: true });

describe('Chatbot component', () => {
  let consoleSpy;

  beforeEach(() => {
    sendMessageMock.mockReset();
    addToCartMock.mockReset();
    navigateMock.mockReset();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const openChatbot = () => {
    render(
      <MemoryRouter>
        <Chatbot />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button'));
  };

  it('shows initial message and bot reply after sending', async () => {
    sendMessageMock.mockResolvedValue({ responseText: 'Bot reply', metadata: {} });
    openChatbot();

    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Ask me anything/i);
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.submit(input.closest('form'));

    expect(await screen.findByText('hello')).toBeInTheDocument();
    expect(await screen.findByText('Bot reply')).toBeInTheDocument();
  });

  it('shows fallback message when send fails', async () => {
    sendMessageMock.mockRejectedValue(new Error('network'));
    openChatbot();

    const input = screen.getByPlaceholderText(/Ask me anything/i);
    fireEvent.change(input, { target: { value: 'fail' } });
    fireEvent.submit(input.closest('form'));

    expect(
      await screen.findByText(/trouble connecting/i)
    ).toBeInTheDocument();
  });
});
