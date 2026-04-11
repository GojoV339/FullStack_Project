'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';
import SectionErrorBoundary from './SectionErrorBoundary';

/**
 * Example demonstrating error boundary usage
 * 
 * This file shows how to use error boundaries to catch and handle errors
 * in React component trees.
 */

// Component that throws an error when triggered
function ProblematicComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('This is a simulated error for demonstration purposes');
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-white font-bold mb-2">Component Working Fine</h3>
      <p className="text-white/60 text-sm">
        This component is rendering successfully. Click the button below to trigger an error.
      </p>
    </div>
  );
}

// Example 1: Basic Error Boundary
export function BasicErrorBoundaryExample() {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Basic Error Boundary</h2>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShouldThrow(!shouldThrow)}
        className="btn-primary"
      >
        {shouldThrow ? 'Reset' : 'Trigger Error'}
      </motion.button>

      <ErrorBoundary onReset={() => setShouldThrow(false)}>
        <ProblematicComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
}

// Example 2: Section Error Boundary
export function SectionErrorBoundaryExample() {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Section Error Boundary</h2>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShouldThrow(!shouldThrow)}
        className="btn-primary"
      >
        {shouldThrow ? 'Reset' : 'Trigger Error'}
      </motion.button>

      <SectionErrorBoundary 
        section="Menu"
        onReset={() => setShouldThrow(false)}
      >
        <ProblematicComponent shouldThrow={shouldThrow} />
      </SectionErrorBoundary>
    </div>
  );
}

// Example 3: Custom Fallback
export function CustomFallbackExample() {
  const [shouldThrow, setShouldThrow] = useState(false);

  const customFallback = (
    <div className="glass-card p-6 text-center">
      <h3 className="text-white font-bold mb-2">Custom Error UI</h3>
      <p className="text-white/60 text-sm mb-4">
        This is a custom error fallback component.
      </p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShouldThrow(false)}
        className="btn-primary"
      >
        Try Again
      </motion.button>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Custom Fallback</h2>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShouldThrow(!shouldThrow)}
        className="btn-primary"
      >
        {shouldThrow ? 'Reset' : 'Trigger Error'}
      </motion.button>

      <ErrorBoundary fallback={customFallback}>
        <ProblematicComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
}

// Example 4: Multiple Error Boundaries
export function MultipleErrorBoundariesExample() {
  const [throwInSection1, setThrowInSection1] = useState(false);
  const [throwInSection2, setThrowInSection2] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Multiple Error Boundaries</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1 */}
        <div className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setThrowInSection1(!throwInSection1)}
            className="btn-primary w-full"
          >
            {throwInSection1 ? 'Reset Section 1' : 'Error in Section 1'}
          </motion.button>

          <ErrorBoundary 
            section="Section 1"
            onReset={() => setThrowInSection1(false)}
          >
            <ProblematicComponent shouldThrow={throwInSection1} />
          </ErrorBoundary>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setThrowInSection2(!throwInSection2)}
            className="btn-primary w-full"
          >
            {throwInSection2 ? 'Reset Section 2' : 'Error in Section 2'}
          </motion.button>

          <ErrorBoundary 
            section="Section 2"
            onReset={() => setThrowInSection2(false)}
          >
            <ProblematicComponent shouldThrow={throwInSection2} />
          </ErrorBoundary>
        </div>
      </div>

      <p className="text-white/40 text-sm text-center">
        Notice how errors in one section don't affect the other section
      </p>
    </div>
  );
}

// Main demo component
export default function ErrorBoundaryDemo() {
  return (
    <div className="min-h-screen gradient-dark">
      <div className="max-w-4xl mx-auto py-12 space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            Error Boundary <span className="text-gradient">Examples</span>
          </h1>
          <p className="text-white/60">
            Interactive examples showing how error boundaries work
          </p>
        </div>

        <BasicErrorBoundaryExample />
        <SectionErrorBoundaryExample />
        <CustomFallbackExample />
        <MultipleErrorBoundariesExample />
      </div>
    </div>
  );
}
