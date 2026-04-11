/**
 * Example usage of the Header component
 * 
 * This file demonstrates different ways to use the Header component
 * across various pages in the application.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';

// Example 1: Simple page with title and back button
export function SimplePageHeader() {
  return <Header title="My Orders" />;
}

// Example 2: Page without back button (e.g., home page)
export function HomePageHeader() {
  return <Header title="Choose Your Canteen" showBack={false} />;
}

// Example 3: Menu page with search and cart
export function MenuPageHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <Header
      title="Samridhi Cafeteria"
      showSearch
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      showCart
      onCartClick={() => router.push('/checkout')}
    />
  );
}

// Example 4: Profile page with just title and back
export function ProfilePageHeader() {
  return <Header title="My Profile" />;
}

// Example 5: Custom back navigation
export function CustomBackHeader() {
  const router = useRouter();

  return (
    <Header
      title="Order Details"
      showBack
      // Back button uses router.back() by default
    />
  );
}
