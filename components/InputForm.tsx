"use client";

import type { Dispatch, SetStateAction } from "react";
import VoiceDictateButton from "@/components/VoiceDictateButton";
import { COMPOSER_ROW, COMPOSER_TEXTAREA_BASE } from "@/lib/composerField";
import { useComposerAutosize } from "@/lib/useComposerAutosize";
import { useMdUp } from "@/lib/useMdUp";

interface InputFormProps {
  thoughts: string;
  setThoughts: Dispatch<SetStateAction<string>>;
  writingSample: string;
  setWritingSample: Dispatch<SetStateAction<string>>;
  onGenerate: () => void;
  isLoading: boolean;
  /** False while this tab uses `hidden` — avoids broken autosize / clipped placeholder. */
  panelActive: boolean;
}

const PROMPT_MAX_H = 400;
const SAMPLE_MAX_H = 400;

const EMPTY_FIELD_DESKTOP = { min: 28, max: 52 } as const;
/** Match h-10 (40px) action buttons; max keeps one-line placeholder from over-growing. */
const EMPTY_FIELD_MOBILE = { min: 40, max: 54 } as const;

export default function InputForm({
  thoughts,
  setThoughts,
  writingSample,
  setWritingSample,
  onGenerate,
  isLoading,
  panelActive,
}: InputFormProps) {
  const mdUp = useMdUp();
  const emptyMin = mdUp ? EMPTY_FIELD_DESKTOP.min : EMPTY_FIELD_MOBILE.min;
  const emptyMax = mdUp ? EMPTY_FIELD_DESKTOP.max : EMPTY_FIELD_MOBILE.max;

  const thoughtsRef = useComposerAutosize(
    thoughts,
    PROMPT_MAX_H,
    panelActive,
    isLoading,
    emptyMin,
    emptyMax
  );
  const sampleRef = useComposerAutosize(
    writingSample,
    SAMPLE_MAX_H,
    panelActive,
    isLoading,
    emptyMin,
    emptyMax
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="thoughts"
          className="block text-[13px] font-semibold text-linkedin-text mb-1"
        >
          Prompt
        </label>
        <p className="text-[12px] text-linkedin-secondary mb-2 leading-snug">
          Rough ideas or bullets—the model shapes them into a post.
        </p>
        <div className={COMPOSER_ROW}>
          <textarea
            ref={thoughtsRef}
            id="thoughts"
            rows={1}
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder="Ideas, lessons, takeaway…"
            disabled={isLoading}
            className={`${COMPOSER_TEXTAREA_BASE} disabled:opacity-50 max-h-[400px]`}
          />
          <VoiceDictateButton setValue={setThoughts} disabled={isLoading} />
        </div>
      </div>

      <div>
        <label
          htmlFor="writingSample"
          className="block text-[13px] font-semibold text-linkedin-text mb-1"
        >
          Your Writing Sample
        </label>
        <p className="text-[12px] text-linkedin-secondary mb-2 leading-snug">
          A sample of your writing helps match structure, pacing, and voice.
        </p>
        <div className={COMPOSER_ROW}>
          <textarea
            ref={sampleRef}
            id="writingSample"
            rows={1}
            value={writingSample}
            onChange={(e) => setWritingSample(e.target.value)}
            placeholder="Posts or notes that sound like you…"
            disabled={isLoading}
            className={`${COMPOSER_TEXTAREA_BASE} disabled:opacity-50 max-h-[400px]`}
          />
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !thoughts.trim()}
        className="w-full rounded-full bg-linkedin-blue px-6 py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-linkedin-blue-hover active:bg-linkedin-blue-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-linkedin-blue"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating...
          </span>
        ) : (
          "Generate Post"
        )}
      </button>
    </div>
  );
}
