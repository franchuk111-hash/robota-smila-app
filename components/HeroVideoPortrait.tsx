"use client";
import { useEffect, useRef, useState } from "react";

// Rounded video card that "scrubs" via mouse X on desktop, like a head-turn following the cursor.
export default function HeroVideoPortrait() {
  const [show, setShow] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setShow(window.innerWidth >= 1100);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!show || !video) return;

    let prevX: number | null = null;
    let target = 0;

    const onMove = (e: MouseEvent) => {
      if (!video.duration) return;
      if (prevX === null) {
        prevX = e.clientX;
        return;
      }
      const delta = e.clientX - prevX;
      prevX = e.clientX;
      target = Math.max(
        0,
        Math.min(video.duration, target + (delta / window.innerWidth) * 0.8 * video.duration)
      );
      video.currentTime = target;
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [show]);

  if (!show) return null;

  return (
    <div className="video-portrait">
      <video ref={videoRef} src="/video/hero-head-turn.mp4" muted playsInline preload="auto" />
    </div>
  );
}
