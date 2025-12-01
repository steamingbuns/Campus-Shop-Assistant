import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogIn, Search, ShoppingCart, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import authService from '../../services/authService';

function Header() {
  const { isLoggedIn, user, token, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout(token);
      logout();
    } catch (err) {
      console.error('Logout error:', err);
      logout();
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = searchTerm.trim();
    if (!trimmedQuery) {
      navigate('/marketplace');
      return;
    }
    navigate(`/marketplace?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-lg shadow-blue-100/60 backdrop-blur-xl">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-500 text-white shadow-lg shadow-blue-200">
              <Sparkles className="h-5 w-5 transition duration-200 group-hover:rotate-3 group-hover:scale-105" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">Campus</p>
              <p className="text-lg font-bold text-slate-900">Shop Assistant</p>
            </div>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center gap-2 rounded-xl border border-white/60 bg-white/80 px-3 py-2 shadow-sm shadow-blue-50 ring-1 ring-transparent transition focus-within:ring-2 focus-within:ring-blue-500/60 md:flex"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search products, categories, or sellers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Search
            </button>
          </form>

          <nav className="ml-auto hidden items-center gap-2 text-sm font-semibold text-slate-700 sm:flex">
            <Link
              to="/marketplace"
              className="rounded-lg px-3 py-2 transition hover:bg-blue-50 hover:text-blue-600"
            >
              Marketplace
            </Link>
            {isLoggedIn && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="rounded-lg px-3 py-2 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Admin
              </Link>
            )}
            <Link
              to="/seller-dashboard"
              className="rounded-lg px-3 py-2 transition hover:bg-blue-50 hover:text-blue-600"
            >
              Sell
            </Link>
            {isLoggedIn && (
              <Link
                to="/profile"
                className="rounded-lg px-3 py-2 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Profile
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/marketplace"
              className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-100 hover:text-blue-600 sm:hidden"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>

            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-100 hover:text-blue-600"
            >
              <ShoppingCart className="h-5 w-5" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-100 hover:text-blue-600"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="hidden items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm shadow-blue-50 ring-1 ring-white/60 transition hover:-translate-y-[1px] hover:shadow-md hover:ring-blue-100 sm:flex"
                >
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="max-w-[120px] truncate">{user?.name || 'Your Profile'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden items-center gap-2 rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-100 hover:text-blue-600 sm:flex"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
