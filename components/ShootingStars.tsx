"use client";

import { useEffect, useRef } from "react";

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export default function ShootingStars() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sky = container.current;
    if (!sky || typeof sky.animate !== "function") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const active = new Map<HTMLElement, Animation>();
    let timer: number | undefined;

    function clear() {
      window.clearTimeout(timer);
      timer = undefined;
      for (const [star, animation] of active) {
        animation.cancel();
        star.remove();
      }
      active.clear();
    }

    function launch() {
      if (!sky || document.hidden || reducedMotion.matches) return;

      const width = sky.clientWidth;
      const height = sky.clientHeight;
      const rightward = Math.random() < 0.7;
      const angle = rightward ? randomBetween(18, 38) : randomBetween(142, 162);
      const radians = angle * Math.PI / 180;
      const distance = Math.min(randomBetween(260, 480), width * 0.7);
      const length = Math.min(randomBetween(85, 145), width * 0.28);
      const x = rightward ? randomBetween(width * 0.08, width * 0.7) : randomBetween(width * 0.3, width * 0.92);
      const star = document.createElement("span");
      star.className = "night-sky-meteor";
      star.style.left = `${x - length}px`;
      star.style.top = `${randomBetween(height * 0.04, height * 0.62)}px`;
      star.style.width = `${length}px`;
      sky.appendChild(star);

      const animation = star.animate([
        { transform: `translate3d(0, 0, 0) rotate(${angle}deg)`, opacity: 0, offset: 0 },
        { opacity: 0.8, offset: 0.15 },
        { opacity: 0.55, offset: 0.65 },
        { transform: `translate3d(${Math.cos(radians) * distance}px, ${Math.sin(radians) * distance}px, 0) rotate(${angle}deg)`, opacity: 0, offset: 1 },
      ], { duration: randomBetween(850, 1300), easing: "linear" });

      active.set(star, animation);
      animation.onfinish = () => {
        active.delete(star);
        star.remove();
      };
      timer = window.setTimeout(launch, randomBetween(1500, 3000));
    }

    function syncVisibility() {
      clear();
      if (!document.hidden && !reducedMotion.matches) {
        timer = window.setTimeout(launch, randomBetween(350, 1000));
      }
    }

    document.addEventListener("visibilitychange", syncVisibility);
    reducedMotion.addEventListener("change", syncVisibility);
    syncVisibility();

    return () => {
      clear();
      document.removeEventListener("visibilitychange", syncVisibility);
      reducedMotion.removeEventListener("change", syncVisibility);
    };
  }, []);

  return <div ref={container} className="night-sky-meteors" />;
}
