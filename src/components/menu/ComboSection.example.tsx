/**
 * Example usage of ComboSection component
 * 
 * This component displays combo meal items in a horizontal scrollable section.
 * It should be used on the menu page to highlight special combo deals.
 */

'use client';

import ComboSection from './ComboSection';
import type { MenuItemData } from '@/types';

export default function ComboSectionExample() {
  // Example combo items data
  const comboItems: MenuItemData[] = [
    {
      id: '1',
      name: 'Breakfast Combo',
      section: 'SNACK',
      category: 'Combo',
      price: 80,
      imageUrl: null,
      etaMinutes: 0,
      isCombo: true,
      isPriorityOnly: false,
      isAvailable: true,
    },
    {
      id: '2',
      name: 'Lunch Special',
      section: 'COOK_TO_ORDER',
      category: 'Combo',
      price: 120,
      imageUrl: null,
      etaMinutes: 15,
      isCombo: true,
      isPriorityOnly: false,
      isAvailable: true,
    },
    {
      id: '3',
      name: 'Snack Pack',
      section: 'SNACK',
      category: 'Combo',
      price: 60,
      imageUrl: null,
      etaMinutes: 0,
      isCombo: true,
      isPriorityOnly: false,
      isAvailable: true,
    },
  ];

  // Example: Hide combo section when search is active
  const searchQuery = '';
  const isVisible = !searchQuery; // Hide when search is active

  return (
    <div className="min-h-screen pb-32">
      <h1 className="text-2xl font-bold text-[#2D2D2D] p-4">Menu Page</h1>
      
      {/* ComboSection - Hidden when search is active */}
      <ComboSection items={comboItems} isVisible={isVisible} />
      
      {/* Rest of the menu content would go here */}
    </div>
  );
}

/**
 * Usage in menu page:
 * 
 * import ComboSection from '@/components/menu/ComboSection';
 * 
 * // In your component:
 * <ComboSection 
 *   items={menuData?.combos || []} 
 *   isVisible={!searchQuery} 
 * />
 * 
 * Props:
 * - items: Array of MenuItemData with isCombo: true
 * - isVisible: Boolean to show/hide section (typically hidden during search)
 * 
 * Features:
 * - Horizontal scrollable container
 * - 200px fixed width cards
 * - "🎁 COMBOS" badge with "Save more!" text
 * - Smooth animations with Framer Motion
 * - Automatically hidden when no items or not visible
 */
