'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Lock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { MenuItemData } from '@/types';

interface FoodCardProps {
  item: MenuItemData;
  isLocked?: boolean;
}

const categoryEmoji: Record<string, string> = {
  'Snacks': '🥟',
  'Beverages': '☕',
  'Packaged': '🍪',
  'Fruits': '🍌',
  'South Indian': '🥘',
  'Rice': '🍚',
  'North Indian': '🫓',
  'Kerala': '🥙',
  'Combo': '🎁',
  'Chinese': '🍜',
};

// Maps menu item names (lowercased, normalized) to local image paths
const itemImageMap: Record<string, string> = {
  'samosa': '/images/menu/Samosa.jpg',
  'veg puff': '/images/menu/Veg_Puff.jpg',
  'egg puff': '/images/menu/Egg_puff.jpg',
  'paneer puff': '/images/menu/Paneer_Puff.jpg',
  'filter coffee': '/images/menu/Filter_Coffee.jpg',
  'lemon tea': '/images/menu/Lemon_Tea.jpg',
  'frooti / cold drink': '/images/menu/Frooti.jpg',
  'frooti': '/images/menu/Frooti.jpg',
  'banana': '/images/menu/Banana.jpg',
  'apple': '/images/menu/Apple.jpg',
  'chips packet': '/images/menu/Potato_chips.jpg',
  'buttermilk': '/images/menu/Buttermilk.jpg',
  'butter milk': '/images/menu/Buttermilk.jpg',
  'dosa combo (masala dosa + filter coffee)': '/images/menu/Dosa_Combo.png',
  'south indian breakfast (idli + vada + pongal + chai)': '/images/menu/South_Indian_Breakfast.jpg',
  'north indian meal (chapati + sabzi + rice + curd)': '/images/menu/North_Indian_Meal.jpg',
  'bread omelette': '/images/menu/Bread_Omelette.jpg',
  'chocolate bar': '/images/menu/Chocolate_Bar.jpg',
  'masala chai': '/images/menu/Masala_Chai.jpg',
  'biscuit / parle-g': '/images/menu/Parle_G.jpg',
  'parle-g': '/images/menu/Parle_G.jpg',
  'parle': '/images/menu/Parle_G.jpg',
};

function getItemImage(item: MenuItemData): string | null {
  // First check the explicit map by normalized name
  const normalized = item.name.toLowerCase().trim();
  if (itemImageMap[normalized]) return itemImageMap[normalized];

  // Fuzzy match: check if any key is contained in the item name
  for (const [key, path] of Object.entries(itemImageMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return path;
    }
  }

  // Fall back to imageUrl from database if available
  if (item.imageUrl) return item.imageUrl;

  return null;
}

export default function FoodCard({ item, isLocked = false }: FoodCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const quantity = useCartStore((s) => s.getItemQuantity(item.id));

  const handleAdd = () => {
    addItem(item);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const imageSrc = getItemImage(item);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={!isLocked ? { scale: 0.97 } : {}}
      className="glass-card overflow-hidden relative flex flex-col"
    >
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#eeeeee]/80 backdrop-blur-sm rounded-2xl">
          <div className="text-center px-3">
            <div className="w-10 h-10 rounded-full bg-[#e0e0e0] flex items-center justify-center mx-auto mb-2">
              <Lock size={18} className="text-[#8a0235]" />
            </div>
            <p className="text-xs font-semibold text-[#8a0235]">Priority Pass</p>
            <p className="text-[10px] text-[#8A8A8A] mt-0.5">Only for subscribers</p>
          </div>
        </div>
      )}

      {/* Food Image */}
      <div className="h-28 relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#e0e0e0] to-[#d6d6d6] shrink-0">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              // Show emoji fallback
              const fallback = el.parentElement?.querySelector('.emoji-fallback') as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Emoji fallback — always rendered, hidden when image exists */}
        <div
          className="emoji-fallback absolute inset-0 flex items-center justify-center"
          style={{ display: imageSrc ? 'none' : 'flex' }}
        >
          <span className="text-5xl">
            {categoryEmoji[item.category] || '🍽️'}
          </span>
        </div>

        {item.isCombo ? (
          <div className="absolute top-2 left-2 section-badge-combo text-[10px] py-0.5">COMBO</div>
        ) : item.section === 'SNACK' ? (
          <div className="absolute top-2 left-2 section-badge-snack text-[10px] py-0.5">READY</div>
        ) : (
          <div className="absolute top-2 left-2 section-badge-cook text-[10px] py-0.5">COOK</div>
        )}

        {item.etaMinutes > 0 && (
          <div className="absolute top-2 right-2 bg-[#eeeeee]/90 px-2 py-0.5 rounded-full text-[10px] text-[#2F6F73] font-medium shadow-sm">
            ~{item.etaMinutes}m
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-[#2D2D2D] leading-tight line-clamp-2 flex-1">
          {item.name}
        </h3>
        <p className="text-[10px] text-[#8A8A8A] mt-0.5">{item.category}</p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-extrabold text-[#8a0235]">₹{item.price}</span>

          {!isLocked && (
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={handleAdd}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #b50346, #d45c7e)',
                    boxShadow: '0 2px 8px rgba(181, 3, 70, 0.30)',
                  }}
                >
                  <Plus size={16} className="text-[#2D2D2D]" />
                </motion.button>
              ) : (
                <motion.div
                  key="controls"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  layout
                  className="flex items-center gap-1.5 bg-[#e0e0e0] rounded-lg px-1.5 py-0.5 border border-[rgba(181, 3, 70, 0.2)]"
                >
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-[#b50346]"
                  >
                    <Minus size={13} />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-bold text-[#b50346] min-w-[16px] text-center"
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-[#b50346]"
                  >
                    <Plus size={13} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
