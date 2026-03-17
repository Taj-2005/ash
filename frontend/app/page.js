'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MenuCard from '@/components/ui/MenuCard';
import CartSidebar from '@/components/ui/CartSidebar';
import StoreClosed from '@/components/ui/StoreClosed';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/PusherContext';

function HomeContent() {
  const categories = ['All', 'Pizza', 'Rolls', 'Beverages', 'Desserts', 'Sandwiches', 'Snacks', 'Pasta'];
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { user } = useAuth();
  
  const { storeStatus, storeStatusLoading } = useSocket();

  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await api.getMenuItems();

      const formatted = data.map(item => {
        let imageUrl = null;
        let isEmoji = false;
        
        if (item.imageUrl) {
          const isEmojiCheck = item.imageUrl.length <= 2 && !item.imageUrl.startsWith('/') && !item.imageUrl.startsWith('http');
          
          if (isEmojiCheck) {
            isEmoji = true;
            imageUrl = item.imageUrl;
          } else if (item.imageUrl.startsWith('http')) {
            imageUrl = item.imageUrl;
          } else {
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')) || 'https://campus-bites-server.vercel.app';
            const imagePath = item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl}`;
            imageUrl = `${baseUrl}${imagePath}`;
          }
        }
        
        return {
          ...item,
          imageUrl,
          isEmoji,
        };
      });

      setMenuItems(formatted);
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  if (storeStatusLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-secondary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Checking store status...</p>
        </div>
      </div>
    );
  }

  if (storeStatus === false && user?.role !== 'VENDOR') {
    return <StoreClosed />;
  }

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-b from-muted to-background py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Elevated Campus Dining
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Order from anywhere on campus, pick up fresh when ready
          </p>
          {searchQuery && (
            <p className="mt-4 text-secondary font-semibold text-sm sm:text-base">
              Showing results for: "{searchQuery}"
            </p>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 sm:gap-3 pb-4 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-secondary text-secondary-foreground shadow-lg scale-105'
                      : 'bg-card text-foreground hover:bg-muted border border-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading delicious items...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? `No items found for "${searchQuery}"`
                : 'No items found in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <CartSidebar />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-secondary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}