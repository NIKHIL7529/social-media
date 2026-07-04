"use client";

import { RefObject, useLayoutEffect, useRef } from "react";

type UseMessageScrollOptions = {
  dependency: unknown;
};

export function useMessageScroll({ dependency }: UseMessageScrollOptions): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wasNearBottomRef = useRef(true);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (wasNearBottomRef.current || distanceFromBottom < 96) {
      container.scrollTop = container.scrollHeight;
    }
  }, [dependency]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updatePosition = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      wasNearBottomRef.current = distanceFromBottom < 96;
    };
    updatePosition();
    container.addEventListener("scroll", updatePosition, { passive: true });
    return () => container.removeEventListener("scroll", updatePosition);
  }, []);

  return containerRef;
}
