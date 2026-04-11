'use client';

import { motion } from 'framer-motion';
import type { MenuItemData } from '@/types';

interface MenuTabsProps {
  activeTab: 'SNACK' | 'COOK_TO_ORDER';
  onTabChange: (tab: 'SNACK' | 'COOK_TO_ORDER') => void;
  items: MenuItemData[];
}

export default function MenuTabs({ activeTab, onTabChange, items }: MenuTabsProps) {
  const snackCount = items.filter((item) => item.section === 'SNACK').length;
  const cookToOrderCount = items.filter((item) => item.section === 'COOK_TO_ORDER').length;

  const tabs = [
    {
      id: 'SNACK' as const,
      label: 'Ready Now',
      emoji: '⚡',
      count: snackCount,
    },
    {
      id: 'COOK_TO_ORDER' as const,
      label: 'Cook to Order',
      emoji: '🍳',
      count: cookToOrderCount,
    },
  ];

  return (
    <div className="glass rounded-2xl p-1.5 flex gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative flex-1 py-3 px-4 rounded-xl transition-colors duration-200"
        >
          {/* Active tab background */}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 gradient-primary rounded-xl"
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            />
          )}

          {/* Tab content */}
          <div className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-base">{tab.emoji}</span>
            <span
              className={`text-sm font-semibold transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-white/60'
              }`}
            >
              {tab.label}
            </span>
            {tab.count > 0 && (
              <motion.span
                key={`${tab.id}-${tab.count}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/50'
                }`}
              >
                {tab.count}
              </motion.span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
