/**
 * Example usage of CartSheet component
 * 
 * This component displays the shopping cart as a bottom sheet on mobile
 * and a sidebar on desktop, showing all cart items with a checkout button.
 */

'use client';

import { useState } from 'react';
import CartSheet from './CartSheet';
import { useCartStore } from '@/store/cartStore';

export default function CartSheetExample() {
  const [isOpen, setIsOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);

  // Example menu items
  const exampleItems = [
    {
      id: '1',
      name: 'Masala Dosa',
      section: 'COOK_TO_ORDER' as const,
      category: 'South Indian',
      price: 50,
      imageUrl: null,
      etaMinutes: 10,
      isCombo: false,
      isPriorityOnly: false,
      isAvailable: true,
    },
    {
      id: '2',
      name: 'Filter Coffee',
      section: 'SNACK' as const,
      category: 'Beverages',
      price: 20,
      imageUrl: null,
      etaMinutes: 0,
      isCombo: false,
      isPriorityOnly: false,
      isAvailable: true,
    },
    {
      id: '3',
      name: 'Veg Biryani',
      section: 'COOK_TO_ORDER' as const,
      category: 'Rice',
      price: 80,
      imageUrl: null,
      etaMinutes: 20,
      isCombo: false,
      isPriorityOnly: false,
      isAvailable: true,
    },
  ];

  return (
    <div className="min-h-screen p-4 bg-secondary">
      <h1 className="text-2xl font-bold text-white mb-4">CartSheet Example</h1>
      
      {/* Add Items Buttons */}
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Add Items to Cart</h2>
        {exampleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => addItem(item)}
            className="btn-primary w-full"
          >
            Add {item.name} (₹{item.price})
          </button>
        ))}
      </div>

      {/* Open Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary w-full"
        disabled={items.length === 0}
      >
        Open Cart ({items.length} items)
      </button>

      {/* CartSheet Component */}
      <CartSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

/**
 * Usage in your application:
 * 
 * import { useState } from 'react';
 * import CartSheet from '@/components/cart/CartSheet';
 * 
 * function MenuPage() {
 *   const [isCartOpen, setIsCartOpen] = useState(false);
 *   
 *   return (
 *     <>
 *       <button onClick={() => setIsCartOpen(true)}>
 *         View Cart
 *       </button>
 *       
 *       <CartSheet 
 *         isOpen={isCartOpen} 
 *         onClose={() => setIsCartOpen(false)} 
 *       />
 *     </>
 *   );
 * }
 * 
 * Props:
 * - isOpen: boolean - Controls whether the cart sheet is visible
 * - onClose: () => void - Callback function when the cart is closed
 * 
 * Features:
 * - Displays as bottom sheet on mobile (< 768px)
 * - Displays as sidebar on desktop (>= 768px)
 * - Shows all cart items with CartItem component
 * - Displays total amount with item count
 * - "Proceed to Checkout" button navigates to /checkout
 * - Glassmorphism overlay background
 * - Empty state when no items in cart
 * - Smooth animations with Framer Motion
 * - Closes when overlay is clicked
 * - Closes when X button is clicked
 * - Closes when "Proceed to Checkout" is clicked
 * 
 * Requirements:
 * - Validates Requirement 11: Cart Display and Interaction
 * - Bottom sheet on mobile / Sidebar on desktop
 * - Displays CartItem list
 * - Total amount calculation
 * - "Proceed to Checkout" button
 * - Glassmorphism overlay
 */
