'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChefHat, ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      toast.success('Staff login successful!');
      router.push('/staff/dashboard');
    } catch {
      toast.error('Network error');
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen gradient-dark flex flex-col items-center justify-center p-6">
        <button onClick={() => router.push('/')} className="absolute top-6 left-6 text-white/40 safe-top">
          <ArrowLeft size={24} />
        </button>

        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
          <ChefHat size={32} className="text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Staff Login</h1>
        <p className="text-white/40 text-sm mb-8">Canteen management dashboard</p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@amrita.edu" className="input-field" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" className="input-field" required />
          <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={isLoading}
            className="btn-primary w-full">
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <p className="text-white/20 text-xs mt-6">Demo: admin@amrita.edu / admin123</p>
      </div>
    </PageTransition>
  );
}
