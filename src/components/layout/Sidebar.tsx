'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingBag, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/cafeteria', icon: Home, label: 'Home' },
  { href: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { student, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col glass border-r border-[#eeeeee]/10 z-40">
      {/* User Profile Section */}
      <div className="p-6 border-b border-[#eeeeee]/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
            <User size={24} className="text-[#2D2D2D]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#2D2D2D] truncate">
              {student?.name || 'Student'}
            </p>
            <p className="text-xs text-[#2D2D2D]/50 truncate">
              {student?.registrationNumber || 'Not logged in'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative block"
            >
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'text-[#2D2D2D]' : 'text-[#2D2D2D]/50 hover:text-[#2D2D2D]/80'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 gradient-primary rounded-xl opacity-20"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="relative z-10 font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#eeeeee]/10">
        <motion.button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[#2D2D2D]/50 hover:text-[#2D2D2D]/80 hover:bg-[#eeeeee]/5 transition-colors"
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}
