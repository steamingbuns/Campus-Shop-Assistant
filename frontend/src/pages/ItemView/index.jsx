import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';
import userService from '../../services/userService';
import './ItemView.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80';

function ItemView() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isLoggedIn, token } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      setError(null);

      try {
        const [productData, reviewData] = await Promise.all([
          productService.getProduct(productId),
          productService.getProductReviews(productId),
        ]);

        if (!isMounted) return;

        const normalizedProduct = {
          ...productData,
          price: Number(productData?.price ?? 0),
          stock: Number(productData?.stock ?? 0),
          rating: Number(productData?.rating?.average ?? productData?.rating ?? 0),
          ratingCount: Number(productData?.rating?.count ?? productData?.reviewCount ?? 0),
          category: productData?.category || productData?.categoryName || 'Marketplace',
          images: (productData?.images || []).map((image) => image.url),
          seller: {
            name: productData?.seller?.name || 'Campus Seller',
            email: productData?.seller?.email || 'seller@example.com',
            phoneNumber: productData?.seller?.phoneNumber || productData?.seller?.phone || 'N/A',
            rating: Number(
              productData?.seller?.rating ?? productData?.ratings ?? productData?.rating?.average ?? 4.5
            ),
            totalSales: productData?.seller?.totalSales ?? productData?.sellerSales ?? 0,
            joinDate: productData?.seller?.joinDate ?? productData?.createdAt,
          },
        };

        setProduct(normalizedProduct);
        setReviews(reviewData?.reviews || []);
        setQuantity(1);
        setActiveImage(0);
      } catch (err) {
        console.error('Failed to load product', err);
        if (isMounted) {
          setError(err.message || 'Unable to load product information.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, location.state?.reviewSubmitted]);

  useEffect(() => {
    const checkEligibility = async () => {
      // Reset on product change
      setCanReview(false);

      if (isLoggedIn && productId && token) {
        try {
          const response = await userService.checkReviewEligibility(productId, token);
          setCanReview(response.eligible);
        } catch (error) {
          console.error("Failed to check review eligibility", error);
          setCanReview(false); // Ensure it's false on error
        }
      }
    };

    checkEligibility();
  }, [isLoggedIn, productId, token]);

  const productImages = useMemo(() => {
    if (!product?.images || product.images.length === 0) {
      return [FALLBACK_IMAGE];
    }
    return product.images;
  }, [product]);

  const formatPrice = useMemo(
    () => (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ',
    []
  );

  const renderStars = (rating) => {
    const stars = [];
    const safeRating = Number.isFinite(rating) ? rating : 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i += 1) {
      stars.push(
        <span key={`star-${i}`} className="star full">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="star half">
          ★
        </span>
      );
    }

    for (let i = 0; i < emptyStars; i += 1) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ☆
        </span>
      );
    }

    return <>{stars}</>;
  };

  const handleProtectedAction = (callback) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    callback();
  };

  const productPayload = product
    ? {
        id: product.id,
        name: product.name,
        price: product.price,
        image: productImages[0],
      }
    : null;

  const handleAddToCart = () =>
    handleProtectedAction(() => {
      if (!productPayload) return;
      addToCart(productPayload, quantity);
      alert(
        `${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart!`
      );
    });

  const handleBuyNow = () =>
    handleProtectedAction(() => {
      if (!productPayload) return;
      addToCart(productPayload, quantity);
      navigate('/cart');
    });

  const handleWriteReview = () =>
    handleProtectedAction(() => {
      navigate(`/review/${productId}`);
    });

  const handleQuantityChange = (event) => {
    const value = Number.parseInt(event.target.value, 10);
    if (!Number.isInteger(value)) return;
    if (value >= 1 && value <= (product?.stock ?? 1)) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(product?.stock ?? current + 1, current + 1)
    );
  };

  if (loading) {
    return (
      <div className="item-view">
        <div className="container loading">
          <div className="loading-spinner" />
          <p>Loading product information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-view">
        <div className="container error">
          <h2>Unable to load product</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="btn-primary"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="item-view">
        <div className="container error">
          <h2>Product Not Found</h2>
          <p>Sorry, we could not find the product you were looking for.</p>
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="btn-primary"
          >
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
          <span
            onClick={() =>
              navigate(`/marketplace?category=${encodeURIComponent(product.category)}`)
            }
          >
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </span>{' '}
          &gt;
          <span className="current">{product.name}</span>
        </div>

        <div className="product-container">
          <div className="product-gallery">
            <div className="main-image">
              <img src={productImages[activeImage]} alt={product.name} />
            </div>
            <div className="thumbnail-container">
              {productImages.map((image, index) => (
                <div
                  key={image}
                  className={`thumbnail ${
                    activeImage === index ? 'active' : ''
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating">
              {renderStars(product.rating)}
              <span className="rating-text">
                {product.rating.toFixed(1)} ({product.ratingCount} reviews)
              </span>
            </div>

            <div className="product-price">
              <span className="current-price">{formatPrice(product.price)}</span>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description || 'Product description is coming soon.'}</p>
            </div>

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
                      <span className="seller-rating-text">
                        {Number(product.seller.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="seller-stats">
                  <div className="seller-stat-item">
                    <span className="stat-label">Total Sales:</span>
                    <span className="stat-value">
                      {product.seller.totalSales
                        ? product.seller.totalSales.toLocaleString()
                        : '—'}
                    </span>
                  </div>
                  <div className="seller-stat-item">
                    <span className="stat-label">Member Since:</span>
                    <span className="stat-value">
                      {product.seller.joinDate
                        ? new Date(product.seller.joinDate).toLocaleDateString(
                            'en-US',
                            { year: 'numeric', month: 'short' }
                          )
                        : '—'}
                    </span>
                  </div>
                </div>
                <div className="seller-contact">
                  <div className="contact-item">
                    <i className="contact-icon">📧</i>
                    <span>{product.seller.email}</span>
                  </div>
                  <div className="contact-item">
                    <i className="contact-icon">📞</i>
                    <span>{product.seller.phoneNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="stock-info">
              <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                {product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : 'Out of Stock'}
              </span>
            </div>

            <div className="quantity-selector">
              <span>Quantity:</span>
              <div className="quantity-controls">
                <button
                  type="button"
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
                  type="button"
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
                type="button"
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Add to Cart
              </button>
              <button
                type="button"
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
              >
                Buy Now
              </button>
              {canReview && (
                <button
                  type="button"
                  className="write-review-btn"
                  onClick={handleWriteReview}
                >
                  ✍️ Write a Review
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Customer Reviews</h2>

          <div className="review-summary">
            <div className="average-rating">
              <span className="large-rating">{product.rating.toFixed(1)}</span>
              <div className="stars-container">
                {renderStars(product.rating)}
                <p>{product.ratingCount} reviews</p>
              </div>
            </div>

            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((review) => review.rating === star).length;
                const percentage = product.ratingCount
                  ? (count / product.ratingCount) * 100
                  : 0;
                return (
                  <div key={star} className="rating-bar-item">
                    <span className="rating-label">{star} ★</span>
                    <div className="rating-bar-container">
                      <div
                        className="rating-bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-user">
                      {review.userName || `User #${review.userId}`}
                    </div>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                    <div className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="review-comment">
                    {review.comment || 'No comment provided.'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemView;
