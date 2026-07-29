"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

// Плавний лічильник, що "доганяє" реальне значення при появі у в'юпорті.
// Початковий рендер (SSR і будь-який клієнт без JS/анімації) одразу
// показує справжнє число `to` — жоден краулер чи бот не побачить "0".
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
  const [n, setN] = useState(to);

  useEffect(() => {
    if (!inView) return;
    const from = Math.max(0, to - Math.ceil(to * 0.4));
    let raf = 0;
    const start = performance.now();
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setN(Math.round(from + ease(p) * (to - from)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setN(from);
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
