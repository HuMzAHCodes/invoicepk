"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface BlobCursorProps {
  isActive?: boolean;
  zoneColor?: string;
}

export default function BlobCursor({ isActive = false, zoneColor }: BlobCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);

  const mouse = { x: -9999, y: -9999 };
  const pos = { x: mouse.x, y: mouse.y };
  const last = { x: mouse.x, y: mouse.y };

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const tick = () => {
      pos.x += (mouse.x - pos.x) * 0.18;
      pos.y += (mouse.y - pos.y) * 0.18;

      const dx = pos.x - last.x;
      const dy = pos.y - last.y;

      const velocity = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const stretch = Math.min(velocity * 0.7, 22);

      gsap.set(cursor, {
        x: pos.x,
        y: pos.y,
        rotation: angle,
        scaleX: 1 + stretch / 35,
        scaleY: 1 - stretch / 60,
      });

      last.x = pos.x;
      last.y = pos.y;
    };

    gsap.ticker.add(tick);

    // Hide default cursor when active
    if (isActive) {
      document.body.classList.add("cursor-active");
      document.documentElement.classList.add("cursor-active");
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.ticker.remove(tick);
      document.body.classList.remove("cursor-active");
      document.documentElement.classList.remove("cursor-active");
    };
  }, [isActive]);

  return (
    <div
      ref={cursorRef}
      className={`blob-cursor ${isActive ? "visible" : ""}`}
      aria-hidden="true"
      style={{
        pointerEvents: "none",
        zIndex: 9999,
        ...(zoneColor ? ({ "--cursor-color": zoneColor } as React.CSSProperties) : {}),
      }}
    />
  );
}
