'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingBag, User } from 'lucide-react';

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
      <div
        className="safe-bottom"
        style={{
          background: 'rgba(238, 238, 238, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(181, 3, 70, 0.15)',
          boxShadow: '0 -4px 20px rgba(181, 3, 70, 0.08)',
        }}
      >
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
                <motion.div className="relative" whileTap={{ scale: 0.85 }}>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -inset-2 rounded-xl"
                      style={{ background: 'rgba(181, 3, 70, 0.12)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={22}
                    className="relative z-10 transition-colors"
                    style={{ color: isActive ? '#b50346' : '#ABABAB' }}
                  />
                </motion.div>
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: isActive ? '#b50346' : '#ABABAB' }}
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
