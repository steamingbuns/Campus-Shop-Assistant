import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MarketPlace from './pages/MarketPlace';
import Cart from './pages/Cart';
import ViewReports from './pages/Admin/ViewReports';
import TransactionsLog from './pages/Admin/TransactionsLog'
import './App.css'
import { TransactionProvider } from './contexts/TransactionContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<MarketPlace />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/viewreports" element={<ViewReports />} />
            <Route path='/txlog' element={<TransactionsLog />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
