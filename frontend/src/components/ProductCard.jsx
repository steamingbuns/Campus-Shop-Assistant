import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Sparkles } from 'lucide-react';

const fallbackImage =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(price) ? price : 0);

function ProductCard({ product, onAdd, onView, viewMode = 'grid' }) {
  const handleAdd = (event) => {
    event.stopPropagation();
    onAdd?.(product, event);
  };

  // List view - compact horizontal layout
  if (viewMode === 'list') {
    return (
      <article
        onClick={() => onView?.(product.id)}
        className="group flex cursor-pointer items-center gap-4 rounded-2xl bg-white/80 p-4 shadow-sm shadow-blue-100 ring-1 ring-blue-50 transition hover:shadow-md hover:ring-blue-100"
      >
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <img
            src={product.image || fallbackImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-1 items-center gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-500">
              {product.category?.name || product.categoryName || (typeof product.category === 'string' ? product.category : 'Campus item')}
            </p>
            <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{product.name}</h3>
            <p className="line-clamp-1 text-sm text-slate-600">
              {product.description || 'Ready for pickup around campus.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-blue-50 px-4 py-2 text-base font-semibold text-blue-600">
              {formatPrice(product.price)}
            </span>
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:opacity-90"
            >
              <ShoppingCart className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Grid view - original card layout
  return (
    <article
      onClick={() => onView?.(product.id)}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white/80 shadow-sm shadow-blue-100 ring-1 ring-blue-50 transition hover:shadow-lg hover:ring-blue-100"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image || fallbackImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />

        <button
          type="button"
          onClick={handleAdd}
          className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-blue-100 transition hover:bg-white"
        >
          <ShoppingCart className="h-4 w-4 text-blue-500" />
          Quick add
        </button>

        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          aria-label="Save for later"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-sm shadow-blue-100 transition hover:text-blue-500"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-500">
              {product.category?.name || product.categoryName || (typeof product.category === 'string' ? product.category : 'Campus item')}
            </p>
            <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{product.name}</h3>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-slate-600">
          {product.description || 'Ready for pickup around campus.'}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Verified seller
          </div>
          <span className="text-xs font-semibold text-slate-500">Tap to view</span>
        </div>
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.oneOfType([
      PropTypes.shape({
        name: PropTypes.string,
      }),
      PropTypes.string,
    ]),
    categoryName: PropTypes.string,
  }).isRequired,
  onAdd: PropTypes.func,
  onView: PropTypes.func,
  viewMode: PropTypes.oneOf(['grid', 'list']),
};

export default ProductCard;
