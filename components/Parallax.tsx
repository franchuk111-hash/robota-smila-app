"use client";
import { useEffect } from "react";

// Паралакс: елементи з [data-parallax="швидкість"] зміщуються при скролі.
// Зберігаємо обертання через [data-rot="градуси"].
export default function Parallax() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    );
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      els.forEach((el) => {
        const sp = parseFloat(el.dataset.parallax || "0");
        const rot = el.dataset.rot || "0";
        el.style.transform = `translateY(${(y * sp).toFixed(1)}px) rotate(${rot}deg)`;
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
