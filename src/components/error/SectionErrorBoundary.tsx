'use client';

import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  section: 'Cafeteria' | 'Menu' | 'Orders' | 'Profile' | 'Staff Dashboard';
  onReset?: () => void;
}

/**
 * SectionErrorBoundary wraps main app sections with error handling
 * 
 * Sections:
 * - Cafeteria: Cafeteria selection page
 * - Menu: Menu browsing and cart
 * - Orders: Order history and tracking
 * - Profile: Student profile and subscription
 * - Staff Dashboard: Kitchen Kanban board
 * 
 * Features:
 * - Section-specific error messages
 * - Automatic retry with section context
 * - Preserves user session and cart data
 */
export default function SectionErrorBoundary({
  children,
  section,
  onReset,
}: SectionErrorBoundaryProps) {
  const handleReset = () => {
    // Reload the current page to retry
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  return (
    <ErrorBoundary section={section} onReset={handleReset}>
      {children}
    </ErrorBoundary>
  );
}
