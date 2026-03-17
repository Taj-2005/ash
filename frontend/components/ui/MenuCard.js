'use client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Clock, Plus, Minus, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuCard({ item }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  
  const cartItem = cart.find(cartItem => cartItem.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
   
    if (!user) {
      router.push('/auth/login');
      return;
    }
    addToCart(item);
  };

  const handleIncrement = () => {
    if (!user) {
      alert('Please sign in to add items to cart');
      router.push('/auth/login');
      return;
    }
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (!user) {
      alert('Please sign in to add items to cart');
      router.push('/auth/login');
      return;
    }
    updateQuantity(item.id, quantity - 1);
  };

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-elegant border border-border hover:shadow-elegant-lg transition-all duration-300 hover:-translate-y-1">
     
      <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-muted to-background flex items-center justify-center">
        {item.isEmoji ? (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-background/80 flex items-center justify-center shadow-lg">
            <span className="text-5xl sm:text-6xl">
              {item.imageUrl}
            </span>
          </div>
        ) : !imageError && item.imageUrl ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-secondary border-t-transparent"></div>
              </div>
            )}
            
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              onLoad={() => {
                setImageLoading(false);
              }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageOff className="w-12 h-12 mb-2" />
            <span className="text-sm">No image</span>
          </div>
        )}
        {item.popular && (
          <span className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-secondary text-secondary-foreground text-xs font-bold px-2 sm:px-3 py-1 rounded-full z-10">
            Popular
          </span>
        )}
      </div>

      
      <div className="p-3 sm:p-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 h-8 sm:h-10">
          {item.description}
        </p>

       
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-secondary text-secondary" />
            <span className="font-semibold">4.5</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>15 min</span>
          </div>
        </div>

     
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg sm:text-2xl text-secondary">
            ₹{parseFloat(item.price).toFixed(0)}
          </span>
          
         
          {quantity > 0 ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-secondary/10 rounded-lg sm:rounded-xl p-0.5 sm:p-1">
              <button
                onClick={handleDecrement}
                className="bg-secondary text-secondary-foreground w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center" />
              </button>
              <span className="font-bold text-sm sm:text-base min-w-[24px] sm:min-w-[28px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="bg-secondary text-secondary-foreground w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="bg-secondary text-secondary-foreground px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-1 sm:gap-2 font-semibold text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}