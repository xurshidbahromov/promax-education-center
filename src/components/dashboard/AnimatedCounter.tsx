"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
 value: number;
 prefix?: string;
 suffix?: string;
 duration?: number;
}

export default function AnimatedCounter({ value, prefix = "", suffix = "", duration = 2 }: AnimatedCounterProps) {
 const motionValue = useMotionValue(0);
 
 const springValue = useSpring(motionValue, {
 damping: 60,
 stiffness: 100,
 bounce: 0,
 duration: duration * 1000
 });
 
 const isDecimal = value % 1 !== 0;

 const displayValue = useTransform(springValue, (current) => {
 if (isDecimal) {
 return prefix + current.toFixed(1) + suffix;
 }
 return prefix + Math.floor(current) + suffix;
 });

 useEffect(() => {
 motionValue.set(value);
 }, [motionValue, value]);

 return <motion.span>{displayValue}</motion.span>;
}
