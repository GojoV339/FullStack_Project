/**
 * Example usage of CartItem component
 * 
 * This component displays individual cart items with quantity controls.
 * It should be used within the CartSheet component to show cart contents.
 */

'use client';

import CartItem from './CartItem';
import type { CartItem as CartItemType } from '@/types';

export default function CartItemExample() {
  // Example cart items data
  const cartItems: CartItemType[] = [
    {
      menuItem: {
        id: '1',
        name: 'Masala Dosa',
        section: 'COOK_TO_ORDER',
        category: 'South Indian',
        price: 50,
        imageUrl: null,
        etaMinutes: 10,
        isCombo: false,
        isPriorityOnly: false,
        isAvailable: true,
      },
      quantity: 2,
    },
    {
      menuItem: {
        id: '2',
        name: 'Filter Coffee',
        section: 'SNACK',
        category: 'Beverages',
        price: 20,
        imageUrl: null,
        etaMinutes: 0,
        isCombo: false,
        isPriorityOnly: false,
        isAvailable: true,
      },
      quantity: 1,
    },
    {
      menuItem: {
        id: '3',
        name: 'Veg Biryani',
        section: 'COOK_TO_ORDER',
        category: 'Rice',
        price: 80,
        imageUrl: null,
        etaMinutes: 20,
        isCombo: false,
        isPriorityOnly: false,
        isAvailable: true,
      },
      quantity: 3,
    },
  ];

  return (
    <div className="min-h-screen p-4 bg-secondary">
      <h1 className="text-2xl font-bold text-white mb-4">Cart Items Example</h1>
      
      <div className="glass-card p-4 max-w-md">
        <h2 className="text-lg font-semibold text-white mb-3">Your Cart</h2>
        
        {/* Cart Items List */}
        <div className="space-y-2">
          {cartItems.map((item) => (
            <CartItem key={item.menuItem.id} item={item} />
          ))}
        </div>
        
        {/* Total */}
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
          <span className="text-white/70 font-medium">Total</span>
          <span className="text-primary text-xl font-bold">
            ₹{cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Usage in CartSheet component:
 * 
 * import CartItem from '@/components/cart/CartItem';
 * import { useCartStore } from '@/store/cartStore';
 * 
 * // In your component:
 * const items = useCartStore((s) => s.items);
 * 
 * {items.map((item) => (
 *   <CartItem key={item.menuItem.id} item={item} />
 * ))}
 * 
 * Props:
 * - item: CartItem object containing menuItem and quantity
 * 
 * Features:
 * - Displays item name, unit price, quantity, and subtotal
 * - Increment/decrement buttons for quantity adjustment
 * - Automatically removes item when quantity reaches 0
 * - Smooth animations with Framer Motion
 * - Haptic feedback on quantity changes (handled by store)
 * - Responsive layout with proper spacing
 * 
 * Requirements:
 * - Validates Requirement 11: Cart Display and Interaction
 * - Shows name, quantity, unit price, and subtotal
 * - Provides increment/decrement buttons
 * - Removes item when quantity is decremented to 0
 */

