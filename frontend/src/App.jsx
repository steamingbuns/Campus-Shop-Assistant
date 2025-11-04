import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MarketPlace from './pages/MarketPlace';
import ItemView from './pages/ItemView';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SellerDashboard from './pages/SellerDashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminConsole/AdminDashboard';
import Review from './pages/Review';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<MarketPlace />} />
            <Route path="/product/:productId" element={<ItemView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/review/:productId" element={<Review />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
