import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-core.js'; // <-- thêm .js cho chắc chắn
import { useCart } from '../../contexts/CartContext';
import './MarketPlace.css';

export default function MarketPlace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // ✅ Hooks phải ở bên trong component
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;                       // nếu AuthContext của bạn có user
  const isLoggedIn = auth?.isLoggedIn ?? !!user; // fallback nếu Context dùng isLoggedIn

  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  // Dữ liệu demo
  const products = useMemo(() => [
    { id: 1, name: 'Notebook A4', price: 15000, image: 'https://via.placeholder.com/200x200?text=Notebook', category: 'stationery' },
    { id: 2, name: 'Ballpoint Pen Set', price: 25000, image: 'https://via.placeholder.com/200x200?text=Pen+Set', category: 'stationery' },
    { id: 3, name: 'Campus T-Shirt', price: 120000, image: 'https://via.placeholder.com/200x200?text=T-Shirt', category: 'clothing' },
    { id: 4, name: 'Coffee Mug', price: 45000, image: 'https://via.placeholder.com/200x200?text=Coffee+Mug', category: 'accessories' },
    { id: 5, name: 'Textbook: Math 101', price: 250000, image: 'https://via.placeholder.com/200x200?text=Math+Book', category: 'books' },
    { id: 6, name: 'USB Flash Drive 32GB', price: 80000, image: 'https://via.placeholder.com/200x200?text=USB+Drive', category: 'electronics' }
  ], []);

  const categories = useMemo(() => [
    { id: 'all', name: 'All Items' },
    { id: 'stationery', name: 'Stationery' },
    { id: 'books', name: 'Books' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'accessories', name: 'Accessories' }
  ], []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const formatPrice = useMemo(() => (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + ' đ', []);

  return (
    <div className="marketplace">
      <div className="container">
        <h1>Campus Marketplace</h1>

        {/* Search */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Categories */}
        <div className="categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="products-container">
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} loading="lazy" />
                <h3>{product.name}</h3>
                <p className="price">{formatPrice(product.price)}</p>
                <button className="buy-btn" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <p>No products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Nút vào trang Admin – chỉ hiện với admin */}
      {user?.role === 'admin' && (
        <div className="admin-fab">
          <button onClick={() => navigate('/admin')} className="admin-fab-btn">
            Open Admin
          </button>
        </div>
      )}
    </div>
  );
}
