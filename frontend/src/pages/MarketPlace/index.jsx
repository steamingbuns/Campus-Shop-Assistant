import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import productService from '../../services/productService';
import './MarketPlace.css';

const MarketPlace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories([{ id: 'all', name: 'All Items' }, ...data.categories]);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([
          { id: 'all', name: 'All Items' },
          { id: 1, name: 'Stationery' },
          { id: 2, name: 'Books' },
          { id: 3, name: 'Clothing' },
          { id: 4, name: 'Electronics' },
          { id: 5, name: 'Accessories' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryId = selectedCategory === 'all' ? null : selectedCategory;
        const filters = {
          search: searchQuery,
          categoryId,
        };
        const data = await productService.listProducts(filters);
        setProducts(data?.items ?? []);
      } catch (err) {
        setError(`Failed to fetch products. ${err.message || ''}`.trim());
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchProducts();
    }, 300); // Add a small debounce to avoid rapid API calls 

    return () => clearTimeout(debounceFetch);
  }, [searchQuery, selectedCategory]);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const formatPrice = useMemo(() => {
    return (price) => {
      return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };
  }, []);

  return (
    <div className="marketplace">
      <div className="container">
        <h1>Campus Marketplace</h1>

        <div className="search-section">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

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

        <div className="products-container">
          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <div className="no-products"><p>{error}</p></div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(product => (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <img 
                      src={product.image || 'https://via.placeholder.com/200x200?text=No+Image'} 
                      alt={product.name}
                      loading="lazy"
                    />
                    <h3>{product.name}</h3>
                    <p className="price">{formatPrice(product.price)}</p>
                    <button 
                      className="buy-btn"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="no-products">
                  <p>No products found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPlace;