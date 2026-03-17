'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, ShoppingBag, LogOut, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchOrders();
  }, [token, authLoading]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://campus-bites-server.vercel.app/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
    
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          <h1 className="font-serif text-2xl font-bold text-foreground">My Profile</h1>
        </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
     
        <div className="bg-card rounded-2xl p-6 shadow-elegant mb-6 border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-2xl font-bold text-foreground">{user.name}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-secondary/10 text-secondary text-sm font-semibold rounded-full">
                {user.role}
              </span>
            </div>
          </div>

         
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">
                {orders.filter(o => o.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>

      
        <div className="bg-card rounded-2xl p-6 shadow-elegant mb-6 border border-border">
          <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Recent Orders
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Link
                href="/"
                className="inline-block bg-secondary text-secondary-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Start Ordering
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/order-tracking?orderId=${order.id}`}
                  className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-foreground">Order #{order.id}</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                        order.status === 'READY' ? 'bg-blue-500/10 text-blue-600' :
                        order.status === 'PROCESSING' ? 'bg-yellow-500/10 text-yellow-600' :
                        order.status === 'CANCELLED' ? 'bg-destructive/10 text-destructive' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} • ₹{parseFloat(order.total).toFixed(2)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              ))}

              {/* {orders.length > 5 && (
                <button className="w-full text-secondary font-semibold py-2 hover:underline">
                  View All Orders
                </button>
              )} */}
            </div>
          )}
        </div>

      
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full block bg-secondary text-secondary-foreground py-3 rounded-xl font-semibold text-center hover:opacity-90 transition"
          >
            Back to Home
          </Link>
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-card text-destructive py-3 rounded-xl font-semibold border-2 border-destructive hover:bg-destructive/5 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

     
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full border border-border shadow-elegant-lg">
            <h3 className="font-serif text-xl font-bold mb-2 text-foreground">Confirm Logout</h3>
            <p className="text-muted-foreground mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-muted text-foreground py-2 rounded-lg font-semibold hover:bg-muted/80 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}