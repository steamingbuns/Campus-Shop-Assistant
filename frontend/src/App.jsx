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
import ChatbotPage from './pages/ChatbotPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="relative min-h-screen bg-gradient-to-b from-blue-50 via-zinc-50 to-white text-slate-900 antialiased">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-gradient-to-b from-white/60 via-white/30 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -left-32 top-32 h-64 w-64 rounded-full bg-blue-200/40 blur-[120px]" />
            <div className="pointer-events-none absolute -right-16 top-12 h-52 w-52 rounded-full bg-blue-300/50 blur-[120px]" />

            <Header />
            <main className="relative z-10 mx-auto flex max-w-6xl flex-col px-4 pb-16 pt-28 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<MarketPlace />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/product/:productId" element={<ItemView />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/seller-dashboard" element={<SellerDashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/review/:productId" element={<Review />} />
                </Route>
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
