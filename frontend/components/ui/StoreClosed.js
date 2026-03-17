'use client';

import { Clock, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { useSocket } from '@/contexts/PusherContext';

export default function StoreClosed() {
  const { storeStatus } = useSocket();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-elegant border border-border">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
          </div>
          
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">
            We're Currently Closed
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Sorry, we're not accepting orders right now. Please check back during our operating hours.
          </p>

          
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-destructive font-semibold text-sm sm:text-base">
              <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-destructive animate-pulse"></span>
              <span>Store is {storeStatus ? 'OPEN' : 'CLOSED'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This page updates automatically when status changes
            </p>
          </div>

          <div className="bg-muted rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-left">
            <h3 className="font-bold text-foreground mb-3 text-sm sm:text-base">Operating Hours</h3>
            <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <p>Monday - Friday: 8:00 AM - 9:00 PM</p>
              <p>Saturday: 9:00 AM - 9:00 PM</p>
              <p>Sunday: 10:00 AM - 8:00 PM</p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>support@campusbites.com</span>
            </div>
          </div>

          {/* <Link
            href="/"
            className="inline-block text-sm sm:text-base text-secondary font-semibold hover:underline"
          >
            ← Back to Home
          </Link> */}
        </div>
      </div>
    </div>
  );
}