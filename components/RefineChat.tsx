"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import VoiceDictateButton from "@/components/VoiceDictateButton";
import {
  checkpointIndexAfterRefine,
  checkpointShortLabel,
  type DraftCheckpoint,
} from "@/lib/draftCheckpoint";
import { COMPOSER_ROW, COMPOSER_TEXTAREA_BASE } from "@/lib/composerField";
import { useComposerAutosize } from "@/lib/useComposerAutosize";
import { useMdUp } from "@/lib/useMdUp";

interface RefineChatProps {
  refineInput: string;
  setRefineInput: Dispatch<SetStateAction<string>>;
  refineTurns: string[];
  draftCheckpoints: DraftCheckpoint[];
  onRestoreCheckpoint: (index: number) => void;
  onRefine: () => void;
  isLoading: boolean;
  isRefining: boolean;
  /** When true, sits inside a parent card (no outer border/radius). */
  embedded?: boolean;
  /** False while tab panel is hidden — avoids broken autosize / clipped placeholder. */
  panelActive?: boolean;
}

export default function RefineChat({
  refineInput,
  setRefineInput,
  refineTurns,
  draftCheckpoints,
  onRestoreCheckpoint,
  onRefine,
  isLoading,
  isRefining,
  embedded = false,
  panelActive = true,
}: RefineChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const mdUp = useMdUp();
  const refineEmptyMin = mdUp ? 28 : 40;
  const refineEmptyMax = mdUp ? 48 : 54;
  const refineTextareaRef = useComposerAutosize(
    refineInput,
    160,
    panelActive,
    isLoading,
    refineEmptyMin,
    refineEmptyMax
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [refineTurns.length, isRefining]);

  const rootClass = embedded
    ? "flex flex-col bg-white overflow-hidden min-h-[240px]"
    : "rounded-lg border border-linkedin-border bg-white overflow-hidden flex flex-col";

  const lastCp = draftCheckpoints.length - 1;

  return (
    <div className={rootClass}>
      <div className="px-4 pt-4 pb-3 border-b border-linkedin-border">
        <p className="text-[13px] font-semibold text-linkedin-text">
          Ask For Edits
        </p>
        <p className="text-[12px] text-linkedin-secondary mt-1 leading-snug">
          Describe what you want changed. The draft in the preview updates after
          each request, and you can keep refining from there.
        </p>
      </div>

      <div className="flex flex-col bg-linkedin-bg min-h-[200px] max-h-[min(400px,46vh)] border-b border-linkedin-border">
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          {refineTurns.length === 0 && !isRefining && (
            <p className="text-[12px] text-linkedin-secondary leading-relaxed text-left">
              Your requests appear below. For example: simpler words, a shorter
              opening, or a less formal tone.
            </p>
          )}
          {refineTurns.map((turn, i) => {
            const cpIdx = checkpointIndexAfterRefine(draftCheckpoints, i);
            const canRestoreBubble =
              cpIdx >= 0 &&
              cpIdx < lastCp &&
              !isLoading;
            return (
              <div
                key={`${i}-${turn.slice(0, 32)}`}
                className="flex flex-col items-end gap-1 w-full"
              >
                <button
                  type="button"
                  disabled={!canRestoreBubble}
                  onClick={() =>
                    canRestoreBubble && onRestoreCheckpoint(cpIdx)
                  }
                  title={
                    canRestoreBubble
                      ? "Restore draft to how it was after this request"
                      : lastCp === cpIdx
                        ? "Current version"
                        : "Cannot restore while loading"
                  }
                  className={`max-w-[95%] sm:max-w-[90%] rounded-[4px] border px-3 py-2 text-[14px] leading-[1.43] text-left text-linkedin-text transition-colors ${
                    canRestoreBubble
                      ? "border-linkedin-border bg-white hover:bg-linkedin-hover hover:border-[#c7c5c1] cursor-pointer text-left"
                      : "border-linkedin-border bg-white cursor-default"
                  } disabled:opacity-100`}
                >
                  {turn}
                </button>
                {canRestoreBubble ? (
                  <span className="text-[10px] font-semibold text-linkedin-blue pr-0.5">
                    Restore this version
                  </span>
                ) : null}
              </div>
            );
          })}
          {isRefining && (
            <div className="flex justify-start w-full">
              <div className="rounded-[4px] border border-linkedin-border bg-white px-3 py-2.5 flex items-center gap-1.5 min-h-[40px]">
                <span className="flex items-center gap-1" aria-hidden>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-linkedin-secondary/45 animate-bounce" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-linkedin-secondary/45 animate-bounce [animation-delay:120ms]" />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-linkedin-secondary/45 animate-bounce [animation-delay:240ms]" />
                </span>
                <span className="sr-only">Updating draft</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-px w-full" aria-hidden />
        </div>
      </div>

      {draftCheckpoints.length > 1 ? (
        <div className="px-4 py-2.5 border-b border-linkedin-border bg-white">
          <p className="text-[11px] font-semibold text-linkedin-secondary uppercase tracking-wide mb-2">
            Draft history
          </p>
          <div className="flex flex-wrap gap-1.5">
            {draftCheckpoints.map((c, i) => {
              const isCurrent = i === lastCp;
              return (
                <button
                  key={`draft-cp-${i}`}
                  type="button"
                  disabled={isCurrent || isLoading}
                  onClick={() => !isCurrent && onRestoreCheckpoint(i)}
                  title={
                    isCurrent
                      ? "Current draft"
                      : `Restore ${checkpointShortLabel(c, i)}`
                  }
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    isCurrent
                      ? "border-linkedin-blue bg-linkedin-blue/10 text-linkedin-blue cursor-default"
                      : "border-linkedin-border bg-white text-linkedin-secondary hover:bg-linkedin-hover hover:text-linkedin-text"
                  } disabled:opacity-100`}
                >
                  {checkpointShortLabel(c, i)}
                  {isCurrent ? " · current" : ""}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="px-4 py-2 bg-white">
        <label htmlFor="refine-message" className="sr-only">
          Refinement request
        </label>
        <div className={COMPOSER_ROW}>
          <textarea
            ref={refineTextareaRef}
            id="refine-message"
            value={refineInput}
            onChange={(e) => setRefineInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (refineInput.trim() && !isLoading) onRefine();
              }
            }}
            rows={1}
            placeholder="What to change…"
            enterKeyHint="send"
            disabled={isLoading}
            className={`${COMPOSER_TEXTAREA_BASE} disabled:opacity-50 max-h-[160px]`}
          />
          <VoiceDictateButton setValue={setRefineInput} disabled={isLoading} />
          <button
            type="button"
            onClick={onRefine}
            disabled={isLoading || !refineInput.trim()}
            aria-label="Send refinement"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linkedin-blue text-white shadow-sm transition-colors hover:bg-linkedin-blue-hover md:h-7 md:w-7 disabled:pointer-events-none disabled:bg-linkedin-border disabled:text-linkedin-secondary disabled:shadow-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5 md:h-3.5 md:w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 19V6M12 6l-4.25 4.25M12 6l4.25 4.25" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-linkedin-secondary mt-2 text-right">
          Ctrl+Enter or Cmd+Enter to send
        </p>
      </div>
    </div>
  );
}
