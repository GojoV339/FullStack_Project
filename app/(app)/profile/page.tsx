'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { User, LogOut, Crown, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { SectionErrorBoundary } from '@/components/error';

export default function ProfilePage() {
  return (
    <SectionErrorBoundary section="Profile">
      <ProfilePageContent />
    </SectionErrorBoundary>
  );
}

function ProfilePageContent() {
  const student = useAuthStore((s) => s.student);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    { icon: Crown, label: 'Priority Pass', desc: 'Get exclusive deals', color: '#F59E0B', bg: '#FEF3C7', href: '/priority-pass' },
    { icon: Bell, label: 'Notifications', desc: 'Get order alerts', color: '#3B82F6', bg: '#DBEAFE', href: null },
    { icon: Shield, label: 'Privacy', desc: 'Data & permissions', color: '#10B981', bg: '#D1FAE5', href: null },
    { icon: HelpCircle, label: 'Help', desc: 'FAQs & contact', color: '#8B5CF6', bg: '#EDE9FE', href: null },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FFF8F4] p-6 safe-top pb-28">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Profile</h1>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mb-6 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-5 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}
          />
          <div className="flex items-center gap-4 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}
            >
              <User size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A2E]">
                {student?.name || 'Student'}
              </h2>
              <p className="text-[#6B7280] text-sm">
                {student?.registrationNumber || 'Not logged in'}
              </p>
              {student?.subscriptionStatus === 'ACTIVE' && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
                  <Crown size={11} /> Priority Pass Active
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-2 mb-8">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => item.href && router.push(item.href)}
              className="w-full glass-card p-4 flex items-center gap-3 text-left"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: item.bg }}
              >
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p className="text-[#1A1A2E] text-sm font-semibold">{item.label}</p>
                <p className="text-[#9CA3AF] text-xs">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-[#D1D5DB]" />
            </motion.button>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full p-4 flex items-center gap-3 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2]"
        >
          <LogOut size={20} className="text-[#EF4444]" />
          <span className="font-semibold text-sm text-[#EF4444]">Log Out</span>
        </motion.button>

        <p className="text-center text-[#D1D5DB] text-xs mt-8">Amrita Feast v1.0.0</p>
      </div>
    </PageTransition>
  );
}
