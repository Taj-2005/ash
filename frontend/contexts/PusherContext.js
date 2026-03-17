'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Pusher from 'pusher-js';

const PusherContext = createContext();

export function PusherProvider({ children }) {
  const { user } = useAuth();
  const [pusher, setPusher] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [storeStatus, setStoreStatus] = useState(null); 
  const [storeStatusLoading, setStoreStatusLoading] = useState(true); 
  const [orderUpdates, setOrderUpdates] = useState({});
  const [newVendorOrders, setNewVendorOrders] = useState([]);
  const [vendorOrdersRefreshTrigger, setVendorOrdersRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchStoreStatus = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campus-bites-server.vercel.app/api';
        
        
        const response = await fetch(`${API_URL}/store/status`);
        
        if (response.ok) {
          const data = await response.json();
         
          setStoreStatus(data.isOpen);
        } else {
         
          setStoreStatus(true);
        }
      } catch (error) {
        console.error('[Store] ❌ Error fetching status:', error);
        setStoreStatus(true); 
      } finally {
        setStoreStatusLoading(false);
      }
    };

    fetchStoreStatus();
  }, []);

  useEffect(() => {
    console.log('[Pusher] 🚀 Initializing Pusher client...');
    
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      forceTLS: true
    });

    pusherClient.connection.bind('connected', () => {
      console.log('[Pusher] ✅ Connected to Pusher');
      setIsConnected(true);
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('[Pusher] ❌ Disconnected from Pusher');
      setIsConnected(false);
    });

    pusherClient.connection.bind('error', (err) => {
      console.error('[Pusher] ⚠️ Connection error:', err);
    });

    setPusher(pusherClient);

    return () => {
      console.log('[Pusher] 🔌 Cleaning up Pusher connection');
      pusherClient.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!pusher || !user) return;

    const channelName = `user-${user.id}`;
    
    const channel = pusher.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('[Pusher] ✅ Successfully subscribed to', channelName);
    });

    channel.bind('order-update', (data) => {
      console.log('[Pusher] 📨 Order update received:', data);
      
      const notification = {
        id: Date.now(),
        orderId: data.orderId,
        status: data.status,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      setOrderUpdates(prev => ({
        ...prev,
        [data.orderId]: data
      }));

      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: notification
      }));
    });

    return () => {
      console.log('[Pusher] 🔇 Unsubscribing from', channelName);
      pusher.unsubscribe(channelName);
    };
  }, [pusher, user]);

  useEffect(() => {
    if (!pusher || !user || user.role !== 'VENDOR') return;

    const vendorChannel = 'vendor-orders';
    console.log('[Pusher] 📡 Vendor subscribing to:', vendorChannel);
    
    const channel = pusher.subscribe(vendorChannel);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('[Pusher] ✅ Vendor subscribed to', vendorChannel);
    });

    channel.bind('new-order', (data) => {
      console.log('[Pusher] 🆕 NEW ORDER RECEIVED:', data);
      
      const notification = {
        id: Date.now(),
        orderId: data.orderId,
        status: 'PENDING',
        message: data.message || `New order #${data.orderId} from ${data.customerName}`,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        type: 'new-order'
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      setNewVendorOrders(prev => [data, ...prev]);
      setVendorOrdersRefreshTrigger(Date.now());
      
      console.log('[Pusher] 🔔 Vendor refresh triggered at:', Date.now());

      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: notification
      }));

      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio not available');
      }
    });

    return () => {
      console.log('[Pusher] 🔇 Vendor unsubscribing from', vendorChannel);
      pusher.unsubscribe(vendorChannel);
    };
  }, [pusher, user]);

  useEffect(() => {
    if (!pusher) return;

    const storeChannel = 'store-channel';
    
    const channel = pusher.subscribe(storeChannel);

    channel.bind('status-change', (data) => {
      console.log('[Pusher] 🏪 Store status changed:', data.isOpen);
      setStoreStatus(data.isOpen);

      const notification = {
        id: Date.now(),
        message: data.isOpen 
          ? '🎉 Store is now OPEN! Start ordering!' 
          : '🔒 Store is now CLOSED. Check back later!',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'store-status'
      };

      if (user?.role !== 'VENDOR') {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        window.dispatchEvent(new CustomEvent('show-notification', {
          detail: notification
        }));
      }
    });

    return () => {
      pusher.unsubscribe(storeChannel);
    };
  }, [pusher, user]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const getOrderUpdate = useCallback((orderId) => {
    return orderUpdates[orderId] || null;
  }, [orderUpdates]);

  const updateStoreStatus = useCallback((isOpen) => {
    setStoreStatus(isOpen);
  }, []);

  const clearNewVendorOrders = useCallback(() => {
    setNewVendorOrders([]);
  }, []);

  const testNotification = useCallback(() => {
    const testNotif = {
      id: Date.now(),
      orderId: 999,
      status: 'PROCESSING',
      message: 'This is a test notification! Your order is being prepared.',
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [testNotif, ...prev]);
    setUnreadCount(prev => prev + 1);

    window.dispatchEvent(new CustomEvent('show-notification', {
      detail: testNotif
    }));

  }, []);

  const value = {
    isConnected,
    notifications,
    unreadCount,
    storeStatus,
    storeStatusLoading, 
    newVendorOrders,
    vendorOrdersRefreshTrigger,
    markAsRead,
    markAllAsRead,
    getOrderUpdate,
    updateStoreStatus,
    clearNewVendorOrders,
    testNotification
  };

  return (
    <PusherContext.Provider value={value}>
      {children}
    </PusherContext.Provider>
  );
}

export const usePusher = () => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusher must be used within PusherProvider');
  }
  return context;
};

export const useSocket = usePusher;