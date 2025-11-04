import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';
import './Review.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80';

function Review() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user, token } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const productImageSrc = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images[0].url;
    }
    if (product?.image) {
      return product.image;
    }
    return FALLBACK_IMAGE;
  }, [product]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getProduct(productId);
        setProduct(response);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        // Handle error (e.g., show a not found message)
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!reviewText.trim()) {
      newErrors.reviewText = 'Please write a review';
    } else if (reviewText.trim().length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const reviewData = {
      rating,
      comment: reviewText,
    };

    try {
      if (!token) {
        throw new Error('Authentication token not found.');
      }
      await productService.addReview(productId, reviewData, token);
      alert('Thank you for your review!');
      navigate(`/product/${productId}`, { state: { reviewSubmitted: true } });
    } catch (error) {
      console.error('Failed to submit review:', error);
      setErrors({ api: error.message || 'Failed to submit review. You may not be eligible to review this product.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!product) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="review-page">
      <div className="review-container">
        <h1 className="review-title">Write a Review</h1>
        
        <div className="product-summary">
          <img src={productImageSrc} alt={product.name} className="product-image" />
          <div className="product-info">
            <h2>{product.name}</h2>
            <p className="product-price">${product.price}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label className="form-label">
              Your Rating <span className="required">*</span>
            </label>
            {renderStars()}
            {rating > 0 && (
              <p className="rating-text">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
            {errors.rating && <span className="error-text">{errors.rating}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Your Review <span className="required">*</span>
            </label>
            <textarea
              className="review-textarea"
              placeholder="Share your experience with this product..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="6"
            />
            <div className="character-count">
              {reviewText.length} characters (minimum 10)
            </div>
            {errors.reviewText && <span className="error-text">{errors.reviewText}</span>}
          </div>

          <div className="review-tips">
            <h3>Tips for writing a great review:</h3>
            <ul>
              <li>Be specific about what you liked or didn't like</li>
              <li>Mention the product's quality and value for money</li>
              <li>Share how you used the product</li>
              <li>Be honest and helpful to other buyers</li>
            </ul>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(`/product/${productId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
          {errors.api && <p className="error-text api-error">{errors.api}</p>}
        </form>
      </div>
    </div>
  );
}

export default Review;