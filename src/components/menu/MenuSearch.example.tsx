/**
 * MenuSearch Component Usage Example
 * 
 * This file demonstrates how to use the MenuSearch component in the menu page.
 */

import { useState } from 'react';
import MenuSearch from './MenuSearch';
import type { MenuItemData } from '@/types';

export default function MenuPageWithSearchExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);

  // Filter items based on search query (case-insensitive)
  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery)
  );

  return (
    <div>
      {/* MenuSearch Component */}
      <MenuSearch onSearch={setSearchQuery} />

      {/* Display filtered items */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id}>{item.name}</div>
          ))
        ) : (
          <div className="col-span-2 text-center text-[#2D2D2D]/60 py-8">
            No items match your search
          </div>
        )}
      </div>
    </div>
  );
}
