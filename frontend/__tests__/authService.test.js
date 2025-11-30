import authService from '../src/services/authService.js';
import api from '../src/services/api.js';

vi.mock('../src/services/api.js', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    api.post.mockReset();
  });

  it('register posts to /users/register', async () => {
    api.post.mockResolvedValue({ ok: true });
    await authService.register({ email: 'a@b.com' });
    expect(api.post).toHaveBeenCalledWith('/users/register', { email: 'a@b.com' });
  });

  it('login posts credentials', async () => {
    api.post.mockResolvedValue({ token: 't' });
    await authService.login({ email: 'a@b.com', password: 'p' });
    expect(api.post).toHaveBeenCalledWith('/users/login', { email: 'a@b.com', password: 'p' });
  });

  it('logout passes token', async () => {
    api.post.mockResolvedValue({ ok: true });
    await authService.logout('token123');
    expect(api.post).toHaveBeenCalledWith('/users/logout', null, 'token123');
  });
});
