'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }
    clearCart();
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://campus-bites-server.vercel.app/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError('Failed to load order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4 text-sm sm:text-base">{error || 'Order not found'}</p>
          <Link href="/" className="text-secondary hover:underline text-sm sm:text-base">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
 
        <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center mb-4 sm:mb-6 shadow-elegant border border-border">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-2">Order Placed Successfully!</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Thank you for your order</p>
          <div className="inline-block bg-secondary/10 px-3 sm:px-4 py-2 rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground">Order ID</p>
            <p className="text-lg sm:text-xl font-bold text-secondary">#{order.id}</p>
          </div>
        </div>

      
        <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-elegant mb-4 sm:mb-6 border border-border">
          <h2 className="font-serif text-base sm:text-lg font-semibold mb-3 sm:mb-4">Order Details</h2>
          
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
              <span className="font-medium text-secondary capitalize text-xs sm:text-sm">{order.status}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Order Time:</span>
              <span className="font-medium text-foreground text-right text-xs sm:text-sm">
                {new Date(order.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}
              </span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Payment:</span>
              <span className="font-medium text-foreground text-right text-xs sm:text-sm break-all">
                {order.paymentIntentId}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-3 sm:pt-4">
            <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Items Ordered</h3>
            <div className="space-y-2 sm:space-y-3">
              {order.items && order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {item.menuItem.imageUrl && (
                      <img 
                        src={item.menuItem.imageUrl} 
                        alt={item.menuItem.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-xs sm:text-sm truncate">{item.menuItem.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-foreground text-xs sm:text-sm whitespace-nowrap">
                    ₹{(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border mt-3 sm:mt-4 pt-3 sm:pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-lg font-bold text-foreground">Total Amount:</span>
              <span className="text-lg sm:text-2xl font-bold text-secondary">₹{parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

       
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link 
            href={`/order-tracking?orderId=${order.id}`}
            className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-lg sm:rounded-xl font-semibold text-center hover:opacity-90 transition text-sm sm:text-base"
          >
            Track Order
          </Link>
          <Link 
            href="/"
            className="flex-1 bg-card text-secondary py-3 rounded-lg sm:rounded-xl font-semibold text-center border-2 border-secondary hover:bg-secondary/5 transition text-sm sm:text-base"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}