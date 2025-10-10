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
import SellerDashboard from './pages/SellerDashboard';
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
            <Route path="/cart" element={<Cart />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
