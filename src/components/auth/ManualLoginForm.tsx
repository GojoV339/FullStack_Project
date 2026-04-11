'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { X, AlertCircle } from 'lucide-react';

interface ManualLoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManualLoginForm({ isOpen, onClose }: ManualLoginFormProps) {
  const [regNum, setRegNum] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();
  const setStudent = useAuthStore((s) => s.setStudent);

  const registrationPattern = /^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/;

  const handleInputChange = (value: string) => {
    // Auto-uppercase transformation
    const uppercased = value.toUpperCase();
    setRegNum(uppercased);
    
    // Clear validation error when user types
    if (validationError) {
      setValidationError(null);
    }
  };

  const validateRegistrationNumber = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError('Registration number is required');
      return false;
    }
    
    if (!registrationPattern.test(value)) {
      setValidationError('Invalid registration number format');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submission
    if (!validateRegistrationNumber(regNum)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/manual-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: regNum.trim() }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setValidationError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      toast.success('Login successful!');
      setStudent(data.student);
      onClose();
      router.push('/cafeteria');
    } catch (error) {
      setValidationError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setRegNum('');
      setValidationError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
          >
            <div className="glass-card rounded-t-3xl p-6 max-w-lg mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Manual Login</h2>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Description */}
              <p className="text-white/50 text-sm mb-6">
                Enter your Amrita registration number to continue
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-white/60 text-xs font-medium mb-2 block">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={regNum}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="BL.EN.U4CSE22001"
                    className={`input-field uppercase ${
                      validationError ? 'border-red-500 focus:ring-red-500/50' : ''
                    }`}
                    autoCapitalize="characters"
                    autoComplete="off"
                    disabled={isLoading}
                    required
                  />
                  
                  {/* Pattern hint */}
                  {!validationError && (
                    <p className="text-white/30 text-xs mt-2">
                      Format: XX.EN.U4XXX00000
                    </p>
                  )}
                  
                  {/* Validation error display */}
                  {validationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mt-2 text-red-400 text-xs"
                    >
                      <AlertCircle size={14} />
                      <span>{validationError}</span>
                    </motion.div>
                  )}
                </div>

                {/* Submit button */}
                <motion.button
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  type="submit"
                  disabled={!regNum.trim() || isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                      />
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
