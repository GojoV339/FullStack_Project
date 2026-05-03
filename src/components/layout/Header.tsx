'use client';

import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Search, ShoppingBasket } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showCart?: boolean;
  onCartClick?: () => void;
}

export default function Header({
  title,
  showBack = true,
  showSearch = false,
  searchQuery = '',
  onSearchChange,
  showCart = false,
  onCartClick,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="sticky top-0 z-20 glass safe-top">
      <div className="px-4 pt-4 pb-3">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            {showBack && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBack}
                className="text-[#2D2D2D]/50 hover:text-[#2D2D2D] transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={22} />
              </motion.button>
            )}
            {title && (
              <h1 className="text-lg font-bold text-[#2D2D2D] truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Cart Button (Header variant) */}
          {showCart && itemCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onCartClick}
              className="relative ml-2"
              aria-label={`Cart with ${itemCount} items`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#eeeeee]/5 hover:bg-[#eeeeee]/10 transition-colors flex items-center justify-center">
                <ShoppingBasket size={20} className="text-[#2D2D2D]" />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary text-[#2D2D2D] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </div>
            </motion.button>
          )}
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/30"
            />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="input-field pl-9 py-2.5 text-sm"
              aria-label="Search menu items"
            />
          </div>
        )}
      </div>
    </header>
  );
}
