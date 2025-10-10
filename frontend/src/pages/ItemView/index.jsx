import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './ItemView.css';

const ItemView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch product data based on productId
  useEffect(() => {
    // In a real application, you would fetch from your API
    // This is a mock implementation
    setIsLoading(true);
    
    // Simulate API fetch with setTimeout
    setTimeout(() => {
      // Mock product data
      const mockProduct = {
        id: Number(productId) || 1,
        name: 'Campus Textbook: Advanced Programming',
        price: 175000,
        description: `This comprehensive textbook is essential for computer science students. 
                     It covers advanced programming concepts including algorithms, data structures, 
                     and software design patterns. Perfect for both classroom use and self-study.`,
        specifications: [
          { name: 'Author', value: 'Prof. Jane Smith' },
          { name: 'Publisher', value: 'Campus Press' },
          { name: 'Pages', value: '450' },
          { name: 'Publication Year', value: '2025' },
          { name: 'Language', value: 'English' },
          { name: 'ISBN', value: '978-1-234567-89-0' }
        ],
        stock: 15,
        rating: 4.5,
        reviewCount: 3,
        images: [
          'https://via.placeholder.com/600x600?text=Textbook+Main',
          'https://via.placeholder.com/600x600?text=Textbook+Cover',
          'https://via.placeholder.com/600x600?text=Textbook+Back',
          'https://via.placeholder.com/600x600?text=Textbook+Inside'
        ],
        reviews: [
          { id: 1, user: 'Student123', rating: 5, comment: 'Excellent textbook with clear explanations and good examples.', date: '2025-09-15' },
          { id: 2, user: 'CSMajor', rating: 4, comment: 'Very helpful for my advanced programming course.', date: '2025-09-10' },
          { id: 3, user: 'CodeLearner', rating: 5, comment: 'The exercises are challenging but valuable.', date: '2025-09-05' }
        ],
        category: 'books',
        shipping: {
          free: true,
          estimatedDelivery: '1-3 days'
        },
        seller: {
          name: 'Campus Bookstore',
          email: 'bookstore@campus.edu',
          phone: '+1 (555) 123-4567',
          rating: 4.8,
          totalSales: 1250,
          responseTime: '< 2 hours',
          joinDate: '2023-01-15'
        }
      };
      
      setProduct(mockProduct);
      setIsLoading(false);
    }, 500);
  }, [productId]);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    addToCart(product, quantity);
    alert(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product?.stock) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Format price with VND currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className="star full">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half-star" className="star half">★</span>);
    }
    
    // Calculate empty stars correctly: 5 total - full stars - (1 if half star exists, 0 otherwise)
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-star-${i}`} className="star empty">☆</span>);
    }
    
    return <>{stars}</>;
  };

  if (isLoading) {
    return (
      <div className="item-view">
        <div className="container loading">
          <div className="loading-spinner"></div>
          <p>Loading product information...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="item-view">
        <div className="container error">
          <h2>Product Not Found</h2>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <button onClick={() => navigate('/marketplace')} className="btn-primary">
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="item-view">
      <div className="container">
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>Home</span> &gt; 
          <span onClick={() => navigate('/marketplace')}>Marketplace</span> &gt; 
          <span onClick={() => navigate(`/marketplace?category=${product.category}`)}>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span> &gt; 
          <span className="current">{product.name}</span>
        </div>
        
        <div className="product-container">
          {/* Left Column: Image Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img src={product.images[activeImage]} alt={product.name} />
            </div>
            <div className="thumbnail-container">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column: Product Details */}
          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              {renderStars(product.rating)}
              <span className="rating-text">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
            
            <div className="product-price">
              <span className="current-price">{formatPrice(product.price)}</span>
            </div>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-specifications">
              <h3>Specifications</h3>
              <div className="specifications-list">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="spec-item">
                    <span className="spec-name">{spec.name}:</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="shipping-info">
              <h3>Shipping Information</h3>
              <p>
                <i className="shipping-icon">🚚</i>
                {product.shipping.free ? 'Free Shipping' : 'Standard Shipping Fee Applies'}
              </p>
              <p>
                <i className="delivery-icon">📦</i>
                Estimated Delivery: {product.shipping.estimatedDelivery}
              </p>
            </div>

            {/* Seller Information */}
            <div className="seller-info">
              <h3>Seller Information</h3>
              <div className="seller-details">
                <div className="seller-header">
                  <div className="seller-avatar">
                    <span className="avatar-icon">🏪</span>
                  </div>
                  <div className="seller-main-info">
                    <h4 className="seller-name">{product.seller.name}</h4>
                    <div className="seller-rating">
                      {renderStars(product.seller.rating)}
                      <span className="seller-rating-text">{product.seller.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="seller-stats">
                  <div className="seller-stat-item">
                    <span className="stat-label">Total Sales:</span>
                    <span className="stat-value">{product.seller.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="seller-stat-item">
                    <span className="stat-label">Response Time:</span>
                    <span className="stat-value">{product.seller.responseTime}</span>
                  </div>
                  <div className="seller-stat-item">
                    <span className="stat-label">Member Since:</span>
                    <span className="stat-value">{new Date(product.seller.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <div className="seller-contact">
                  <div className="contact-item">
                    <i className="contact-icon">📧</i>
                    <span>{product.seller.email}</span>
                  </div>
                  <div className="contact-item">
                    <i className="contact-icon">📞</i>
                    <span>{product.seller.phone}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="stock-info">
              <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="quantity-selector">
              <span>Quantity:</span>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn" 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={handleQuantityChange} 
                  min="1" 
                  max={product.stock}
                />
                <button 
                  className="quantity-btn" 
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Add to Cart
              </button>
              <button 
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          
          <div className="review-summary">
            <div className="average-rating">
              <span className="large-rating">{product.rating.toFixed(1)}</span>
              <div className="stars-container">
                {renderStars(product.rating)}
                <p>{product.reviewCount} reviews</p>
              </div>
            </div>
            
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map(star => {
                // Calculate number of reviews for each star rating
                const reviewsForStar = product.reviews.filter(r => r.rating === star).length;
                const percentage = product.reviewCount > 0 ? (reviewsForStar / product.reviewCount) * 100 : 0;
                
                return (
                  <div key={star} className="rating-bar-item">
                    <span className="rating-label">{star} ★</span>
                    <div className="rating-bar-container">
                      <div 
                        className="rating-bar-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="rating-count">{reviewsForStar}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="reviews-list">
            {product.reviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-user">{review.user}</div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                  <div className="review-date">{review.date}</div>
                </div>
                <div className="review-comment">{review.comment}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Related Products Section */}
        <div className="related-products">
          <h2>You May Also Like</h2>
          <div className="related-products-grid">
            {/* Placeholder Related Products */}
            {[
              {
                id: 101,
                name: 'Data Structures & Algorithms',
                price: 165000,
                rating: 4.7,
                image: 'https://via.placeholder.com/250x250?text=Data+Structures',
                category: 'books'
              },
              {
                id: 102,
                name: 'Software Engineering Fundamentals',
                price: 180000,
                rating: 4.6,
                image: 'https://via.placeholder.com/250x250?text=Software+Engineering',
                category: 'books'
              },
              {
                id: 103,
                name: 'Web Development Essentials',
                price: 145000,
                rating: 4.8,
                image: 'https://via.placeholder.com/250x250?text=Web+Dev',
                category: 'books'
              },
              {
                id: 104,
                name: 'Computer Networks Guide',
                price: 170000,
                rating: 4.5,
                image: 'https://via.placeholder.com/250x250?text=Networks',
                category: 'books'
              }
            ].map(relatedProduct => (
              <div 
                key={relatedProduct.id} 
                className="related-product-card"
                onClick={() => navigate(`/item/${relatedProduct.id}`)}
              >
                <div className="related-product-image">
                  <img src={relatedProduct.image} alt={relatedProduct.name} />
                </div>
                <div className="related-product-info">
                  <h3 className="related-product-name">{relatedProduct.name}</h3>
                  <div className="related-product-rating">
                    {renderStars(relatedProduct.rating)}
                    <span className="related-rating-text">{relatedProduct.rating.toFixed(1)}</span>
                  </div>
                  <div className="related-product-price">
                    <span className="related-current-price">{formatPrice(relatedProduct.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemView;
