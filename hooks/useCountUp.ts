import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    fromRef.current = count;
    startRef.current = null;

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(fromRef.current + (target - fromRef.current) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    }

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return count;
}










// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable React hook for animating numeric values with a smooth
//   count-up transition.
// • Starts counting from the current displayed value instead of resetting to
//   zero whenever the target changes.
// • Uses requestAnimationFrame for high-performance, frame-synced animations.
// • Applies a cubic ease-out curve to create a natural deceleration effect.
// • Supports configurable animation duration through the duration parameter.
// • Automatically resets to 0 when the target value is zero.
// • Cancels any pending animation frame on cleanup to prevent memory leaks and
//   overlapping animations.
// • Returns the current animated number, allowing UI components (statistics,
//   dashboards, counters, analytics cards, etc.) to display smoothly
//   transitioning values.
// ─────────────────────────────────────────────────────────────────────────────