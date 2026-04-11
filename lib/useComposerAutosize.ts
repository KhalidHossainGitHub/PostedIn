"use client";

import { useLayoutEffect, useRef } from "react";

const MIN_FALLBACK = 30;

/**
 * Match Refine + Input composer height to content. Uses height:0 before
 * measuring scrollHeight so browsers don’t keep an oversized default min-height
 * (which made single-line Prompt text look vertically centered in a tall box).
 */
export function useComposerAutosize(
  value: string,
  maxHeight: number,
  panelActive: boolean,
  isLoading: boolean,
  /** When set, empty (trimmed) values cap between these heights (Input tab). */
  emptyMinH?: number,
  emptyMaxH?: number
) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!panelActive) {
      el.style.removeProperty("height");
      el.style.removeProperty("overflow-y");
      return;
    }

    el.style.height = "0";
    el.style.overflow = "hidden";
    const measured = el.scrollHeight;

    const hasEmptyCaps = emptyMinH !== undefined && emptyMaxH !== undefined;
    const isEmpty = hasEmptyCaps && value.trim().length === 0;

    let h: number;
    if (isEmpty) {
      h = Math.min(
        Math.max(measured, emptyMinH as number),
        emptyMaxH as number
      );
    } else {
      h = Math.min(Math.max(measured, MIN_FALLBACK), maxHeight);
    }

    el.style.height = `${h}px`;
    const overflowCap = isEmpty ? (emptyMaxH as number) : maxHeight;
    el.style.overflowY = measured > overflowCap ? "auto" : "hidden";
  }, [
    value,
    maxHeight,
    panelActive,
    isLoading,
    emptyMinH,
    emptyMaxH,
  ]);

  return ref;
}
