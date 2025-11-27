import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';

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

  const renderStars = () => (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              active
                ? 'border-yellow-200 bg-yellow-50 text-yellow-500'
                : 'border-blue-100 bg-white text-slate-400 hover:border-blue-200'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star className={`h-5 w-5 ${active ? 'fill-yellow-400' : ''}`} />
          </button>
        );
      })}
    </div>
  );

  if (!product) {
    return <div className="text-sm text-slate-600">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">Review</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Write a Review</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/product/${productId}`)}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-600 shadow-sm shadow-blue-50 transition hover:border-blue-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to product
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white/80 p-4 shadow-sm shadow-blue-50 ring-1 ring-blue-50">
        <img src={productImageSrc} alt={product.name} className="h-20 w-20 rounded-xl object-cover" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
          <p className="text-sm font-semibold text-blue-500">
            {new Intl.NumberFormat('vi-VN').format(product.price)} đ
          </p>
        </div>
        <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-500">
          <Sparkles className="h-4 w-4" />
          Verified item
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl bg-white/80 p-5 shadow-lg shadow-blue-100 ring-1 ring-blue-50"
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">
            Your Rating <span className="text-red-500">*</span>
          </label>
          {renderStars()}
          {rating > 0 && (
            <p className="text-sm font-semibold text-blue-600">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
          {errors.rating && <span className="text-xs font-semibold text-red-600">{errors.rating}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full rounded-xl border border-blue-100 bg-white/70 px-3 py-3 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
            placeholder="Share your experience with this product..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows="6"
          />
          <div className="text-xs text-slate-500">{reviewText.length} characters (minimum 10)</div>
          {errors.reviewText && <span className="text-xs font-semibold text-red-600">{errors.reviewText}</span>}
        </div>

        <div className="rounded-2xl bg-blue-50/60 p-4 text-sm text-slate-700 ring-1 ring-blue-100">
          <h3 className="text-sm font-semibold text-slate-900">Tips for writing a great review:</h3>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Be specific about what you liked or didn't like</li>
            <li>Mention the product's quality and value for money</li>
            <li>Share how you used the product</li>
            <li>Be honest and helpful to other buyers</li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-200"
            onClick={() => navigate(`/product/${productId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
        {errors.api && <p className="text-xs font-semibold text-red-600">{errors.api}</p>}
      </form>
    </div>
  );
}

export default Review;
