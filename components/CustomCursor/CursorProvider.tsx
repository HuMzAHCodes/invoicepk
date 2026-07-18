// components/CustomCursor/CursorProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import BlobCursor from "./BlobCursor";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

interface CursorContextType {
  isActive: boolean;
  smoother: any; // ★ exposed so descendants (e.g. Navbar/CenterLinks) can call smoother.scrollTo(...)
  registerSection: (id: string, element: HTMLElement) => () => void;
  unregisterSection: (id: string) => void;
}

const CursorContext = createContext<CursorContextType | null>(null);

export function useCursorContext() {
  const ctx = useContext(CursorContext);
  if (!ctx)
    throw new Error("useCursorContext must be used within CursorProvider");
  return ctx;
}

export function CursorProvider({
  children,
  sticky, // ★ new — rendered outside #smooth-content, but still inside CursorContext.Provider
  targetIds = ["how-it-works", "faq", "pricing"],
}: {
  children: ReactNode;
  sticky?: ReactNode; // ★
  targetIds?: string[];
}) {
  const [isActive, setIsActive] = useState(false);
  const [smoother, setSmoother] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize ScrollSmoother for entire page
  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    const smootherInstance = ScrollSmoother.create({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: 1.5,
      effects: true,
      smoothTouch: 0.1,
      ignoreMobileResize: true,
    });

    setSmoother(smootherInstance);

    return () => {
      smootherInstance.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Track which target sections are in viewport
  useEffect(() => {
    const sectionStates = new Map<string, boolean>();
    const observerMap = new Map<string, IntersectionObserver>();

    targetIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            sectionStates.set(id, entry.isIntersecting);
            // Active if ANY target section is intersecting
            const anyActive = Array.from(sectionStates.values()).some((v) => v);
            setIsActive(anyActive);
          });
        },
        { rootMargin: "100px", threshold: 0.1 },
      );

      observer.observe(element);
      observerMap.set(id, observer);
    });

    return () => {
      observerMap.forEach((observer) => observer.disconnect());
    };
  }, [targetIds.join(",")]);

  const registerSection = (id: string, element: HTMLElement) => {
    return () => {};
  };

  const unregisterSection = (id: string) => {};

  return (
    <CursorContext.Provider
      value={{ isActive, smoother, registerSection, unregisterSection }} // ★ smoother added
    >
      {/* ★ sticky content — outside the transformed wrapper, so position:sticky works,
             but still a context descendant so useCursorContext() is valid here */}
      {sticky}

      <div ref={wrapperRef} id="smooth-wrapper">
        <div ref={contentRef} id="smooth-content">
          {children}
        </div>
      </div>
      {isActive && <BlobCursor isActive={isActive} />}
    </CursorContext.Provider>
  );
}
