'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { usePusher as useSocket } from '@/contexts/PusherContext';


function OrderTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { getOrderUpdate } = useSocket();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

  
  useEffect(() => {
    if (!orderId || !order) return;

    const update = getOrderUpdate(parseInt(orderId));
    if (update && update.status !== order.status) {
      
      setOrder(prev => ({
        ...prev,
        status: update.status
      }));
    }
  }, [getOrderUpdate(parseInt(orderId))]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campus-bites-server.vercel.app/api';
      
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  const getStatusStep = (status) => {
    const steps = {
      'PENDING': 1,
      'PROCESSING': 2,
      'READY': 3,
      'COMPLETED': 4,
      'CANCELLED': 0
    };
    return steps[status] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-xl font-bold text-foreground mb-2">Unable to Load Order</p>
          <p className="text-destructive mb-6">{error || 'Order not found'}</p>
          <Link 
            href="/" 
            className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const statusSteps = [
    { label: 'Pending', value: 'PENDING', step: 1 },
    { label: 'Processing', value: 'PROCESSING', step: 2 },
    { label: 'Ready', value: 'READY', step: 3 },
    { label: 'Completed', value: 'COMPLETED', step: 4 }
  ];

  return (
    <div className="min-h-screen bg-background">
      
      <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground">Track Order</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Order #{order.id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-3 sm:p-4 mb-6 flex items-center gap-2 sm:gap-3">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse flex-shrink-0"></div>
          <p className="text-xs sm:text-sm text-foreground">Live tracking enabled - status updates automatically</p>
        </div>

       
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-elegant mb-6 border border-border">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-sm text-muted-foreground mb-2">Current Status</p>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
              {order.status}
            </p>
          </div>

          
          {!isCancelled && (
            <div className="relative">
              
              <div className="relative flex items-center justify-between mb-8">
                {statusSteps.map((status, index) => (
                  <div key={status.value} className="flex flex-col items-center flex-1">
                   
                    <div className="relative z-20 flex flex-col items-center">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                        status.step <= currentStep 
                          ? 'bg-secondary text-white shadow-lg scale-110' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {status.step <= currentStep ? (
                          <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                        ) : (
                          <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                        )}
                      </div>
                    
                      <p className={`mt-2 text-xs sm:text-sm font-medium text-center whitespace-nowrap transition-colors ${
                        status.step <= currentStep 
                          ? 'text-secondary' 
                          : 'text-muted-foreground'
                      }`}>
                        {status.label}
                      </p>
                    </div>
                    
              
                    {index < statusSteps.length - 1 && (
                      <div className="absolute top-6 sm:top-7 left-0 right-0 h-1 flex items-center" style={{
                        left: `${(index + 1) * 25}%`,
                        width: '25%',
                        marginLeft: '-12.5%'
                      }}>
                        <div className={`h-1 w-full transition-all duration-500 ${
                          status.step < currentStep ? 'bg-secondary' : 'bg-muted'
                        }`}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="text-center py-6 sm:py-8">
              <XCircle className="w-14 h-14 sm:w-16 sm:h-16 text-destructive mx-auto mb-4" />
              <p className="text-lg sm:text-xl font-semibold text-destructive">Order Cancelled</p>
            </div>
          )}
        </div>

       
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-elegant mb-6 border border-border">
          <h2 className="font-serif text-lg sm:text-xl font-bold mb-4 text-foreground">Order Details</h2>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order ID:</span>
              <span className="font-semibold text-foreground">#{order.id}</span>
            </div>
            <div className="flex justify-between items-start sm:items-center">
              <span className="text-sm text-muted-foreground">Order Time:</span>
              <span className="font-semibold text-foreground text-right text-sm sm:text-base">
                {new Date(order.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}
              </span>
            </div>
            <div className="flex justify-between items-start sm:items-center">
              <span className="text-sm text-muted-foreground">Payment:</span>
              <span className="font-mono text-xs sm:text-sm text-foreground text-right break-all max-w-[200px] sm:max-w-none">
                {order.paymentIntentId}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
              <Package className="w-5 h-5" />
              Items
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {order.items && order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.menuItem.imageUrl && (
                      <img 
                        src={item.menuItem.imageUrl} 
                        alt={item.menuItem.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">
                        {item.menuItem.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground text-sm sm:text-base whitespace-nowrap">
                    ₹{(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-bold text-foreground">Total Amount:</span>
              <span className="text-xl sm:text-2xl font-bold text-secondary">
                ₹{parseFloat(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        
        {order.status === 'READY' && (
          <div className="bg-green-500/10 border-2 border-green-500 rounded-2xl p-6 text-center mb-6 animate-pulse">
            <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-green-600 mb-2">Your order is ready!</h3>
            <p className="text-sm sm:text-base text-green-700">Please collect from Campus Canteen - Counter #3</p>
          </div>
        )}

        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link 
            href="/"
            className="flex-1 bg-secondary text-secondary-foreground py-3 sm:py-4 rounded-xl font-semibold text-center hover:opacity-90 transition text-sm sm:text-base"
          >
            Back to Home
          </Link>
          {/* <button
            onClick={fetchOrderDetails}
            className="flex-1 bg-card text-secondary py-3 sm:py-4 rounded-xl font-semibold border-2 border-secondary hover:bg-secondary/5 transition text-sm sm:text-base"
          >
            Refresh Status
          </button> */}
        </div>
      </div>
    </div>
  );
}


export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}