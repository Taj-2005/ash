'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      if (result.user.role === 'VENDOR') {
        router.push('/vendor');
      } else {
        router.push('/');
      }
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  
  const fillDemoCredentials = () => {
    setFormData({
      email: 'vendor@gmail.com',
      password: 'Vendor123!'
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-elegant border border-border">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue ordering</p>
        </div>

     
        <div className="mb-6 p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 border-2 border-secondary/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground mb-1">Demo Vendor Account</h3>
              <p className="text-xs text-muted-foreground mb-2">Try the vendor dashboard with demo credentials</p>
              <div className="bg-background/50 rounded-lg p-2 mb-2 font-mono text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground font-semibold">vendor@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Pass:</span>
                  <span className="text-foreground font-semibold">Vendor123!</span>
                </div>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs bg-secondary text-white px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Auto-fill Demo Credentials
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@university.edu"
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-secondary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-secondary transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-secondary-foreground py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-secondary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
