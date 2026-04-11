'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuSearchProps {
  onSearch: (query: string) => void;
}

export default function MenuSearch({ onSearch }: MenuSearchProps) {
  const [inputValue, setInputValue] = useState('');

  // Debounce the search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(inputValue.toLowerCase().trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  const handleClear = () => {
    setInputValue('');
  };

  return (
    <div className="relative">
      <div className="relative glass rounded-2xl overflow-hidden">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
          <Search size={20} />
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search menu items..."
          className="w-full bg-transparent border-none pl-12 pr-12 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-2xl transition-all"
        />

        <AnimatePresence>
          {inputValue && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.85 }}
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
