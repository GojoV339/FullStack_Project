'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { User, LogOut, Crown, Bell, Shield, HelpCircle, ChevronRight, X } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { SectionErrorBoundary } from '@/components/error';
import { toast } from 'sonner';

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
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.label === 'Notifications') {
      setActiveModal('notifications');
    } else if (item.label === 'Privacy') {
      setActiveModal('privacy');
    } else if (item.label === 'Help') {
      setActiveModal('help');
    }
  };

  const menuItems = [
    { icon: Crown, label: 'Priority Pass', desc: 'Get exclusive deals', color: '#F59E0B', bg: '#FEF3C7', href: '/priority-pass' },
    { icon: Bell, label: 'Notifications', desc: 'Get order alerts', color: '#3B82F6', bg: '#DBEAFE', href: null },
    { icon: Shield, label: 'Privacy', desc: 'Data & permissions', color: '#10B981', bg: '#D1FAE5', href: null },
    { icon: HelpCircle, label: 'Help', desc: 'FAQs & contact', color: '#8B5CF6', bg: '#EDE9FE', href: null },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#eeeeee] p-6 safe-top pb-28">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">Profile</h1>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mb-6 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-5 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #b50346, #d45c7e)' }}
          />
          <div className="flex items-center gap-4 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #b50346, #d45c7e)' }}
            >
              <User size={28} className="text-[#2D2D2D]" />
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
              onClick={() => handleMenuClick(item)}
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

        {/* Modals */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-[#eeeeee] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#1A1A2E]">
                  {activeModal === 'notifications' && 'Notifications'}
                  {activeModal === 'privacy' && 'Privacy & Data'}
                  {activeModal === 'help' && 'Help & Support'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {activeModal === 'notifications' && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-[#e0e0e0] rounded-xl">
                      <div>
                        <p className="font-semibold text-[#1A1A2E] text-sm">Order Updates</p>
                        <p className="text-xs text-[#6B7280]">Get notified when your order is ready</p>
                      </div>
                      <div className="w-12 h-6 bg-[#b50346] rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-[#eeeeee] rounded-full shadow-sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#e0e0e0] rounded-xl">
                      <div>
                        <p className="font-semibold text-[#1A1A2E] text-sm">Promotional Offers</p>
                        <p className="text-xs text-[#6B7280]">Special deals and discounts</p>
                      </div>
                      <div className="w-12 h-6 bg-[#b50346] rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-[#eeeeee] rounded-full shadow-sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#F3F4F6] rounded-xl">
                      <div>
                        <p className="font-semibold text-[#1A1A2E] text-sm">Cafeteria Status</p>
                        <p className="text-xs text-[#6B7280]">Open/closed notifications</p>
                      </div>
                      <div className="w-12 h-6 bg-[#D1D5DB] rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-[#eeeeee] rounded-full shadow-sm" />
                      </div>
                    </div>
                  </>
                )}

                {activeModal === 'privacy' && (
                  <>
                    <div className="p-4 bg-[#e0e0e0] rounded-xl">
                      <p className="font-semibold text-[#1A1A2E] text-sm mb-2">Data Collection</p>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        We collect your order history and preferences to improve your experience. 
                        Your data is stored securely and never shared with third parties.
                      </p>
                    </div>
                    <div className="p-4 bg-[#e0e0e0] rounded-xl">
                      <p className="font-semibold text-[#1A1A2E] text-sm mb-2">Payment Information</p>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        We do not store your payment details. All transactions are processed 
                        securely through our payment partners.
                      </p>
                    </div>
                    <button 
                      onClick={() => toast.success('Privacy settings saved')}
                      className="w-full py-3 bg-[#b50346] text-[#eeeeee] rounded-xl font-semibold text-sm"
                    >
                      Save Preferences
                    </button>
                  </>
                )}

                {activeModal === 'help' && (
                  <>
                    <div className="space-y-3">
                      <details className="group">
                        <summary className="flex items-center justify-between p-4 bg-[#e0e0e0] rounded-xl cursor-pointer list-none">
                          <span className="font-semibold text-[#1A1A2E] text-sm">How do I place an order?</span>
                          <ChevronRight size={16} className="text-[#b50346] group-open:rotate-90 transition-transform" />
                        </summary>
                        <p className="px-4 pb-4 text-xs text-[#6B7280] leading-relaxed">
                          Browse the menu, add items to your cart, and proceed to checkout. 
                          Pay using UPI or card, then track your order in real-time.
                        </p>
                      </details>
                      <details className="group">
                        <summary className="flex items-center justify-between p-4 bg-[#e0e0e0] rounded-xl cursor-pointer list-none">
                          <span className="font-semibold text-[#1A1A2E] text-sm">What is Priority Pass?</span>
                          <ChevronRight size={16} className="text-[#b50346] group-open:rotate-90 transition-transform" />
                        </summary>
                        <p className="px-4 pb-4 text-xs text-[#6B7280] leading-relaxed">
                          Priority Pass gives you access to exclusive premium items and faster 
                          preparation times. Subscribe in the Priority Pass section.
                        </p>
                      </details>
                      <details className="group">
                        <summary className="flex items-center justify-between p-4 bg-[#e0e0e0] rounded-xl cursor-pointer list-none">
                          <span className="font-semibold text-[#1A1A2E] text-sm">Contact Support</span>
                          <ChevronRight size={16} className="text-[#b50346] group-open:rotate-90 transition-transform" />
                        </summary>
                        <p className="px-4 pb-4 text-xs text-[#6B7280] leading-relaxed">
                          Email: support@amritafeast.edu<br/>
                          Phone: +91 98765 43210<br/>
                          Available: Mon-Fri, 9AM - 6PM
                        </p>
                      </details>
                    </div>
                    <button 
                      onClick={() => toast.success('Support team will contact you soon')}
                      className="w-full py-3 bg-[#b50346] text-[#eeeeee] rounded-xl font-semibold text-sm"
                    >
                      Contact Support
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
