import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import orderService from '../../services/orderService';

function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    meetingLocation: '',
    meetingTower: '',
    meetingTime: '',
    meetingDate: '',
    paymentMethod: 'cod',
    notes: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  // Redirect to cart if cart is empty
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the current field when user starts typing
    if (formSubmitted) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validate = (data) => {
    const newErrors = {};
    // Regex for Vietnamese phone numbers (simple example, adjust as needed)
    const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

    if (!data.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!data.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!phoneRegex.test(data.phone)) {
      newErrors.phone = 'Invalid Vietnamese phone number';
    }
    if (!data.meetingTower) newErrors.meetingTower = 'Meeting Tower/Building is required';
    if (!data.meetingLocation.trim()) newErrors.meetingLocation = 'Specific Location is required';
    if (!data.meetingDate) newErrors.meetingDate = 'Meeting Date is required';
    if (!data.meetingTime) {
      newErrors.meetingTime = 'Meeting Time is required';
    } else {
      // Validate that meeting date + time is not in the past
      const selectedDateTime = new Date(`${data.meetingDate}T${data.meetingTime}:00`);
      const now = new Date();
      if (selectedDateTime < now) {
        newErrors.meetingTime = 'Meeting date and time cannot be in the past';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true); // Mark form as submitted to show errors

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({}); // Clear previous errors if validation passes
    setIsProcessing(true);

    setErrors({}); // Clear previous errors if validation passes
    setIsProcessing(true);

    try {
      // 1. Create the order
      const orderData = {
        items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
        meetingDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          meetingTower: formData.meetingTower,
          meetingLocation: formData.meetingLocation,
          meetingDate: formData.meetingDate,
          meetingTime: formData.meetingTime,
        },
        notes: formData.notes,
      };

      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const orderResponse = await orderService.createOrder(orderData, token);
      const orderId = orderResponse.orderId;

      // 2. Decrease product stock
      const itemsToDecreaseStock = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));
      await productService.decreaseProductStock(itemsToDecreaseStock, token);

      // 3. Clear cart and show success
      clearCart();
      setIsProcessing(false);
      alert(`Order placed successfully! Your Order Code is: ${orderResponse.orderCode}`);
      navigate('/marketplace');

    } catch (error) {
      console.error('Order submission error:', error);
      setIsProcessing(false);
      alert(`Failed to place order: ${error.message || 'An unexpected error occurred.'}`);
    }
  };

  const subtotal = getCartTotal();
  const meetingFee = 0; // No extra fee for campus pickup
  const total = subtotal + meetingFee;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">Checkout</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Complete your pickup</h1>
        <p className="text-sm text-slate-600">
          Confirm your details, choose a campus meetup, and place your order securely.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl bg-white/80 p-5 shadow-lg shadow-blue-100 ring-1 ring-blue-50"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>
              {formSubmitted && Object.keys(errors).length > 0 && (
                <span className="text-sm font-semibold text-red-600">Fix highlighted fields</span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-800">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-800 outline-none transition ${
                    formSubmitted && errors.fullName
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-blue-100 bg-white/70 ring-blue-100 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {formSubmitted && errors.fullName && (
                  <p className="mt-1 text-xs font-semibold text-red-600">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-800 outline-none transition ${
                    formSubmitted && errors.email
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-blue-100 bg-white/70 ring-blue-100 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {formSubmitted && errors.email && (
                  <p className="mt-1 text-xs font-semibold text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="0123456789"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-800 outline-none transition ${
                    formSubmitted && errors.phone
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-blue-100 bg-white/70 ring-blue-100 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {formSubmitted && errors.phone && (
                  <p className="mt-1 text-xs font-semibold text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-blue-50/60 p-4 ring-1 ring-blue-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">📍 Meeting Location & Time</h2>
              <p className="text-xs font-semibold text-blue-500">Campus pickup only</p>
            </div>
            <p className="text-sm text-slate-600">
              Choose where and when to meet on campus for item pickup.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-800">Tower/Building *</label>
                <select
                  name="meetingTower"
                  value={formData.meetingTower}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-800 outline-none transition ${
                    formSubmitted && errors.meetingTower
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-blue-100 bg-white ring-blue-100 focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select a location</option>
                  <option value="Tower B1">Tower B1</option>
                  <option value="Tower B4">Tower B4</option>
                  <option value="Tower B6">Tower B6</option>
                  <option value="Tower B8/B9">Tower B8/B9</option>
                  <option value="Tower C4">Tower C4</option>
                  <option value="Tower C5">Tower C5</option>
                  <option value="Tower C6">Tower C6</option>
                  <option value="Cafeteria">Cafeteria</option>
                </select>
                {formSubmitted && errors.meetingTower && (
                  <p className="mt-1 text-xs font-semibold text-red-600">{errors.meetingTower}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">Specific Location *</label>
                <input
                  type="text"
                  name="meetingLocation"
                  value={formData.meetingLocation}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Floor 3, near elevator"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-800 outline-none transition ${
                    formSubmitted && errors.meetingLocation
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-blue-100 bg-white ring-blue-100 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {formSubmitted && errors.meetingLocation && (
                  <p className="mt-1 text-xs font-semibold text-red-600">{errors.meetingLocation}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">Meeting Date *</label>
                <input
                  type="date"
                  name="meetingDate"
                  value={formData.meetingDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-800 outline-none transition ${
                    formSubmitted && errors.meetingDate
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-blue-100 bg-white ring-blue-100 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                {formSubmitted && errors.meetingDate && (
                  <p className="mt-1 text-xs font-semibold text-red-600">{errors.meetingDate}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">Meeting Time *</label>
                <select
                  name="meetingTime"
                  value={formData.meetingTime}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-slate-800 outline-none transition ${
                    formSubmitted && errors.meetingTime
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-blue-100 bg-white ring-blue-100 focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select a time</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                </select>
                {formSubmitted && errors.meetingTime && (
                  <p className="mt-1 text-xs font-semibold text-red-600">{errors.meetingTime}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-sm shadow-blue-50 ring-blue-100 transition hover:ring-2 hover:ring-blue-500">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Cash on Delivery</p>
                  <p className="text-xs text-slate-600">Pay when you receive your order</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-100 bg-white/70 p-4 shadow-sm shadow-blue-50 ring-blue-100 transition hover:ring-2 hover:ring-blue-500">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo"
                  checked={formData.paymentMethod === 'momo'}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">MoMo</p>
                  <p className="text-xs text-slate-600">Pay with MoMo e-wallet</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Order Notes (Optional)</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special instructions for your order..."
              rows="4"
              className="w-full rounded-xl border border-blue-100 bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        <div className="space-y-4 rounded-3xl bg-white/80 p-5 shadow-lg shadow-blue-100 ring-1 ring-blue-50">
          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-blue-50 bg-white/60 p-3">
                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-2xl bg-blue-50/70 p-4 text-sm text-slate-700 ring-1 ring-blue-100">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Campus Pickup</span>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">Free</span>
            </div>
            <div className="flex items-center justify-between border-t border-blue-100 pt-3 text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-lg disabled:opacity-70"
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Place Order'}
          </button>

          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm shadow-blue-50 transition hover:border-blue-200"
            onClick={() => navigate('/cart')}
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
