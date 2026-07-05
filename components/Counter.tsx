"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

// Плавний лічильник (0 → to) при появі у в'юпорті.
export default function Counter({
  to,
  suffix = "",
  duration = 1200,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setN(Math.round(ease(p) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {n.toLocaleString("uk-UA")}
      {suffix}
    </span>
  );
}
