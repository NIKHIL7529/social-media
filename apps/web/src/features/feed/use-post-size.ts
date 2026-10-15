"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function usePostSize({ ratio, expanded }: { ratio: number; expanded: boolean }) {
  const cardRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  const sizing = useRef({ viewport: "", width: 0 });

  useLayoutEffect(() => {
    const card = cardRef.current;
    const media = mediaRef.current;
    const container = card?.parentElement;
    if (!card || !media || !container) return;
    const measure = () => {
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const availableWidth = container.clientWidth;
      if (!desktop) {
        sizing.current = { viewport: "", width: availableWidth };
        setWidth(availableWidth);
        return;
      }
      const styles = getComputedStyle(document.documentElement);
      const navigation = parseFloat(styles.getPropertyValue("--nav-height")) || 0;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const viewport = `${availableWidth}:${viewportHeight}:${navigation}:${ratio}`;
      const contentHeight = Array.from(card.children)
        .filter(child => child !== media && child.tagName !== "DIALOG")
        .reduce((height, child) => height + child.getBoundingClientRect().height, 0);
      if (viewport !== sizing.current.viewport) {
        sizing.current.viewport = viewport;
        sizing.current.width = availableWidth;
      }
      // Shrink monotonically as wrapping changes. This avoids resize loops at container breakpoints.
      if (!expanded) sizing.current.width = Math.min(sizing.current.width, Math.max(96, viewportHeight - navigation - contentHeight - 32) * ratio);
      setWidth(sizing.current.width);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    Array.from(card.children).filter(child => child !== media && child.tagName !== "DIALOG").forEach(child => observer.observe(child));
    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [ratio, expanded]);

  return { cardRef, mediaRef, width };
}
