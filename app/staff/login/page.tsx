'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChefHat, ArrowLeft, LogIn } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleQuickLogin = () => {
    setEmail('admin@amrita.edu');
    setPassword('admin123');
    toast.success('Admin credentials entered');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicit validation
    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      toast.success('Staff login successful!');
      router.push('/staff/dashboard');
    } catch (err) {
      toast.error('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen gradient-dark flex flex-col items-center justify-center p-6 relative">
        <button 
          onClick={() => router.push('/')} 
          className="absolute top-6 left-6 text-[#2D2D2D]/40 safe-top hover:text-[#2D2D2D]/60 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-16 h-16 bg-[#eeeeee]/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner"
        >
          <ChefHat size={32} className="text-[#b50346]" />
        </motion.div>

        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-1">Staff Access</h1>
        <p className="text-[#2D2D2D]/40 text-sm mb-8 text-center">Manage your canteen orders in real-time</p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2D2D]/60 ml-1 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@amrita.edu" 
                className="input-field w-full" 
                autoComplete="email"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2D2D]/60 ml-1 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="input-field w-full" 
                autoComplete="current-password"
                required 
              />
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 group mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#eeeeee]/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                <span>Enter Dashboard</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-10 pt-8 border-t border-[rgba(181,3,70,0.1)] w-full max-w-xs">
          <button
            onClick={handleQuickLogin}
            className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-[rgba(181,3,70,0.2)] bg-[#b50346]/5 text-[#b50346] text-sm font-semibold hover:bg-[#b50346]/10 transition-all flex flex-col items-center gap-1.5 group"
          >
            <span className="group-hover:scale-105 transition-transform">Quick Demo Login</span>
            <span className="text-[10px] text-[#2D2D2D]/40 font-normal">Auto-fills: admin@amrita.edu / admin123</span>
          </button>
        </div>

        <p className="absolute bottom-10 text-[#2D2D2D]/20 text-[10px] uppercase tracking-widest">
          Amrita Feast • Staff Portal
        </p>
      </div>
    </PageTransition>
  );
}
