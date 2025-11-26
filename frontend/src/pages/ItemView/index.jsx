import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Flag, PenSquare, AlertTriangle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';
import userService from '../../services/userService';
import reportService from '../../services/reportService';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80';

function ItemView() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isLoggedIn, token, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canReview, setCanReview] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDetails, setReportDetails] = useState('');
  const [reportError, setReportError] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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
    const safeRating = Number.isFinite(rating) ? rating : 0;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, idx) => {
          const starValue = idx + 1;
          const isFull = safeRating >= starValue;
          const isHalf = !isFull && safeRating > idx;
          const className = isFull
            ? 'text-yellow-400 fill-yellow-400'
            : isHalf
            ? 'text-yellow-300 fill-yellow-300'
            : 'text-slate-200';
          return <Star key={starValue} className={`h-4 w-4 ${className}`} />;
        })}
      </div>
    );
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

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError(null);

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!reportDetails.trim()) {
      setReportError('Please provide details for the report.');
      return;
    }
    if (!user || !user.userId || !productId) {
      setReportError('Missing user or product ID for reporting.');
      return;
    }

    setIsSubmittingReport(true);
    try {
      const parameters = {
        reporter_id: user.userId,
        item_id: productId,
        details: reportDetails
      };

      await reportService.createReport(parameters, token);
      alert('Your report has been submitted for review. Thank you for helping us keeping the Campus Shop a safer place!');
      setIsReportModalOpen(false);
      setReportDetails('');
    }
    catch (err) {
      console.error('Report submission failed:', err);
      setReportError(err.message || 'Failed to submit report. Please try again.');
    }
    finally {
      setIsSubmittingReport(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-600">Loading product information...</div>;
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white/80 px-6 py-10 text-center shadow-2xl shadow-indigo-100 ring-1 ring-white/60">
        <p className="text-lg font-bold text-slate-900">Unable to load product</p>
        <p className="text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-3xl bg-white/80 px-6 py-10 text-center shadow-2xl shadow-indigo-100 ring-1 ring-white/60">
        <p className="text-lg font-bold text-slate-900">Product Not Found</p>
        <p className="text-sm text-slate-600">Sorry, we could not find the product you were looking for.</p>
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <button className="text-indigo-600 hover:underline" onClick={() => navigate('/')}>Home</button>
        <span>/</span>
        <button className="text-indigo-600 hover:underline" onClick={() => navigate('/marketplace')}>Marketplace</button>
        <span>/</span>
        <button
          className="text-indigo-600 hover:underline"
          onClick={() => navigate(`/marketplace?category=${encodeURIComponent(product.category)}`)}
        >
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-900">{product.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl bg-white/80 p-4 shadow-lg shadow-indigo-100 ring-1 ring-indigo-50">
            <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={productImages[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm shadow-indigo-50">
                Verified
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {productImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-xl border transition ${
                    activeImage === index ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-indigo-50'
                  }`}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 p-4 shadow-sm shadow-indigo-50 ring-1 ring-indigo-50">
            <h3 className="text-lg font-bold text-slate-900">Seller Information</h3>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-lg font-bold text-white shadow-md shadow-blue-200">
                {product.seller.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-900">{product.seller.name}</h4>
                  <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    <ShieldCheck className="h-4 w-4" />
                    Verified
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {renderStars(product.seller.rating)}
                  <span className="font-semibold text-slate-800">{Number(product.seller.rating).toFixed(1)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Total Sales</p>
                    <p className="font-semibold text-slate-900">
                      {product.seller.totalSales ? product.seller.totalSales.toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Member Since</p>
                    <p className="font-semibold text-slate-900">
                      {product.seller.joinDate
                        ? new Date(product.seller.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    📧 {product.seller.email}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    📞 {product.seller.phoneNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white/80 p-5 shadow-lg shadow-indigo-100 ring-1 ring-indigo-50">
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              {renderStars(product.rating)}
              <span className="text-sm font-semibold text-slate-700">
                {product.rating.toFixed(1)} ({product.ratingCount} reviews)
              </span>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-indigo-600">{formatPrice(product.price)}</div>
            <div className="mt-2 text-sm text-slate-600">
              {product.description || 'Product description is coming soon.'}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Category: {product.category}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                Quantity:
                <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-2 py-1">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
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
                    className="w-14 border-none bg-transparent text-center text-sm font-semibold text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg disabled:opacity-60"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm shadow-indigo-50 transition hover:border-indigo-200 disabled:opacity-60"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {isLoggedIn && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 shadow-sm shadow-red-100"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                )}
                {canReview && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm shadow-indigo-50"
                    onClick={handleWriteReview}
                  >
                    <PenSquare className="h-4 w-4" />
                    Write a Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 p-5 shadow-lg shadow-indigo-100 ring-1 ring-indigo-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Customer Reviews</h2>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {product.ratingCount} reviews
          </span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr,2fr]">
          <div className="rounded-2xl bg-indigo-50/70 p-4 text-center ring-1 ring-indigo-100">
            <p className="text-4xl font-extrabold text-slate-900">{product.rating.toFixed(1)}</p>
            <div className="mt-2 flex justify-center">{renderStars(product.rating)}</div>
            <p className="text-xs text-slate-600">{product.ratingCount} verified ratings</p>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((review) => review.rating === star).length;
              const percentage = product.ratingCount ? Math.round((count / product.ratingCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-10 font-semibold">{star} ★</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-12 text-right text-xs font-semibold text-slate-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-600">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-indigo-50 bg-white/80 p-4 shadow-sm shadow-indigo-50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">
                    {review.userName || `User #${review.userId}`}
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-700">{review.comment || 'No comment provided.'}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {isReportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl shadow-indigo-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-bold text-slate-900">Report Product</h3>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
                onClick={() => setIsReportModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Please provide details regarding why you are reporting this item (e.g., policy violation, inappropriate
              content, misleading listing).
            </p>

            <form onSubmit={handleReportSubmit} className="mt-4 space-y-3">
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Enter detailed reasons here..."
                rows="5"
                required
                disabled={isSubmittingReport}
                className="w-full rounded-xl border border-indigo-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-100 transition focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />

              {reportError && <p className="text-xs font-semibold text-red-600">{reportError}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-indigo-50 transition hover:border-indigo-200"
                  onClick={() => setIsReportModalOpen(false)}
                  disabled={isSubmittingReport}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md disabled:opacity-60"
                  disabled={isSubmittingReport || !reportDetails.trim()}
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemView;
