"use client";
import { useEffect, useRef, useState } from "react";

export default function HeroPhoneVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (preference.matches) video.pause();
      else void video.play().catch(() => {});
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (video.paused) void video.play().catch(() => {});
  }

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  }

  return (
    <div className="hero-phone" role="group" aria-label="Відеопривітання у телефоні">
      <div className="hero-phone-notch" aria-hidden="true" />
      <div className="hero-phone-header">
        <span className="hero-phone-avatar" aria-hidden="true">РС</span>
        <div><strong>Робота Сміла</strong><small>Ваше місто. Ваша робота.</small></div>
      </div>
      <div className="hero-phone-chat">
        <span className="hero-phone-label">Вітаємо у «Робота Сміла»</span>
        <div className="hero-phone-circle">
          <video ref={videoRef} muted={muted} loop playsInline preload="metadata"
            poster="/video/hero-welcome-poster.jpg" aria-label="Відеопривітання від Робота Сміла"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
            <source src="/video/hero-welcome.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-phone-controls">
          <button type="button" onClick={togglePlayback} aria-label={playing ? "Призупинити відео" : "Відтворити відео"}>
            {playing ? "Ⅱ Пауза" : "▶ Відтворити"}
          </button>
          <button type="button" onClick={toggleSound} aria-pressed={!muted}>
            {muted ? "Увімкнути звук" : "Вимкнути звук"}
          </button>
        </div>
        <div className="hero-phone-message">Знаходьте вакансії у Смілі та відкривайте їх у Telegram.</div>
      </div>
      <div className="hero-phone-home" aria-hidden="true" />
    </div>
  );
}
