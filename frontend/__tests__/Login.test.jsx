import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../src/pages/Login/index.jsx';

const loginSpy = vi.fn();
const navigateSpy = vi.fn();

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({ login: loginSpy }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

const authServiceMock = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock('../src/services/authService', () => ({
  default: authServiceMock,
}));

describe('Login page', () => {
  let consoleSpy;

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    );

  beforeEach(() => {
    loginSpy.mockReset();
    navigateSpy.mockReset();
    authServiceMock.login.mockReset();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('validates empty fields', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText('Please fill in all fields')).toBeInTheDocument();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('submits and navigates on success', async () => {
    authServiceMock.login.mockResolvedValue({ user: { name: 'Test' }, token: 't' });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/campus.edu/i), { target: { value: 'user@campus.edu' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({ name: 'Test' }, 't');
      expect(navigateSpy).toHaveBeenCalledWith('/marketplace');
    });
  });

  it('shows error when auth fails', async () => {
    authServiceMock.login.mockRejectedValue(new Error('bad credentials'));
    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/campus.edu/i), { target: { value: 'user@campus.edu' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/bad credentials/i)).toBeInTheDocument();
  });
});