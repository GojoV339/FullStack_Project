'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { MapPin, Clock, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { SectionErrorBoundary } from '@/components/error';
import { api } from '@/lib/api-client';
import type { CafeteriaInfo } from '@/types';

const cafeteriaEmojis = ['🏛️', '🍽️', '🏢'];
const gradients = [
  'from-[#b50346]/8 via-[#d45c7e]/5 to-transparent',
  'from-[#d45c7e]/8 via-[#b50346]/5 to-transparent',
  'from-[#b50346]/6 via-[#d45c7e]/6 to-transparent',
];

export default function CafeteriaPage() {
  return (
    <SectionErrorBoundary section="Cafeteria">
      <CafeteriaPageContent />
    </SectionErrorBoundary>
  );
}

function CafeteriaPageContent() {
  const [cafeterias, setCafeterias] = useState<CafeteriaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useRouter();
  const setCafeteria = useCartStore((s) => s.setCafeteria);

  useEffect(() => {
    const fetchCafeterias = async () => {
      try {
        const data = await api.get<{ cafeterias: CafeteriaInfo[] }>('/api/cafeterias');
        setCafeterias(data.cafeterias || []);
      } catch (error) {
        console.error('Failed to fetch cafeterias:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCafeterias();
  }, []);

  const handleSelect = (cafe: CafeteriaInfo) => {
    if (!cafe.isOpen) return;
    setCafeteria(cafe.id, cafe.name);
    router.push('/menu');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#eeeeee] p-6 safe-top pb-28">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">☀️</span>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Good morning!</h1>
          </div>
          <p className="text-[#8A8A8A] text-sm mt-1 ml-10">
            Which canteen are you ordering from today?
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-40 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {cafeterias.map((cafe, index) => (
              <CafeteriaCard
                key={cafe.id}
                cafe={cafe}
                index={index}
                emoji={cafeteriaEmojis[index] || '🍽️'}
                gradient={gradients[index] || gradients[0]}
                isHovered={hoveredIndex === index}
                onHover={() => setHoveredIndex(index)}
                onLeave={() => setHoveredIndex(null)}
                onClick={() => handleSelect(cafe)}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function CafeteriaCard({
  cafe,
  index,
  emoji,
  gradient,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: {
  cafe: CafeteriaInfo;
  index: number;
  emoji: string;
  gradient: string;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 20;
    const y = -(e.clientX - rect.left - rect.width / 2) / 20;
    setRotate({ x: Math.max(-8, Math.min(8, x)), y: Math.max(-8, Math.min(8, y)) });
  };

  const getWaitBadge = (minutes: number) => {
    if (minutes < 10) return { bg: '#ECFDF5', text: '#166534', label: `~${minutes} min` };
    if (minutes <= 20) return { bg: '#FEF3C7', text: '#92400E', label: `~${minutes} min` };
    return { bg: '#FEF2F2', text: '#991B1B', label: `~${minutes} min` };
  };

  const waitBadge = getWaitBadge(cafe.avgWaitMinutes);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      whileTap={{ scale: 0.97 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={onHover}
      onMouseLeave={() => { setRotate({ x: 0, y: 0 }); onLeave(); }}
      onClick={onClick}
      className={`relative cursor-pointer ${!cafe.isOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <div className="glass-card overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="text-5xl"
              >
                {emoji}
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-[#2D2D2D]">{cafe.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={12} className="text-[#8A8A8A]" />
                  <span className="text-[#8A8A8A] text-xs">{cafe.location}</span>
                </div>
              </div>
            </div>
            <ChevronRight
              size={20}
              className={`transition-all ${isHovered ? 'translate-x-1 text-[#b50346]' : 'text-[#ABABAB]'}`}
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: cafe.isOpen ? '#ECFDF5' : '#FEF2F2',
                color: cafe.isOpen ? '#166534' : '#991B1B',
              }}
            >
              {cafe.isOpen ? <Wifi size={11} /> : <WifiOff size={11} />}
              {cafe.isOpen ? 'Open Now' : 'Closed'}
            </div>

            {cafe.isOpen && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: waitBadge.bg, color: waitBadge.text }}
              >
                <Clock size={11} />
                {waitBadge.label} wait
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
