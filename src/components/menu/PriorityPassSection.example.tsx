/**
 * PriorityPassSection Component Example
 * 
 * This example demonstrates how to use the PriorityPassSection component
 * to display Priority Pass exclusive menu items with proper subscription handling.
 */

'use client';

import PriorityPassSection from './PriorityPassSection';
import type { MenuItemData } from '@/types';

// Example Priority Pass items
const examplePriorityItems: MenuItemData[] = [
  {
    id: 'priority-1',
    name: 'Premium Biryani',
    section: 'COOK_TO_ORDER',
    category: 'Rice',
    price: 150,
    imageUrl: null,
    etaMinutes: 15,
    isCombo: false,
    isPriorityOnly: true,
    isAvailable: true,
  },
  {
    id: 'priority-2',
    name: 'Special Thali',
    section: 'COOK_TO_ORDER',
    category: 'North Indian',
    price: 180,
    imageUrl: null,
    etaMinutes: 20,
    isCombo: false,
    isPriorityOnly: true,
    isAvailable: true,
  },
  {
    id: 'priority-3',
    name: 'Gourmet Sandwich',
    section: 'SNACK',
    category: 'Snacks',
    price: 120,
    imageUrl: null,
    etaMinutes: 0,
    isCombo: false,
    isPriorityOnly: true,
    isAvailable: true,
  },
  {
    id: 'priority-4',
    name: 'Premium Coffee',
    section: 'SNACK',
    category: 'Beverages',
    price: 80,
    imageUrl: null,
    etaMinutes: 0,
    isCombo: false,
    isPriorityOnly: true,
    isAvailable: true,
  },
];

export default function PriorityPassSectionExample() {
  return (
    <div className="min-h-screen bg-secondary p-4">
      <h1 className="text-2xl font-bold text-white mb-6">
        PriorityPassSection Component Examples
      </h1>

      {/* Example 1: Visible with items */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white/80 mb-4">
          Example 1: Priority Pass Section (Visible)
        </h2>
        <div className="bg-secondary-light rounded-2xl p-4">
          <PriorityPassSection 
            items={examplePriorityItems} 
            isVisible={true} 
          />
        </div>
        <p className="text-sm text-white/50 mt-2">
          Note: The blur effect and subscription prompt depend on the user's subscription status from the auth store.
        </p>
      </div>

      {/* Example 2: Hidden (search active) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white/80 mb-4">
          Example 2: Hidden (Search Active)
        </h2>
        <div className="bg-secondary-light rounded-2xl p-4">
          <PriorityPassSection 
            items={examplePriorityItems} 
            isVisible={false} 
          />
          <p className="text-sm text-white/60 text-center py-8">
            Section is hidden when search is active
          </p>
        </div>
      </div>

      {/* Example 3: Empty items */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white/80 mb-4">
          Example 3: No Priority Pass Items
        </h2>
        <div className="bg-secondary-light rounded-2xl p-4">
          <PriorityPassSection 
            items={[]} 
            isVisible={true} 
          />
          <p className="text-sm text-white/60 text-center py-8">
            Section is hidden when there are no Priority Pass items
          </p>
        </div>
      </div>

      {/* Usage Notes */}
      <div className="mt-8 glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Usage Notes</h2>
        <ul className="space-y-2 text-sm text-white/70">
          <li>
            <strong className="text-white">Subscription Status:</strong> The component automatically checks the user's subscription status from the auth store
          </li>
          <li>
            <strong className="text-white">Blur Effect:</strong> Items are blurred with pointer-events-none when subscription is INACTIVE or expired
          </li>
          <li>
            <strong className="text-white">Gold Badge:</strong> The "⭐ PRIORITY PASS" badge uses a gold gradient to indicate premium content
          </li>
          <li>
            <strong className="text-white">Search Behavior:</strong> Set isVisible to false when search is active to hide the section
          </li>
          <li>
            <strong className="text-white">Subscription Prompt:</strong> A call-to-action appears for users without active subscriptions
          </li>
          <li>
            <strong className="text-white">Expiry Check:</strong> The component validates that subscriptionExpiry is in the future
          </li>
        </ul>
      </div>
    </div>
  );
}
