'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Clock, Lock, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, token, loading: authLoading } = useAuth();
  const [paymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const orderPlacedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (cart.length === 0 && !orderPlacedRef.current) {
      router.push('/');
      return;
    }
    setInitializing(false);
  }, [token, cart, router, authLoading]);

  if (authLoading || initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!token || (cart.length === 0 && !orderPlacedRef.current)) {
    return null;
  }

  const subtotal = getCartTotal();
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campus-bites-server.vercel.app/api';
      
      const checkoutResponse = await fetch(`${API_URL}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          totalAmount: total,
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      if (!checkoutResponse.ok) throw new Error('Checkout failed');
      const checkoutData = await checkoutResponse.json();

      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockSignature = `sig_${Math.random().toString(36).substr(2, 16)}`;

      const confirmResponse = await fetch(`${API_URL}/orders/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          totalAmount: total,
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          paymentId: mockPaymentId,
          orderId: checkoutData.orderId,
          signature: mockSignature
        })
      });

      if (!confirmResponse.ok) throw new Error('Failed to confirm order');
      const confirmData = await confirmResponse.json();

      orderPlacedRef.current = true;
      clearCart();
      router.push(`/order-success?orderId=${confirmData.order.id}`);
      
    } catch (error) {
      console.error('Order placement error:', error);
      setError(error.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
     
      <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-full transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="font-serif text-lg sm:text-2xl font-bold text-foreground truncate">Checkout</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Complete your order</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-elegant border border-border">
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0 gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-foreground text-sm sm:text-base whitespace-nowrap">
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-border">
                <div className="flex justify-between text-sm sm:text-base text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-muted-foreground">
                  <span>GST (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-border">
                  <span className="font-bold text-base sm:text-xl text-foreground">Total</span>
                  <span className="font-bold text-xl sm:text-3xl text-secondary">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            
            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-elegant border border-border">
              <h2 className="font-serif text-base sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Pickup Details
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Ready for pickup in</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                    <span className="text-lg sm:text-2xl font-bold text-foreground">15-20 minutes</span>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-border">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Pickup Location</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-sm sm:text-base">Campus Canteen - Counter #3</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        You'll receive a notification when ready
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-elegant border border-border">
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-secondary bg-secondary/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      readOnly
                      className="w-4 h-4 sm:w-5 sm:h-5 text-secondary accent-secondary flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base">Pay Online</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">Secure payment</p>
                      </div>
                    </div>
                  </div>
                  <span className="bg-secondary text-white text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2">
                    Recommended
                  </span>
                </label>
              </div>

              {error && (
                <div className="mt-3 sm:mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-4 sm:mt-6 bg-secondary text-secondary-foreground py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </span>
                ) : (
                  `Place Order - ₹${total.toFixed(2)}`
                )}
              </button>

              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Secure ordering system</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}