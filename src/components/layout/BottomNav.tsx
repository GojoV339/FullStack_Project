'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, UtensilsCrossed } from 'lucide-react';

const navItems = [
  { href: '/cafeteria', icon: Home, label: 'Home' },
  { href: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { href: '/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-white/10 safe-bottom">
        <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 py-1 px-3 min-w-[64px]"
              >
                <motion.div
                  className="relative"
                  whileTap={{ scale: 0.85 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -inset-2 gradient-primary rounded-xl opacity-20"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={22}
                    className={`relative z-10 transition-colors ${
                      isActive ? 'text-primary' : 'text-white/40'
                    }`}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-white/40'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
