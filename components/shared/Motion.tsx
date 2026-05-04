"use client";
import { motion, type Variants } from "framer-motion";
import { type PropsWithChildren } from "react";

export const easeLuxury = [0.2, 0.8, 0.2, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeLuxury } },
};

export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const Reveal = ({ children, className, delay = 0 }: PropsWithChildren<{ className?: string; delay?: number }>) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-80px" }}
    variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeLuxury, delay } } }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerGroup = ({ children, className, gap = 0.1 }: PropsWithChildren<{ className?: string; gap?: number }>) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-60px" }}
    variants={stagger(gap)}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <motion.div variants={fadeUp} className={className}>{children}</motion.div>
);
