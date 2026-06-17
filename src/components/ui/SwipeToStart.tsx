"use client";

import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useTelegramApp } from '@/hooks/useTelegramApp';

interface SwipeToStartProps {
  onComplete: () => void;
  isLoading?: boolean;
}

export default function SwipeToStart({ onComplete, isLoading = false }: SwipeToStartProps) {
  const [completed, setCompleted] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const { haptic } = useTelegramApp();
  
  // Calculate width constraints
  const containerWidth = 320;
  const buttonWidth = 62;
  const padding = 6; // p-1.5 = 6px
  const dragConstraints = { left: 0, right: containerWidth - buttonWidth - (padding * 2) };

  const backgroundOpacity = useTransform(
    x,
    [0, dragConstraints.right],
    [0.1, 1]
  );
  
  const textOpacity = useTransform(
    x,
    [0, dragConstraints.right / 2],
    [1, 0]
  );

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x >= dragConstraints.right - 20) {
      setCompleted(true);
      haptic('heavy');
      onComplete();
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
      haptic('light');
    }
  };

  useEffect(() => {
    if (!completed && !isLoading) {
      // Pulse animation to hint at swipe
      const interval = setInterval(() => {
        controls.start({
          x: [0, 15, 0],
          transition: { duration: 0.8, ease: "easeInOut" }
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [completed, isLoading, controls]);

  return (
    <div className="relative w-full max-w-[320px] mx-auto h-[74px] bg-slate-800/40 backdrop-blur-xl rounded-[37px] p-[6px] overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center">
      
      {/* Background fill that grows as you drag */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-orange"
        style={{ opacity: backgroundOpacity }}
      />

      {/* Helper Text */}
      <motion.div 
        className="absolute w-full text-center pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        <span className="text-white/70 font-medium text-[15px] tracking-wide pl-8">
          Ushlab o'ngga suring
        </span>
      </motion.div>

      {/* Dragging Button */}
      <motion.div
        drag={completed || isLoading ? false : "x"}
        dragConstraints={dragConstraints}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="relative z-10 w-[62px] h-[62px] bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-grab active:cursor-grabbing"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
        ) : (
          <ArrowRight className="w-6 h-6 text-brand-blue" />
        )}
      </motion.div>
    </div>
  );
}
