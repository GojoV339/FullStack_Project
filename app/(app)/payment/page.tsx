'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, CheckCircle2, QrCode, ArrowLeft } from 'lucide-react';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', emoji: '🟢', color: '#4285F4' },
  { id: 'phonepe', name: 'PhonePe', emoji: '🟣', color: '#5F259F' },
  { id: 'paytm', name: 'Paytm', emoji: '🔵', color: '#00B9F1' },
  { id: 'bhim', name: 'BHIM', emoji: '🟠', color: '#004C8F' },
  { id: 'amazon', name: 'Amazon Pay', emoji: '🟡', color: '#FF9900' },
  { id: 'other', name: 'Other UPI', emoji: '⚪', color: '#6B7280' },
];

type PaymentStep = 'select' | 'processing' | 'success';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || '';
  const amount = searchParams.get('amount') || '0';
  const orderNumber = searchParams.get('orderNumber') || '';
  const token = searchParams.get('token') || '';
  const cafeteria = searchParams.get('cafeteria') || 'Cafeteria';

  const [step, setStep] = useState<PaymentStep>('select');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [processingApp, setProcessingApp] = useState('');
  const [upiRef] = useState(() =>
    Math.floor(100000000000 + Math.random() * 900000000000).toString()
  );

  const handleAppPay = async (app: (typeof UPI_APPS)[0]) => {
    setSelectedApp(app.id);
    setProcessingApp(app.name);
    setStep('processing');

    await new Promise((r) => setTimeout(r, 4000));
    setStep('success');

    // After success, call the simulate-payment API
    try {
      await fetch(`/api/payments/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, upiRef }),
      });
    } catch {
      // continue regardless
    }
  };

  const handleUpiPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim()) return;
    setProcessingApp('UPI ID');
    setStep('processing');
    await new Promise((r) => setTimeout(r, 3500));
    setStep('success');
    try {
      await fetch(`/api/payments/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, upiRef }),
      });
    } catch {
      // continue regardless
    }
  };

  const handleViewOrder = () => {
    const params = new URLSearchParams({
      orderId,
      token,
      orderNumber,
      cafeteria,
    });
    router.push(`/success?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F4] flex flex-col">
      <AnimatePresence mode="wait">
        {/* === SELECT STEP === */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col flex-1"
          >
            {/* Header */}
            <div
              className="px-5 pt-14 pb-5 text-center relative"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FFB347 100%)',
              }}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => router.back()}
                className="absolute top-14 left-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 text-white"
              >
                <ArrowLeft size={18} />
              </motion.button>

              <h2 className="text-white font-bold text-lg">Complete Payment</h2>

              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-white font-black mt-2"
                style={{ fontSize: '36px' }}
              >
                ₹{amount}
              </motion.p>

              {orderNumber && (
                <p className="text-white/80 text-sm mt-1 font-mono">{orderNumber}</p>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {/* UPI App Grid */}
              <div>
                <h3 className="text-[#1A1A2E] font-semibold text-sm mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FFF0E8] rounded-md flex items-center justify-center text-[#FF6B35] text-xs">📱</span>
                  Pay with UPI App
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {UPI_APPS.map((app, i) => (
                    <motion.button
                      key={app.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleAppPay(app)}
                      className="glass-card p-4 flex flex-col items-center gap-2 active:shadow-none"
                      style={{ transition: 'box-shadow 0.15s' }}
                    >
                      <span className="text-3xl">{app.emoji}</span>
                      <span className="text-xs text-[#1A1A2E] font-semibold text-center leading-tight">
                        {app.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[rgba(255,107,53,0.12)]" />
                <span className="text-xs text-[#9CA3AF] font-medium">OR</span>
                <div className="flex-1 h-px bg-[rgba(255,107,53,0.12)]" />
              </div>

              {/* UPI ID Input */}
              <div>
                <h3 className="text-[#1A1A2E] font-semibold text-sm mb-3">
                  Enter UPI ID
                </h3>
                <form onSubmit={handleUpiPay} className="space-y-3">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="input-field"
                  />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={!upiId.trim()}
                    className="btn-primary w-full"
                  >
                    Pay ₹{amount}
                  </motion.button>
                </form>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[rgba(255,107,53,0.12)]" />
                <span className="text-xs text-[#9CA3AF] font-medium">OR</span>
                <div className="flex-1 h-px bg-[rgba(255,107,53,0.12)]" />
              </div>

              {/* QR Code */}
              <div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowQR(!showQR)}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <QrCode size={18} />
                  {showQR ? 'Hide QR Code' : 'Scan QR Code'}
                </motion.button>

                <AnimatePresence>
                  {showQR && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="glass-card p-6 text-center">
                        {/* QR Code SVG Placeholder */}
                        <div className="bg-white p-4 rounded-xl mx-auto w-fit border border-[rgba(255,107,53,0.15)]">
                          <svg width="160" height="160" viewBox="0 0 160 160">
                            {/* QR pattern simulation */}
                            {Array.from({ length: 16 }).map((_, row) =>
                              Array.from({ length: 16 }).map((_, col) => {
                                const val = (row * 16 + col * 7 + row * col) % 3;
                                return val === 0 ? (
                                  <rect
                                    key={`${row}-${col}`}
                                    x={col * 10}
                                    y={row * 10}
                                    width="9"
                                    height="9"
                                    rx="1"
                                    fill="#1A1A2E"
                                  />
                                ) : null;
                              })
                            )}
                            {/* Corner squares */}
                            <rect x="0" y="0" width="40" height="40" rx="4" fill="none" stroke="#FF6B35" strokeWidth="3" />
                            <rect x="120" y="0" width="40" height="40" rx="4" fill="none" stroke="#FF6B35" strokeWidth="3" />
                            <rect x="0" y="120" width="40" height="40" rx="4" fill="none" stroke="#FF6B35" strokeWidth="3" />
                          </svg>
                        </div>
                        <p className="text-[#6B7280] text-sm mt-3">
                          Open any UPI app and scan
                        </p>
                        <p className="text-[#FF6B35] font-bold text-lg mt-1">₹{amount}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* === PROCESSING STEP === */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            {/* Animated pulsing ring */}
            <div className="relative w-32 h-32 mb-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-4"
                  style={{ borderColor: '#FF6B35' }}
                  animate={{
                    scale: [1, 1.5 + i * 0.3],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: 'easeOut',
                  }}
                />
              ))}
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}
              >
                <span className="text-4xl">₹</span>
              </div>
            </div>

            <motion.h2
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl font-bold text-[#1A1A2E] mb-2"
            >
              Processing Payment
            </motion.h2>

            <p className="text-[#6B7280] text-sm mb-2">
              Redirecting to {processingApp}...
            </p>

            <p className="text-[#9CA3AF] text-xs">Verifying with bank</p>

            {/* Progress bar */}
            <div className="w-full max-w-xs mt-8">
              <div className="h-2 bg-[#FFF0E8] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FF6B35, #FFB347)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3.5, ease: 'easeInOut' }}
                />
              </div>
              <p className="text-xs text-[#9CA3AF] text-center mt-2">Please wait...</p>
            </div>
          </motion.div>
        )}

        {/* === SUCCESS STEP === */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            style={{ background: 'linear-gradient(180deg, #FFF8F4 0%, #FFFFFF 100%)' }}
          >
            {/* Green success burst */}
            <div className="relative mb-8">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: ['#10B981', '#FF6B35', '#FFB347', '#F59E0B'][i % 4],
                    top: '50%',
                    left: '50%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((i / 8) * 2 * Math.PI) * 70,
                    y: Math.sin((i / 8) * 2 * Math.PI) * 70,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              ))}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <CheckCircle2 size={64} style={{ color: '#10B981' }} />
              </motion.div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-[#1A1A2E] mb-2"
            >
              Payment Successful!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-[#6B7280] text-sm mb-1"
            >
              ₹{amount} paid successfully
            </motion.p>

            {/* Receipt card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-6 w-full max-w-xs glass-card p-5 text-left space-y-3"
              style={{
                background: '#FFF8F4',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <div className="flex justify-between">
                <span className="text-[#6B7280] text-sm">Amount</span>
                <span className="text-[#1A1A2E] font-bold">₹{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] text-sm">Token #</span>
                <span className="text-[#FF6B35] font-bold">#{token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] text-sm">Cafeteria</span>
                <span className="text-[#1A1A2E] text-sm font-medium">{cafeteria}</span>
              </div>
              <div className="flex justify-between border-t border-[rgba(16,185,129,0.15)] pt-2">
                <span className="text-[#6B7280] text-xs">UPI Ref</span>
                <span className="text-[#6B7280] text-xs font-mono">{upiRef}</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleViewOrder}
              className="btn-primary w-full max-w-xs mt-6 h-[52px] flex items-center justify-center gap-2 text-base"
            >
              View My Order
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF8F4] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[rgba(255,107,53,0.15)] border-t-[#FF6B35] rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
