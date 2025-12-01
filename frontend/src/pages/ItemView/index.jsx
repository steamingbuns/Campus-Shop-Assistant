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
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

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

        // Fetch related products from same category
        if (normalizedProduct.category) {
          try {
            const response = await productService.listProducts();
            const allProducts = response.items || [];
            const filtered = allProducts
              .filter(p => 
                (p.categoryName === normalizedProduct.category || p.category === normalizedProduct.category) && 
                p.id !== normalizedProduct.id
              )
              .slice(0, 6)
              .map(p => ({
                ...p,
                images: p.image ? [p.image] : [],
                category: p.categoryName || p.category
              }));
            setRelatedProducts(filtered);
          } catch (error) {
            console.error('Failed to load related products', error);
            setRelatedProducts([]);
          }
        }
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
      <div className="rounded-3xl bg-white/80 px-6 py-10 text-center shadow-2xl shadow-blue-100 ring-1 ring-white/60">
        <p className="text-lg font-bold text-slate-900">Unable to load product</p>
        <p className="text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-3xl bg-white/80 px-6 py-10 text-center shadow-2xl shadow-blue-100 ring-1 ring-white/60">
        <p className="text-lg font-bold text-slate-900">Product Not Found</p>
        <p className="text-sm text-slate-600">Sorry, we could not find the product you were looking for.</p>
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <button className="hover:text-blue-500" onClick={() => navigate('/')}>Home</button>
        <span>/</span>
        <button className="hover:text-blue-500" onClick={() => navigate('/marketplace')}>Marketplace</button>
        <span>/</span>
        <span className="text-slate-900">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[480px,1fr]">
        {/* Left: Image Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={productImages[activeImage]}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>
          {productImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {productImages.slice(0, 5).map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-lg border-2 transition ${
                    activeImage === index ? 'border-blue-500' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="space-y-4">
          {/* Product Title & Rating */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
                <span className="ml-1 font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-500">|</span>
              <span className="text-slate-600">{product.ratingCount} Reviews</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-600">{product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-blue-500">{formatPrice(product.price)}</span>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <span className="w-32 text-slate-600">Category:</span>
              <span className="font-semibold text-slate-900">{product.category}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-32 text-slate-600">Condition:</span>
              <span className="font-semibold text-slate-900">Good</span>
            </div>
            <div className="flex gap-2">
              <span className="w-32 text-slate-600">Stock:</span>
              <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-700">Quantity:</span>
            <div className="flex items-center rounded-lg border border-slate-200">
              <button
                type="button"
                className="px-3 py-2 hover:bg-slate-50"
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
                className="w-16 border-x border-slate-200 bg-transparent px-2 py-2 text-center text-sm font-semibold outline-none"
              />
              <button
                type="button"
                className="px-3 py-2 hover:bg-slate-50"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 rounded-lg border-2 border-blue-500 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="mx-auto h-5 w-5" />
              <span className="mt-1 block text-xs">Add to Cart</span>
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              <span className="block">Buy Now</span>
              <span className="mt-1 block text-xs font-normal">{formatPrice(product.price * quantity)}</span>
            </button>
          </div>

          {/* Additional Actions */}
          <div className="flex gap-2 border-t border-slate-100 pt-4">
            {isLoggedIn && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-red-600"
                onClick={() => setIsReportModalOpen(true)}
              >
                <Flag className="h-3 w-3" />
                Report
              </button>
            )}
            {canReview && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600"
                onClick={handleWriteReview}
              >
                <PenSquare className="h-3 w-3" />
                Write Review
              </button>
            )}
          </div>

          {/* Seller Info - Compact */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Safe Shopping on Campus</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                {product.seller.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{product.seller.name}</p>
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                  {renderStars(product.seller.rating)}
                  <span>{Number(product.seller.rating).toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-600">
              <div>
                <span className="text-slate-500">Sales:</span> <span className="font-semibold">{product.seller.totalSales || 0}</span>
              </div>
              <div>
                <span className="text-slate-500">Contact:</span> <span className="font-semibold">{product.seller.phoneNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-bold text-slate-900">Product Description</h2>
        <div className="mt-3 text-sm leading-relaxed text-slate-700">
          {product.description || 'No detailed description available for this product.'}
        </div>
      </div>

      {/* Other Items Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-bold text-slate-900">Other Items</h2>
        <p className="mt-1 text-sm text-slate-600">More products from this category</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:shadow-md"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
                  {item.images?.[0] && (
                    <img 
                      src={item.images[0]} 
                      alt={item.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-slate-700">{item.name}</p>
                <p className="mt-1 text-sm font-bold text-blue-600">{formatPrice(item.price)}</p>
              </button>
            ))
          ) : (
            <p className="col-span-full py-4 text-center text-sm text-slate-500">No related products available</p>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Customer Reviews</h2>
          <span className="text-sm text-slate-600">{product.ratingCount} reviews</span>
        </div>

        <div className="mt-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{product.rating.toFixed(1)}</p>
              <div className="mt-1 flex justify-center">{renderStars(product.rating)}</div>
              <p className="mt-1 text-xs text-slate-500">out of 5</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((review) => review.rating === star).length;
                const percentage = product.ratingCount ? Math.round((count / product.ratingCount) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-12">{star} stars</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-slate-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                      {(review.userName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{review.userName || `User #${review.userId}`}</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
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
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl shadow-blue-200"
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
                className="w-full rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />

              {reportError && <p className="text-xs font-semibold text-red-600">{reportError}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-200"
                  onClick={() => setIsReportModalOpen(false)}
                  disabled={isSubmittingReport}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md disabled:opacity-60"
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
