'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { ArrowLeft, Search, Zap, Flame } from 'lucide-react';
import FoodCard from '@/components/menu/FoodCard';
import CartButton from '@/components/menu/CartButton';
import PageTransition from '@/components/layout/PageTransition';
import { SectionErrorBoundary } from '@/components/error';
import { api } from '@/lib/api-client';
import type { MenuItemData } from '@/types';

type Tab = 'snacks' | 'cookToOrder';

export default function MenuPage() {
  return (
    <SectionErrorBoundary section="Menu">
      <MenuPageContent />
    </SectionErrorBoundary>
  );
}

function MenuPageContent() {
  const [menuData, setMenuData] = useState<{
    combos: MenuItemData[];
    snacks: MenuItemData[];
    cookToOrder: MenuItemData[];
    specialOffers: MenuItemData[];
    isSubscribed: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('snacks');
  const [searchQuery, setSearchQuery] = useState('');
  const cafeteriaId = useCartStore((s) => s.cafeteriaId);
  const cafeteriaName = useCartStore((s) => s.cafeteriaName);
  const router = useRouter();

  useEffect(() => {
    if (!cafeteriaId) {
      router.replace('/cafeteria');
      return;
    }

    const fetchMenu = async () => {
      try {
        const data = await api.get<{
          combos: MenuItemData[];
          snacks: MenuItemData[];
          cookToOrder: MenuItemData[];
          specialOffers: MenuItemData[];
          isSubscribed: boolean;
        }>(`/api/menu/${cafeteriaId}`);
        setMenuData(data);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [cafeteriaId, router]);

  const filteredItems = (items: MenuItemData[]) => {
    if (!searchQuery) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const currentItems =
    activeTab === 'snacks'
      ? filteredItems(menuData?.snacks || [])
      : filteredItems(menuData?.cookToOrder || []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#eeeeee] pb-32">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#eeeeee] border-b border-[rgba(181,3,70,0.1)] shadow-sm safe-top">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => router.push('/cafeteria')}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#e0e0e0] text-[#b50346]"
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <div>
                  <h1 className="text-lg font-bold text-[#1A1A2E]">
                    {cafeteriaName || 'Menu'}
                  </h1>
                  <p className="text-xs text-[#6B7280]">Pick your favorites</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 py-2.5 pr-4 text-sm rounded-xl bg-[#eeeeee] border border-[rgba(181,3,70,0.15)] text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#b50346] focus:ring-2 focus:ring-[rgba(181,3,70,0.15)] transition-all"
              />
            </div>

            {/* Animated Tabs */}
            <div className="flex gap-1 relative bg-[#e0e0e0] p-1 rounded-xl">
              {[
                { key: 'snacks' as Tab, label: 'Ready Now', icon: Zap },
                { key: 'cookToOrder' as Tab, label: 'Cook to Order', icon: Flame },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5`}
                >
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 bg-[#eeeeee] rounded-lg shadow-sm"
                      style={{ boxShadow: '0 2px 8px rgba(181,3,70,0.15)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    size={14}
                    className={`relative z-10 transition-colors ${
                      activeTab === tab.key ? 'text-[#b50346]' : 'text-[#9CA3AF]'
                    }`}
                  />
                  <span
                    className={`relative z-10 transition-colors ${
                      activeTab === tab.key ? 'text-[#1A1A2E] font-semibold' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Combos Section */}
        {menuData?.combos && menuData.combos.length > 0 && !searchQuery && (
          <div className="px-4 mt-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="section-badge-combo">🎁 COMBOS</span>
              <span className="text-[#6B7280] text-xs">Save more!</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              {menuData.combos.map((combo) => (
                <div key={combo.id} className="min-w-[180px] max-w-[180px]">
                  <FoodCard item={combo} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Grid */}
        <div className="px-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={
                activeTab === 'snacks'
                  ? 'section-badge-snack'
                  : 'section-badge-cook'
              }
            >
              {activeTab === 'snacks' ? '⚡ READY NOW' : '🔥 COOK TO ORDER'}
            </span>
            <span className="text-[#6B7280] text-xs">
              {activeTab === 'snacks'
                ? 'Grab & go'
                : 'Freshly prepared for you'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton h-52" />
              ))}
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl">🍽️</span>
              <p className="text-[#6B7280] mt-3 text-sm">
                {searchQuery ? 'No items match your search' : 'No items available'}
              </p>
              {searchQuery && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-[#b50346] text-sm font-medium"
                >
                  Clear search
                </motion.button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                {currentItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <FoodCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Special Offers (Priority Only) */}
        {menuData?.specialOffers &&
          menuData.specialOffers.length > 0 &&
          !searchQuery && (
            <div className="px-4 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full text-xs font-semibold border border-[#FDE68A]">
                  ⭐ PRIORITY PASS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {menuData.specialOffers.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    isLocked={!menuData.isSubscribed}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Cart Button */}
        <CartButton />
      </div>
    </PageTransition>
  );
}
