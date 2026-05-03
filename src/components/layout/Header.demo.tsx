/**
 * Demo page showing different Header configurations
 * This is for development/documentation purposes only
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';

export default function HeaderDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-secondary">
      <div className="space-y-8 pb-20">
        {/* Demo 1: Basic Header */}
        <div>
          <div className="p-4 bg-[#eeeeee]/5 mb-2">
            <h2 className="text-[#2D2D2D] font-bold">Basic Header with Title</h2>
            <p className="text-[#2D2D2D]/50 text-sm">Default configuration with back button</p>
          </div>
          <Header title="My Orders" />
          <div className="h-40 bg-[#eeeeee]/5 m-4 rounded-xl flex items-center justify-center">
            <p className="text-[#2D2D2D]/30">Page content goes here</p>
          </div>
        </div>

        {/* Demo 2: No Back Button */}
        <div>
          <div className="p-4 bg-[#eeeeee]/5 mb-2">
            <h2 className="text-[#2D2D2D] font-bold">Header without Back Button</h2>
            <p className="text-[#2D2D2D]/50 text-sm">For home/landing pages</p>
          </div>
          <Header title="Choose Your Canteen" showBack={false} />
          <div className="h-40 bg-[#eeeeee]/5 m-4 rounded-xl flex items-center justify-center">
            <p className="text-[#2D2D2D]/30">Page content goes here</p>
          </div>
        </div>

        {/* Demo 3: With Search */}
        <div>
          <div className="p-4 bg-[#eeeeee]/5 mb-2">
            <h2 className="text-[#2D2D2D] font-bold">Header with Search</h2>
            <p className="text-[#2D2D2D]/50 text-sm">For menu browsing</p>
          </div>
          <Header
            title="Menu"
            showSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <div className="h-40 bg-[#eeeeee]/5 m-4 rounded-xl flex items-center justify-center">
            <p className="text-[#2D2D2D]/30">
              {searchQuery ? `Searching for: ${searchQuery}` : 'Page content goes here'}
            </p>
          </div>
        </div>

        {/* Demo 4: With Cart Button */}
        <div>
          <div className="p-4 bg-[#eeeeee]/5 mb-2">
            <h2 className="text-[#2D2D2D] font-bold">Header with Cart Button</h2>
            <p className="text-[#2D2D2D]/50 text-sm">Shows cart with item count</p>
          </div>
          <Header
            title="Samridhi Cafeteria"
            showCart
            onCartClick={() => alert('Cart clicked!')}
          />
          <div className="h-40 bg-[#eeeeee]/5 m-4 rounded-xl flex items-center justify-center">
            <p className="text-[#2D2D2D]/30">Page content goes here</p>
          </div>
        </div>

        {/* Demo 5: Full Featured (Menu Page) */}
        <div>
          <div className="p-4 bg-[#eeeeee]/5 mb-2">
            <h2 className="text-[#2D2D2D] font-bold">Full Featured Header</h2>
            <p className="text-[#2D2D2D]/50 text-sm">Search + Cart (Menu page)</p>
          </div>
          <Header
            title="Samridhi Cafeteria"
            showSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showCart
            onCartClick={() => router.push('/checkout')}
          />
          <div className="h-40 bg-[#eeeeee]/5 m-4 rounded-xl flex items-center justify-center">
            <p className="text-[#2D2D2D]/30">
              {searchQuery ? `Searching for: ${searchQuery}` : 'Menu items grid'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
