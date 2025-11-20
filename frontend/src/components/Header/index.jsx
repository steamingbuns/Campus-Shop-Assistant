import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import authService from '../../services/authService';
import './Header.css';

function Header() {
  const { isLoggedIn, user, token, logout } = useAuth();
  const { getCartItemsCount } = useCart();

  const handleLogout = async () => {
    try {
      await authService.logout(token);
      logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Still logout locally even if API call fails
      logout();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>Campus Shop Assistant</h1>
        </div>

        <div className="header-right">
          <nav className="header-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/marketplace" className="nav-link">Marketplace</Link>
            {isLoggedIn && (
              <Link to="/seller-dashboard" className="nav-link sell-link">
                Sell
              </Link>
            )}
            {isLoggedIn && (
              <Link to="/cart" className="nav-link cart-link">
                Cart ({getCartItemsCount()})
              </Link>
            )}
          </nav>

          <div className="header-actions">
            {isLoggedIn ? (
              <div className="user-menu">
                <span className="user-welcome">
                  Hello, <Link to="/profile" className="user-name-link">{user?.name || 'User'}</Link>!
                </span>
                <button onClick={handleLogout} className="btn-secondary">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-primary">Login</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;