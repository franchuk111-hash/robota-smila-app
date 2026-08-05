"use client";
import { useEffect, useRef, useState } from "react";

const IDLE_SPEED = 0.15; // fraction of video duration per second, ping-pong
const IDLE_DELAY = 600; // ms of no mouse movement before idle motion resumes

// Rounded video card: idles in a slow head-turn ping-pong, and scrubs via mouse X on desktop.
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
    let lastMoveAt = 0;
    let idleDir: 1 | -1 = 1;
    let lastFrameAt = performance.now();
    let rafId = requestAnimationFrame(tick);

    function tick(now: number) {
      const dt = (now - lastFrameAt) / 1000;
      lastFrameAt = now;
      if (video && video.duration && now - lastMoveAt > IDLE_DELAY) {
        let t = video.currentTime + idleDir * IDLE_SPEED * video.duration * dt;
        if (t >= video.duration) {
          t = video.duration;
          idleDir = -1;
        } else if (t <= 0) {
          t = 0;
          idleDir = 1;
        }
        video.currentTime = t;
      }
      rafId = requestAnimationFrame(tick);
    }

    const onMove = (e: MouseEvent) => {
      if (!video.duration) return;
      lastMoveAt = performance.now();
      if (prevX === null) {
        prevX = e.clientX;
        return;
      }
      const delta = e.clientX - prevX;
      prevX = e.clientX;
      idleDir = delta >= 0 ? 1 : -1;
      const next = video.currentTime + (delta / window.innerWidth) * 0.8 * video.duration;
      video.currentTime = Math.max(0, Math.min(video.duration, next));
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="video-portrait">
      <video ref={videoRef} src="/video/hero-head-turn.mp4" muted playsInline preload="auto" />
    </div>
  );
}
