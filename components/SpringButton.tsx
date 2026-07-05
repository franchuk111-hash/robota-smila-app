"use client";
import Link from "next/link";
import { motion } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const spring = { type: "spring" as const, stiffness: 250, damping: 13 };

// Пружинний hover/tap для посилань-кнопок (обгортка навколо next/link,
// щоб не боротися з forwardRef — стилі "btn" лишаються на самому <Link>).
export function SpringLink({
  href,
  className,
  children,
  style,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <motion.span
      style={{ display: "inline-block", ...style }}
      whileHover={{ scale: 1.045 }}
      whileTap={{ scale: 0.94 }}
      transition={spring}
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.span>
  );
}

// Пружинний hover/tap для нативних <button> (форми, вихід тощо).
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export function SpringButton({
  children,
  ...rest
}: NativeButtonProps & { children: ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.045 }}
      whileTap={{ scale: 0.94 }}
      transition={spring}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
