"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

function speechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function isVoiceDictationSupported(): boolean {
  return speechRecognitionCtor() !== null;
}

function appendTranscript(prev: string, chunk: string): string {
  const t = chunk.trim();
  if (!t) return prev;
  const sep = prev.length > 0 && !/\s$/.test(prev) ? " " : "";
  return prev + sep + t;
}

interface VoiceDictateButtonProps {
  setValue: Dispatch<SetStateAction<string>>;
  disabled?: boolean;
}

export default function VoiceDictateButton({
  setValue,
  disabled = false,
}: VoiceDictateButtonProps) {
  const browserOk = useSyncExternalStore(
    () => () => {},
    isVoiceDictationSupported,
    () => false
  );
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const setValueRef = useRef(setValue);

  useEffect(() => {
    setValueRef.current = setValue;
  }, [setValue]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const toggle = useCallback(() => {
    setError(null);
    if (!browserOk) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    if (listening) {
      stop();
      return;
    }

    const Ctor = speechRecognitionCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang =
      typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : "en-US";

    rec.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          const text = r[0]?.transcript ?? "";
          setValueRef.current((prev) => appendTranscript(prev, text));
        }
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      setError(
        event.error === "not-allowed"
          ? "Microphone permission denied."
          : `Voice error: ${event.error}`
      );
      stop();
    };

    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };

    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      setError("Could not start voice input.");
      stop();
    }
  }, [browserOk, listening, stop]);

  if (!browserOk) return null;

  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0 self-end">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        title={
          listening
            ? "Stop listening"
            : "Speak to type (uses your microphone)"
        }
        className={`flex h-10 w-10 box-border items-center justify-center rounded-full shadow-sm ring-1 ring-inset transition-colors md:h-7 md:w-7 disabled:pointer-events-none disabled:opacity-40 ${
          listening
            ? "bg-red-50 text-red-600 ring-red-300"
            : "bg-white text-linkedin-secondary ring-linkedin-border hover:bg-linkedin-hover"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5 w-5 md:h-3.5 md:w-3.5"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5.5-3a.75.75 0 00-1.5 0 4.5 4.5 0 01-9 0 .75.75 0 00-1.5 0 6 6 0 006.75 5.96V20H9a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-2.25v-3.04A6 6 0 0017.5 11z" />
        </svg>
      </button>
      {error ? (
        <p
          className="max-w-[140px] text-right text-[10px] leading-tight text-red-600"
          role="status"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
