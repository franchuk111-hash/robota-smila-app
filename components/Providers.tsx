"use client";
import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "motion/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SessionProvider>
  );
}
