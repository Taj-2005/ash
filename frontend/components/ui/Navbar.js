"use client";
import {
  Search,
  Bell,
  ShoppingCart,
  User,
  Menu,
  X,
  LayoutDashboard,
  BellOff,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useSocket } from "@/contexts/PusherContext";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount, setShowCart } = useCart();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);

  
  const isVendorPage = pathname === "/vendor";

  
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  useEffect(() => {
    if (showMobileMenu || showNotifications) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobileMenu, showNotifications]);

  
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        alert("✅ Notifications enabled! You'll now receive order updates.");
      } else if (permission === "denied") {
        alert(
          "❌ Notifications blocked. Please enable them in your browser settings to receive order updates."
        );
      }
    } else {
      alert("❌ Your browser doesn't support notifications.");
    }
  };


  const handleNotificationClick = () => {
    if ("Notification" in window && Notification.permission === "default") {
      const enable = confirm(
        "🔔 Enable browser notifications to get real-time updates about your orders!\n\nClick OK to enable notifications."
      );
      if (enable) {
        requestNotificationPermission();
      }
    } else if (
      "Notification" in window &&
      Notification.permission === "denied"
    ) {
      alert(
        "🔔 Notifications are blocked!\n\n" +
          "To enable notifications:\n" +
          "1. Click the lock icon in your browser's address bar\n" +
          '2. Find "Notifications" in the permissions\n' +
          '3. Change it to "Allow"\n' +
          "4. Refresh the page"
      );
    }

    setShowNotifications(!showNotifications);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            >
              <div className="text-xl sm:text-2xl">🍔</div>
              <div className="hidden sm:block">
                <h1 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  Campus Bites
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Open until 9 PM
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="font-serif text-base font-bold text-foreground">
                  Campus Bites
                </h1>
              </div>
            </Link>

            
            {user?.role !== "VENDOR" && (
              <div className="hidden md:flex flex-1 max-w-2xl">
                <form onSubmit={handleSearch} className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for dishes..."
                    className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                  />
                </form>
              </div>
            )}

           
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <>
                 
                  {user.role === "VENDOR" && !isVendorPage && (
                    <Link
                      href="/vendor"
                      className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Vendor Dashboard
                    </Link>
                  )}

                
                  <button
                    onClick={() => {
                      setShowMobileMenu(!showMobileMenu);
                      setShowNotifications(false); 
                    }}
                    className="md:hidden p-2 hover:bg-muted rounded-full transition-colors"
                    aria-label="Toggle menu"
                  >
                    {showMobileMenu ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </button>

                
                  {user.role !== "VENDOR" && (
                    <div className="hidden md:flex items-center gap-4">
                     
                      <div className="relative" ref={notificationRef}>
                        <button
                          onClick={handleNotificationClick}
                          className="relative p-2 hover:bg-muted rounded-full transition-colors"
                          title="Notifications"
                        >
                          {notificationPermission === "denied" ? (
                            <BellOff className="w-6 h-6 text-muted-foreground" />
                          ) : (
                            <Bell className="w-6 h-6 text-foreground" />
                          )}
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </button>

                       
                        {showNotifications && (
                          <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-xl shadow-2xl max-h-[32rem] overflow-hidden z-50">
                          
                            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-foreground">
                                  Notifications
                                </h3>
                                {notificationPermission === "denied" && (
                                  <button
                                    onClick={requestNotificationPermission}
                                    className="text-xs text-red-500 hover:underline"
                                    title="Enable browser notifications"
                                  >
                                    🔴 Blocked
                                  </button>
                                )}
                              </div>
                              {notifications.length > 0 && (
                                <button
                                  onClick={markAllAsRead}
                                  className="text-xs text-secondary hover:underline font-semibold"
                                >
                                  Mark all as read
                                </button>
                              )}
                            </div>

                          
                            <div className="overflow-y-auto max-h-[28rem] divide-y divide-border">
                              {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                  <p className="text-muted-foreground font-medium">
                                    No notifications yet
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    You'll be notified when your order status
                                    changes
                                  </p>
                                </div>
                              ) : (
                                notifications.map((notification) => (
                                  <Link
                                    key={notification.id}
                                    href={
                                      notification.orderId
                                        ? `/order-tracking?orderId=${notification.orderId}`
                                        : "#"
                                    }
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      setShowNotifications(false);
                                    }}
                                    className={`block p-4 hover:bg-muted transition-colors ${
                                      !notification.read
                                        ? "bg-secondary/5 border-l-4 border-l-secondary"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                          !notification.read
                                            ? "bg-secondary"
                                            : "bg-transparent"
                                        }`}
                                      />
                                      <div className="flex-1 min-w-0">
                                        {notification.orderId && (
                                          <p className="font-semibold text-foreground text-sm mb-1">
                                            Order #{notification.orderId}
                                          </p>
                                        )}
                                        <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                                          {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatTimestamp(
                                            notification.timestamp
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                                ))
                              )}
                            </div>

                            
                            {notificationPermission !== "granted" && (
                              <div className="p-3 bg-muted/50 border-t border-border">
                                <button
                                  onClick={requestNotificationPermission}
                                  className="w-full text-xs text-center text-secondary hover:underline font-semibold"
                                >
                                  🔔 Enable browser notifications for real-time
                                  updates
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Link
                        href="/profile"
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                        title="Profile"
                      >
                        <User className="w-6 h-6 text-foreground" />
                      </Link>
                    </div>
                  )}

                 
                  {user.role !== "VENDOR" && (
                    <button
                      onClick={() => setShowCart(true)}
                      className="relative p-2 hover:bg-muted rounded-full transition-colors"
                      title="Cart"
                    >
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                      {getCartCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {getCartCount()}
                        </span>
                      )}
                    </button>
                  )}

                  
                  {user.role === "VENDOR" && (
                    <Link
                      href="/profile"
                      className="hidden md:block p-2 hover:bg-muted rounded-full transition-colors"
                      title="Profile"
                    >
                      <User className="w-6 h-6 text-foreground" />
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="px-4 sm:px-6 py-2 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base"
                  >
                    Sign In
                  </button>

                  <button
                    onClick={() => setShowCart(true)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    title="Cart"
                  >
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  </button>
                </>
              )}
            </div>
          </div>

        
          {user?.role !== "VENDOR" && (
            <div className="md:hidden mt-3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for dishes..."
                  className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-secondary transition-all text-sm"
                />
              </form>
            </div>
          )}
        </div>
      </header>

      
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />

         
          <div
            ref={mobileMenuRef}
            className="absolute top-0 right-0 h-full w-[80%] max-w-sm bg-card shadow-elegant-lg overflow-y-auto"
            style={{ animation: "slideInRight 0.3s ease-out" }}
          >
            <div className="flex flex-col h-full">
              
              <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                <h2 className="font-bold text-lg">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {user?.role === "VENDOR" ? (
                    <>
                      {!isVendorPage && (
                        <Link
                          href="/vendor"
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span className="font-medium">Vendor Dashboard</span>
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowNotifications(true);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                      >
                        {notificationPermission === "denied" ? (
                          <BellOff className="w-5 h-5" />
                        ) : (
                          <Bell className="w-5 h-5" />
                        )}
                        <span className="font-medium">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="fixed inset-0 z-[60] md:hidden">
          
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />

         
          <div
            className="absolute top-0 right-0 h-full w-full max-w-sm bg-card shadow-elegant-lg overflow-hidden"
            style={{
              WebkitOverflowScrolling: "touch", 
              pointerEvents: "auto", 
            }}
            onClick={(e) => e.stopPropagation()}
          >
           
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifications(false);
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors active:opacity-70"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-foreground">Notifications</h3>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="text-xs text-secondary hover:underline font-semibold active:opacity-70 touch-manipulation px-2 py-1"
                >
                  Mark all read
                </button>
              )}
            </div>

         
            <div
              className="overflow-y-auto h-[calc(100%-5rem)] divide-y divide-border"
              style={{
                WebkitOverflowScrolling: "touch", 
                pointerEvents: "auto", 
              }}
            >
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium mb-2">
                    No notifications yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You'll be notified when your order status changes
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                      setShowNotifications(false);
                      setTimeout(() => {
                        if (notification.orderId) {
                          router.push(
                            `/order-tracking?orderId=${notification.orderId}`
                          );
                        }
                      }, 100);
                    }}
                    className={`w-full text-left block p-4 active:bg-muted transition-colors cursor-pointer touch-manipulation ${
                      !notification.read
                        ? "bg-secondary/5 border-l-4 border-l-secondary"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 pointer-events-none">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          !notification.read ? "bg-secondary" : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        {notification.orderId && (
                          <p className="font-semibold text-foreground text-sm mb-1">
                            Order #{notification.orderId}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

           
            {notificationPermission !== "granted" && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-muted/50 border-t border-border">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    requestNotificationPermission();
                  }}
                  className="w-full text-xs text-center text-secondary hover:underline font-semibold touch-manipulation py-2"
                >
                  🔔 Enable browser notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
