import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, LayoutGrid, List, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import productService from '../../services/productService';
import ProductCard from '../../components/ProductCard';
import Chatbot from '../../components/Chatbot';

const MarketPlace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
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
        setCategories([{ id: 'all', name: 'All items' }, ...data.categories]);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([
          { id: 'all', name: 'All items' },
          { id: 1, name: 'Stationery' },
          { id: 2, name: 'Books' },
          { id: 3, name: 'Clothing' },
          { id: 4, name: 'Electronics' },
          { id: 5, name: 'Accessories' },
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
    }, 250);

    return () => clearTimeout(debounceFetch);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, setSearchParams]);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  const skeletons = useMemo(() => Array.from({ length: 9 }), []);

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-500 shadow-sm shadow-blue-50 ring-1 ring-blue-100">
            <Sparkles className="h-4 w-4" />
            Marketplace
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Campus Marketplace</h1>
          <p className="text-sm text-slate-600">Discover new listings, track pickups, and add to cart in one tap.</p>
        </div>
        <div className="hidden items-center gap-1 rounded-xl border border-blue-100 bg-white/80 p-1 shadow-sm shadow-blue-50 sm:flex">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-xl border border-white/60 bg-white/80 px-3 py-2 shadow-sm shadow-blue-50 ring-1 ring-transparent transition focus-within:ring-2 focus-within:ring-blue-500/60">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, books, tech, or sellers"
            className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white/80 px-3 py-2 text-sm font-semibold text-blue-600 shadow-sm shadow-blue-50 transition hover:border-blue-200 hover:text-blue-800 md:hidden"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[260px,1fr]">
        <div
          className={`rounded-2xl bg-white/80 p-4 shadow-sm shadow-blue-50 ring-1 ring-blue-50 backdrop-blur ${
            filtersOpen ? 'block' : 'hidden'
          } md:block`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Filters</p>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-sm shadow-blue-200'
                    : 'bg-white/70 text-slate-700 ring-1 ring-blue-50 hover:ring-blue-100'
                }`}
              >
                <span>{category.name}</span>
                {selectedCategory === category.id && <span className="text-xs">●</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/50 p-4 shadow-sm shadow-blue-50 ring-1 ring-blue-50 backdrop-blur">
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {skeletons.map((_, idx) => (
                <div
                  key={idx}
                  className="h-full rounded-2xl border border-blue-50 bg-white/70 p-4 shadow-sm shadow-blue-50"
                >
                  <div className="h-40 w-full animate-pulse rounded-xl bg-slate-200" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/70 p-6 text-center text-slate-600 ring-1 ring-blue-50">
              <p className="text-base font-semibold text-slate-900">Something went wrong</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={handleAddToCart} onView={handleViewProduct} viewMode={viewMode} />
                ))}
              </div>

              {products.length === 0 && (
                <div className="mt-6 rounded-2xl bg-white/80 p-6 text-center text-slate-600 ring-1 ring-blue-50">
                  <p className="text-base font-semibold text-slate-900">No products found</p>
                  <p className="text-sm text-slate-600">
                    Try adjusting filters or searching for another keyword.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Chatbot />
    </div>
  );
};

export default MarketPlace;
