import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      // TODO: API call to create order
      console.log('Order submitted:', {
        items: cartItems,
        total: getCartTotal(),
        meetingDetails: formData
      });

      // Clear cart and redirect to success page
      clearCart();
      setIsProcessing(false);
      alert('Order placed successfully! 🎉');
      navigate('/marketplace');
    }, 2000);
  };

  const subtotal = getCartTotal();
  const meetingFee = 0; // No extra fee for campus pickup
  const total = subtotal + meetingFee;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-content">
          {/* Left Column - Forms */}
          <div className="checkout-forms">
            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div className="form-section">
                <h2>Contact Information</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="0123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Meeting Details */}
              <div className="form-section">
                <h2>📍 Meeting Location & Time</h2>
                <p className="section-description">Choose where and when to meet on campus for item pickup</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Meeting Tower/Building *</label>
                    <select
                      name="meetingTower"
                      value={formData.meetingTower}
                      onChange={handleInputChange}
                      required
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
                  </div>

                  <div className="form-group">
                    <label>Specific Location *</label>
                    <input
                      type="text"
                      name="meetingLocation"
                      value={formData.meetingLocation}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Floor 3, near elevator"
                    />
                  </div>

                  <div className="form-group">
                    <label>Meeting Date *</label>
                    <input
                      type="date"
                      name="meetingDate"
                      value={formData.meetingDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Meeting Time *</label>
                    <select
                      name="meetingTime"
                      value={formData.meetingTime}
                      onChange={handleInputChange}
                      required
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
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">💵</span>
                      <div>
                        <strong>Cash on Delivery</strong>
                        <p>Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={formData.paymentMethod === 'momo'}
                      onChange={handleInputChange}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">📱</span>
                      <div>
                        <strong>MoMo</strong>
                        <p>Pay with MoMo e-wallet</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="form-section">
                <h2>Order Notes (Optional)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for your order..."
                  rows="4"
                />
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <img src={item.image} alt={item.name} />
                  <div className="summary-item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="summary-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Campus Pickup:</span>
                <span className="free-badge">Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="place-order-btn"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>

            <button
              type="button"
              className="back-to-cart-btn"
              onClick={() => navigate('/cart')}
            >
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
