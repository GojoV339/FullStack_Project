'use client';

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  section?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component catches React errors in component trees
 * 
 * Features:
 * - Catches JavaScript errors anywhere in child component tree
 * - Displays user-friendly error messages (no technical jargon)
 * - Provides retry actions to recover from errors
 * - Uses warm color palette and glassmorphism effects
 * - Logs errors to console for debugging
 * 
 * Usage:
 * <ErrorBoundary section="Menu">
 *   <MenuComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('Error caught by ErrorBoundary:', {
      section: this.props.section,
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/cafeteria';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 gradient-dark">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 max-w-md w-full text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 relative"
            >
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
              <AlertTriangle size={36} className="text-red-400 relative z-10" />
            </motion.div>

            {/* Error Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-[#2D2D2D] mb-3"
            >
              Oops! Something went wrong
            </motion.h2>

            {/* Error Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-[#2D2D2D]/60 mb-6"
            >
              {this.props.section
                ? `We're having trouble loading the ${this.props.section.toLowerCase()} section. Don't worry, your data is safe.`
                : "We're having trouble loading this page. Don't worry, your data is safe."}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3"
            >
              {/* Retry Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={this.handleReset}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </motion.button>

              {/* Go Home Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={this.handleGoHome}
                className="glass-card py-3 px-6 rounded-xl text-sm font-medium text-[#2D2D2D]/70 hover:text-[#2D2D2D] transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Go to Home
              </motion.button>
            </motion.div>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-left"
              >
                <summary className="text-xs text-[#2D2D2D]/40 cursor-pointer hover:text-[#2D2D2D]/60 transition-colors">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-black/30 rounded-lg text-[10px] text-red-300 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </motion.details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
