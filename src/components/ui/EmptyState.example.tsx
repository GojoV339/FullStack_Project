/**
 * EmptyState Component Usage Examples
 * 
 * This file demonstrates various use cases for the EmptyState component
 */

import EmptyState from './EmptyState';
import { ShoppingBag, Package, Search, FileText } from 'lucide-react';

// Example 1: Empty Cart
export function EmptyCartExample() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Your cart is empty"
      message="Add items from the menu to get started"
      action={{
        label: 'Browse Menu',
        onClick: () => console.log('Navigate to menu'),
      }}
    />
  );
}

// Example 2: No Orders
export function NoOrdersExample() {
  return (
    <EmptyState
      icon={Package}
      title="No orders yet"
      message="You haven't placed any orders. Start by browsing our delicious menu!"
      action={{
        label: 'Order Now',
        onClick: () => console.log('Navigate to cafeteria selection'),
      }}
    />
  );
}

// Example 3: No Search Results
export function NoSearchResultsExample() {
  return (
    <EmptyState
      icon={Search}
      title="No items match your search"
      message="Try searching with different keywords or browse all items"
    />
  );
}

// Example 4: No Content (Generic)
export function NoContentExample() {
  return (
    <EmptyState
      icon={FileText}
      title="Nothing to show"
      message="There's no content available at the moment"
    />
  );
}

// Example 5: Empty State with Custom Action
export function CustomActionExample() {
  const handleCustomAction = () => {
    alert('Custom action triggered!');
  };

  return (
    <EmptyState
      icon={ShoppingBag}
      title="Start your order"
      message="Select a cafeteria to begin browsing the menu"
      action={{
        label: 'Choose Cafeteria',
        onClick: handleCustomAction,
      }}
    />
  );
}
