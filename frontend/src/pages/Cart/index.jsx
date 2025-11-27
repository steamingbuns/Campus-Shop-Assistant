import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  if (cartItems.length === 0) {
    return (
      <div className="rounded-3xl bg-white/80 px-6 py-12 text-center shadow-2xl shadow-blue-100 ring-1 ring-white/60">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 shadow-sm shadow-blue-100">
          <ShoppingCart className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-600">Add some products from the marketplace to get started.</p>
        <button
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg"
          onClick={() => navigate('/marketplace')}
        >
          Continue shopping
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
              <Sparkles className="h-4 w-4" />
              In your cart
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Your Cart ({cartItems.length})</h1>
          </div>
          <button
            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>

        <div className="space-y-4 rounded-2xl bg-white/80 p-4 shadow-sm shadow-blue-50 ring-1 ring-blue-50">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-xl border border-blue-50 bg-white/60 p-3 shadow-sm sm:grid-cols-[auto,1fr,auto]"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                <p className="text-sm font-semibold text-blue-500">{formatPrice(item.price)}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  Campus pickup
                </div>
              </div>
              <div className="flex flex-col items-end justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-2 py-1 text-sm font-semibold text-slate-800">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right text-sm font-semibold text-slate-900">
                  {formatPrice(item.price * item.quantity)}
                </div>
                <button
                  className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 p-5 shadow-lg shadow-blue-100 ring-1 ring-blue-50">
        <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">{formatPrice(getCartTotal())}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">Free</span>
          </div>
          <div className="flex items-center justify-between border-t border-blue-50 pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(getCartTotal())}</span>
          </div>
        </div>

        <button
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg"
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm shadow-blue-50 transition hover:border-blue-200"
          onClick={() => navigate('/marketplace')}
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Cart;
