'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/PusherContext';
import Navbar from '@/components/ui/Navbar';
import NotificationToast from '@/components/ui/NotificationToast';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { storeStatus } = useSocket();

  
  const noNavbarPages = [
    '/auth/login',
    '/auth/signup',
    '/order-tracking',
    '/checkout',
    '/order-success',
    '/vendor',  
    '/profile'  
  ];

  
  const shouldHideNavbar = noNavbarPages.some(page => pathname?.startsWith(page));

  
 
  
  const showNavbar = !shouldHideNavbar && !(
    !storeStatus && 
    user?.role !== 'VENDOR' && 
    pathname === '/'
  );

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
      <NotificationToast />
    </>
  );
}