import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../src/components/ProtectedRoute.jsx';

let authState = { isLoggedIn: false, loading: false };

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

describe('ProtectedRoute', () => {
  const renderWithRouter = () =>
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<div>Private Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

  it('shows loading state while auth is loading', () => {
    authState = { isLoggedIn: false, loading: true };
    renderWithRouter();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('renders outlet when authenticated', () => {
    authState = { isLoggedIn: true, loading: false };
    renderWithRouter();
    expect(screen.getByText('Private Content')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    authState = { isLoggedIn: false, loading: false };
    renderWithRouter();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
