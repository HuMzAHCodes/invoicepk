"use client";

import { useEffect, useRef } from "react";
import { useCursorContext } from "./CursorProvider";

interface CursorZoneProps {
  id: string;
  children: React.ReactNode;
}

export default function CursorZone({ id, children }: CursorZoneProps) {
  const ref = useRef<HTMLElement>(null);
  const { registerSection, unregisterSection } = useCursorContext();

  useEffect(() => {
    if (ref.current) {
      const cleanup = registerSection(id, ref.current);
      return () => {
        cleanup();
        unregisterSection(id);
      };
    }
  }, [id, registerSection, unregisterSection]);

  return (
    <section id={id} ref={ref}>
      {children}
    </section>
  );
}
