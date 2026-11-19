"use client";

import { useEffect, useRef } from "react";

const DRIFT_PIXELS_PER_SECOND = 5.628;

export default function StarField({ imageSrc }: { imageSrc: string }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = track.current;
    if (!field) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let height = Math.max(1, field.clientHeight);
    let frame: number | undefined;

    function update() {
      frame = undefined;
      if (!field || document.hidden || reducedMotion.matches) return;
      // Wrap scrolling independently of the continuous ambient drift.
      const offset = (Math.max(0, window.scrollY) * 0.12) % height;
      field.style.transform = `translate3d(0, ${-offset}px, 0)`;
    }

    function onScroll() {
      if (!document.hidden && !reducedMotion.matches && frame === undefined) {
        frame = window.requestAnimationFrame(update);
      }
    }

    function sync() {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      frame = undefined;
      if (!field) return;
      field.style.animationPlayState = document.hidden ? "paused" : "";
      if (reducedMotion.matches) {
        field.style.transform = "";
      } else if (!document.hidden) {
        height = Math.max(1, field.clientHeight);
        field.style.setProperty("--night-sky-drift-duration", `${height / DRIFT_PIXELS_PER_SECOND}s`);
        update();
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
    sync();

    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
      field.style.transform = "";
      field.style.animationPlayState = "";
      field.style.removeProperty("--night-sky-drift-duration");
    };
  }, []);

  return (
    <div ref={track} className="night-sky-star-track">
      {/* Three copies cover the combined drift and scroll offsets without gaps. */}
      {[0, 1, 2].map((copy) => (
        <div
          key={copy}
          className="night-sky-stars"
          style={{
            backgroundImage: `url("${imageSrc}")`,
            transform: `translateY(${copy * 100}%)`,
          }}
        />
      ))}
    </div>
  );
}
