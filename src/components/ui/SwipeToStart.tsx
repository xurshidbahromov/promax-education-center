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
  const padding = 8; // p-2 = 8px
  const dragConstraints = { left: 0, right: containerWidth - buttonWidth - (padding * 2) };

  const backgroundOpacity = useTransform(x, [0, dragConstraints.right], [0, 1]);
  const textOpacity = useTransform(x, [0, dragConstraints.right / 2], [1, 0]);

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
    <div className="relative w-full max-w-[320px] mx-auto h-[78px] bg-white dark:bg-slate-800 rounded-[39px] p-2 overflow-hidden border border-slate-100 dark:border-slate-700/60 shadow-[inset_0_4px_12px_rgba(0,0,0,0.02)] flex items-center group">
      
      {/* Background fill */}
      <motion.div 
        className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10"
        style={{ opacity: backgroundOpacity }}
      />

      {/* Helper Text */}
      <motion.div 
        className="absolute w-full text-center pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        <span className="text-slate-400 dark:text-slate-500 font-medium text-[15px] tracking-wide pl-8">
          Boshlash uchun suring
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
        className="relative z-10 w-[62px] h-[62px] bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.3)] dark:shadow-[0_8px_20px_rgba(16,185,129,0.1)] cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <ArrowRight className="w-6 h-6 text-white" />
        )}
      </motion.div>
    </div>
  );
}
