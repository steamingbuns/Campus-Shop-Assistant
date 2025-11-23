import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import productDetailsService from '../../services/productDetailsService';
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
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const data = await productDetailsService.getProductById(productId);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
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

  const handleWriteReview = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/review/${productId}`);
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
    const decimal = rating - fullStars;
    const hasPartialStar = decimal > 0;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className="star full">★</span>);
    }
    
    // Partial star with exact percentage
    if (hasPartialStar) {
      const percentage = Math.round(decimal * 100);
      stars.push(
        <span key="partial-star" className="star partial" style={{ '--fill-percent': `${percentage}%` }}>
          ★
        </span>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasPartialStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-star-${i}`} className="star empty">★</span>);
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
              <button 
                className="write-review-btn"
                onClick={handleWriteReview}
              >
                ✍️ Write a Review
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
      </div>
    </div>
  );
};

export default ItemView;
