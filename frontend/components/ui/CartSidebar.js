'use client';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function CartSidebar() {
  const { cart, showCart, setShowCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const router = useRouter();

  if (!showCart) return null;

  const subtotal = getCartTotal();
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  const handleCheckout = () => {
    setShowCart(false);
    router.push('/checkout');
  };

  return (
    <>
      
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setShowCart(false)}
      />

     
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-card shadow-elegant-lg z-50 flex flex-col animate-slide-in">
       
        <div className="bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5" />
              <h3 className="text-2xl font-bold">Your Cart</h3>
            </div>
            <p className="text-sm opacity-90">{getCartCount()} {getCartCount() === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={() => setShowCart(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-lg">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-2">Add some delicious items to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-muted rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3 mb-3">
                    
                    {item.imageUrl ? (
                      item.isEmoji ? (
                        <div className="text-4xl">{item.imageUrl}</div>
                      ) : (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover border border-border"
                        />
                      )
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-background border border-border flex items-center justify-center">
                        <span className="text-3xl">🍽️</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-card-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">₹{parseFloat(item.price).toFixed(0)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-background rounded-xl p-1 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-muted hover:bg-border flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4 text-foreground" />
                      </button>
                      <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-lg text-foreground">
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

       
        {cart.length > 0 && (
          <div className="border-t border-border p-6 bg-background">
            <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">GST (5%)</span>
                <span className="font-medium text-foreground">₹{gst.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-foreground">Total</span>
                  <span className="font-bold text-2xl text-secondary">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-secondary text-secondary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}