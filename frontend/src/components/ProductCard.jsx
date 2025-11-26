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

function ProductCard({ product, onAdd, onView }) {
  const handleAdd = (event) => {
    event.stopPropagation();
    onAdd?.(product, event);
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={() => onView?.(product.id)}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white/80 shadow-sm shadow-indigo-100 ring-1 ring-indigo-50 transition hover:shadow-xl hover:ring-indigo-100"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image || fallbackImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

        <button
          type="button"
          onClick={handleAdd}
          className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-100 transition duration-200 hover:-translate-y-[2px] hover:bg-white"
        >
          <ShoppingCart className="h-4 w-4 text-indigo-600" />
          Quick add
        </button>

        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          aria-label="Save for later"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-sm shadow-indigo-100 transition hover:scale-105 hover:text-indigo-600"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-500">
              {product.category?.name || 'Campus item'}
            </p>
            <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{product.name}</h3>
          </div>
          <span className="rounded-lg bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-slate-600">
          {product.description || 'Ready for pickup around campus.'}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Verified seller
          </div>
          <span className="text-xs font-semibold text-slate-500">Tap to view</span>
        </div>
      </div>
    </motion.article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  onAdd: PropTypes.func,
  onView: PropTypes.func,
};

export default ProductCard;
