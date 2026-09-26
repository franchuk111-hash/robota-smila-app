"use client";
import { useEffect, useRef, useState } from "react";

export default function HeroVideoPortrait() {
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(2.5);
  const pointer = useRef({ x: 0, y: 0 });
  const lastMove = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const frame = frameRef.current;
    if (!video || !frame) return;
    const videoEl = video;
    const frameEl = frame;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;

    function tick(now: number) {
      if (videoEl.duration && !reducedMotion) {
        if (now - lastMove.current > 1800) targetTime.current = videoEl.duration * (0.5 + Math.sin(now / 1800) * 0.08);
        const next = videoEl.currentTime + (targetTime.current - videoEl.currentTime) * 0.12;
        if (Math.abs(next - videoEl.currentTime) > 0.004) videoEl.currentTime = next;
        frameEl.style.transform = `perspective(900px) rotateX(${pointer.current.y * -2.5}deg) rotateY(${pointer.current.x * 3.5}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    const onMove = (event: PointerEvent) => {
      if (!videoEl.duration) return;
      const x = Math.max(0, Math.min(1, event.clientX / window.innerWidth));
      const y = Math.max(0, Math.min(1, event.clientY / window.innerHeight));
      targetTime.current = x * videoEl.duration;
      pointer.current = { x: x * 2 - 1, y: y * 2 - 1 };
      lastMove.current = performance.now();
    };

    const onReady = () => {
      targetTime.current = videoEl.duration / 2;
      videoEl.currentTime = targetTime.current;
      setReady(true);
    };

    if (videoEl.readyState >= 1) onReady();
    else videoEl.addEventListener("loadedmetadata", onReady, { once: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={frameRef} className={`video-portrait${ready ? " ready" : ""}`}>
      <video
        ref={videoRef}
        poster="/video/hero-head-turn-poster.png"
        muted
        playsInline
        preload="auto"
        aria-label="Молодий чоловік повертає голову за курсором"
      >
        <source src="/video/hero-head-turn-alpha.webm" type="video/webm" />
        <source src="/video/hero-head-turn.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
