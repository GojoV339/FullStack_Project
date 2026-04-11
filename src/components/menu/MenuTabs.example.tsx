/**
 * MenuTabs Component Usage Example
 * 
 * This file demonstrates how to use the MenuTabs component in the menu page.
 */

import { useState } from 'react';
import MenuTabs from './MenuTabs';
import type { MenuItemData } from '@/types';

export default function MenuPageExample() {
  const [activeTab, setActiveTab] = useState<'SNACK' | 'COOK_TO_ORDER'>('SNACK');
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);

  // Filter items based on active tab
  const filteredItems = menuItems.filter((item) => item.section === activeTab);

  return (
    <div>
      {/* MenuTabs Component */}
      <MenuTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        items={menuItems}
      />

      {/* Display filtered items */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {filteredItems.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}
