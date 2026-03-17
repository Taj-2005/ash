'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, Clock, Package, AlertCircle, Store } from 'lucide-react';
import Link from 'next/link';

export default function NotificationToast() {
  const [toasts, setToasts] = useState([]);
  const [permission, setPermission] = useState('default');

 
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      console.log('[Toast] 🔔 Notification permission:', Notification.permission);
    }
  }, []);


  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission;
    }
    return Notification.permission;
  };

  useEffect(() => {
    const handleNotification = async (event) => {
      console.log('[Toast] 📨 Notification event received:', event.detail);
      
      const notification = event.detail;
      const toastId = Date.now();
      
      
      setToasts(prev => {
        const newToasts = [...prev, { ...notification, toastId }];
        console.log('[Toast] 📋 Total toasts:', newToasts.length);
        return newToasts;
      });

     
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          showBrowserNotification(notification);
        } else if (Notification.permission === 'default') {
          const perm = await requestNotificationPermission();
          if (perm === 'granted') {
            showBrowserNotification(notification);
          }
        }
      }

     
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.toastId !== toastId));
      }, 6000);
    };

    console.log('[Toast] 🎧 Listening for show-notification events...');
    window.addEventListener('show-notification', handleNotification);
    
    return () => {
      console.log('[Toast] 🔇 Removing show-notification listener');
      window.removeEventListener('show-notification', handleNotification);
    };
  }, []);


  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      console.log('[Toast] 🔔 Showing browser notification:', notification);
      
      const title = notification.type === 'store-status' 
        ? 'Campus Bites Store Update'
        : `Order #${notification.orderId}`;
      
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.orderId ? `order-${notification.orderId}` : 'store-status',
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200]
      };

      try {
        const browserNotif = new Notification(title, options);

        
        browserNotif.onclick = () => {
          window.focus();
          if (notification.orderId) {
            window.location.href = `/order-tracking?orderId=${notification.orderId}`;
          }
          browserNotif.close();
        };

        
        setTimeout(() => browserNotif.close(), 5000);
      } catch (error) {
        console.error('[Toast] ❌ Failed to show browser notification:', error);
      }
    }
  };

  const removeToast = (toastId) => {
    console.log('[Toast] 🗑️ Removing toast:', toastId);
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  };

  const getIcon = (notification) => {
   
    if (notification.type === 'store-status') {
      return <Store className="w-6 h-6 text-secondary" />;
    }


    switch (notification.status) {
      case 'COMPLETED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'READY':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'PROCESSING':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'CANCELLED':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-6 h-6 text-orange-500" />;
      default:
        return <Clock className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getTitle = (notification) => {
    if (notification.type === 'store-status') {
      return 'Store Update';
    }
    return `Order #${notification.orderId}`;
  };

  console.log('[Toast] 📊 Current toasts:', toasts.length);

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[60] space-y-3 max-w-[calc(100vw-2rem)] sm:max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        console.log('[Toast] 🍞 Rendering toast:', toast.toastId);
        return (
          <div
            key={toast.toastId}
            className="bg-card border-2 border-border rounded-xl shadow-2xl p-4 pointer-events-auto backdrop-blur-sm animate-slide-in"
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(toast)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground mb-1 text-sm">
                  {getTitle(toast)}
                </p>
                <p className="text-sm text-muted-foreground mb-2 leading-snug">
                  {toast.message}
                </p>
                {toast.orderId && (
                  <Link
                    href={`/order-tracking?orderId=${toast.orderId}`}
                    className="inline-block text-sm text-secondary hover:underline font-semibold"
                    onClick={() => removeToast(toast.toastId)}
                  >
                    View Order →
                  </Link>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.toastId)}
                className="flex-shrink-0 p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        );
      })}

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}