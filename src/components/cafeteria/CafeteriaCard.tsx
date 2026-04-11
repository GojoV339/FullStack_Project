'use client';

import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import type { CafeteriaInfo } from '@/types';
import * as THREE from 'three';

interface CafeteriaCardProps {
  cafeteria: CafeteriaInfo;
  onClick?: () => void;
}

// Unique gradient colors for each cafeteria
const cafeteriaGradients: Record<string, string> = {
  'Samridhi': 'from-primary/30 via-accent/20 to-primary/30',
  'Canteen Main': 'from-accent/30 via-primary/20 to-accent/30',
  'E Block Canteen': 'from-primary/25 via-accent/25 to-primary/25',
};

// 3D Plane component with React Three Fiber
function AnimatedPlane({ tilt, isHovered }: { tilt: { x: number; y: number }; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Smooth rotation based on tilt
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        (tilt.x * Math.PI) / 180,
        0.1
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        (tilt.y * Math.PI) / 180,
        0.1
      );

      // Subtle floating animation when hovered
      if (isHovered) {
        meshRef.current.position.z = Math.sin(Date.now() * 0.001) * 0.05;
      } else {
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0, 0.1);
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 1.2, 32, 32]} />
      <meshStandardMaterial
        color="#FF6B35"
        transparent
        opacity={0.1}
        wireframe={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function CafeteriaCard({ cafeteria, onClick }: CafeteriaCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !cafeteria.isOpen) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt angles (max 8 degrees)
    const tiltX = ((y - centerY) / centerY) * -8;
    const tiltY = ((x - centerX) / centerX) * 8;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    if (cafeteria.isOpen) {
      setIsHovered(true);
    }
  };

  const gradient = cafeteriaGradients[cafeteria.name] || cafeteriaGradients['Samridhi'];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={cafeteria.isOpen ? onClick : undefined}
      className={`relative ${cafeteria.isOpen ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      style={{
        opacity: cafeteria.isOpen ? 1 : 0.5,
      }}
      whileTap={cafeteria.isOpen ? { scale: 0.98 } : {}}
    >
      {/* React Three Fiber 3D Canvas */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <AnimatedPlane tilt={tilt} isHovered={isHovered} />
          </Suspense>
        </Canvas>
      </div>

      <motion.div
        className="glass-card overflow-hidden relative"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        {/* Gradient Glow Effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 blur-xl`}
          style={{
            transform: 'translateZ(-10px)',
          }}
        />

        {/* Shimmer Animation on Hover */}
        {isHovered && cafeteria.isOpen && (
          <div className="absolute inset-0 shimmer pointer-events-none" />
        )}

        {/* Content */}
        <div className="relative p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              {cafeteria.isOpen ? (
                <span className="inline-flex items-center gap-1.5 bg-success/20 text-success px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  Open Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/50 px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                  Closed
                </span>
              )}
            </div>
          </div>

          {/* Cafeteria Name */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {cafeteria.name}
            </h3>
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <MapPin size={14} />
              <span>{cafeteria.location}</span>
            </div>
          </div>

          {/* Wait Time */}
          {cafeteria.isOpen && (
            <div className="flex items-center gap-2 text-white/80">
              <Clock size={16} className="text-accent" />
              <span className="text-sm">
                ~{cafeteria.avgWaitMinutes} min wait
              </span>
            </div>
          )}

          {/* Decorative Element */}
          <div className="absolute top-4 right-4 text-6xl opacity-10">
            🍽️
          </div>
        </div>

        {/* Bottom Glow */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} ${
            cafeteria.isOpen ? 'opacity-60' : 'opacity-20'
          }`}
        />
      </motion.div>
    </motion.div>
  );
}
