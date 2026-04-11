import { useState, useEffect, useRef, useLayoutEffect } from "react";

interface OutputBoxProps {
  post: string;
  setPost: (v: string) => void;
  onRegenerate: () => void;
  onImproveHook: () => void;
  onSoundLikeMe: () => void;
  isLoading: boolean;
  isRefining: boolean;
  hasWritingSample: boolean;
}

function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-3 h-3 text-linkedin-secondary fill-current">
      <path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.55.55A1.5 1.5 0 015 6.62v1.07a.75.75 0 00.22.53l.56.56a.75.75 0 00.53.22H7v.69a.75.75 0 00.22.53l.56.56a.75.75 0 01.22.53V13a5 5 0 01-5-5zm6.24 4.83l2-2.46a.75.75 0 00.09-.8l-.58-1.16A.76.76 0 0010 8H7v-.19a.51.51 0 01.28-.45l.38-.19a.74.74 0 01.68 0L9 7.5l.38-.7a1 1 0 00.12-.48v-.85a.78.78 0 01.21-.53l1.07-1.09a5 5 0 01-1.54 9z" />
    </svg>
  );
}

function LikeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 22V11l-5 1v8.5A1.5 1.5 0 003.5 22H7zm0-11l3-7a2 2 0 012-2 2 2 0 012 2v5h5.5a2 2 0 012 2.22l-1.5 9A2 2 0 0118.06 22H7" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function RepostIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export default function OutputBox({
  post,
  setPost,
  onRegenerate,
  onImproveHook,
  onSoundLikeMe,
  isLoading,
  isRefining,
  hasWritingSample,
}: OutputBoxProps) {
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const charCount = post.length;

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post);
    setCopied(true);
  };

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.overflow = "hidden";
    el.style.height = "0";
    el.style.height = `${el.scrollHeight}px`;
  }, [post, isLoading]);

  // Empty state
  if (!post && !isLoading) {
    return (
      <div className="bg-white rounded-lg border border-linkedin-border overflow-hidden">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-linkedin-search flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-linkedin-secondary/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-linkedin-text">
            Your Post Preview Will Appear Here
          </p>
          <p className="text-[12px] text-linkedin-secondary mt-1 max-w-[240px] leading-relaxed">
            Fill In Your Thoughts On The Left And Click Generate Post To See It Come To Life
          </p>
        </div>
      </div>
    );
  }

  // Loading state (first generation)
  if (isLoading && !post) {
    return (
      <div className="bg-white rounded-lg border border-linkedin-border overflow-hidden">
        {/* Shimmer skeleton */}
        <div className="px-4 pt-3 pb-0">
          <div className="flex gap-2">
            <div className="w-12 h-12 rounded-full animate-shimmer shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3.5 w-32 rounded animate-shimmer" />
              <div className="h-3 w-48 rounded animate-shimmer" />
              <div className="h-3 w-20 rounded animate-shimmer" />
            </div>
          </div>
        </div>
        <div className="px-4 pt-4 pb-4 space-y-2.5">
          <div className="h-3.5 w-full rounded animate-shimmer" />
          <div className="h-3.5 w-full rounded animate-shimmer" />
          <div className="h-3.5 w-4/5 rounded animate-shimmer" />
          <div className="h-3.5 w-full rounded animate-shimmer" style={{ animationDelay: "0.1s" }} />
          <div className="h-3.5 w-3/5 rounded animate-shimmer" style={{ animationDelay: "0.2s" }} />
        </div>
        <div className="mx-4 border-t border-linkedin-border" />
        <div className="flex items-center justify-center gap-2 py-4 text-linkedin-blue">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[13px] font-semibold">Generating Your Post...</span>
        </div>
      </div>
    );
  }

  // Post card
  return (
    <div className="flex flex-col gap-2.5">
      <div className="bg-white rounded-lg border border-linkedin-border overflow-hidden animate-fadeIn">
        {/* Post header — top-aligned with avatar; matches LinkedIn-style stack */}
        <div className="flex items-start gap-2.5 px-4 pt-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center shrink-0 self-start ring-2 ring-white shadow-sm">
            <span className="text-white text-[14px] font-bold leading-none">KH</span>
          </div>
          <div className="min-w-0 flex-1 self-start pt-0.5">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="min-w-0 flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                <p className="text-[14px] font-semibold text-linkedin-text leading-tight hover:text-linkedin-blue hover:underline cursor-pointer transition-colors duration-150">
                  Khalid Hossain
                </p>
                <span className="text-[12px] text-linkedin-secondary shrink-0 leading-tight">
                  · 1st
                </span>
              </div>
              <button
                type="button"
                className="shrink-0 text-linkedin-blue text-[14px] font-semibold leading-tight hover:underline transition-colors duration-150 hidden sm:block text-right"
              >
                + Follow
              </button>
            </div>
            <p
              className="text-[12px] text-linkedin-secondary leading-snug mt-0.5 truncate pr-1"
              title="Data Platforms Co-Op @ Sanofi | Software Engineering @ Ontario Tech"
            >
              Data Platforms Co-Op @ Sanofi | Software Engineering @ Ontario Tech
            </p>
            <p className="text-[12px] text-linkedin-secondary leading-snug mt-0.5 flex items-center gap-1">
              <span>Just now</span>
              <span>·</span>
              <GlobeIcon />
            </p>
          </div>
        </div>

        {/* Post body: always editable, same look as a LinkedIn text block */}
        <div className="px-4 pt-2.5 pb-2">
          <textarea
            ref={bodyRef}
            value={post}
            onChange={(e) => setPost(e.target.value)}
            rows={1}
            spellCheck
            readOnly={isLoading}
            className="post-body-input w-full block text-[14px] leading-[1.43] text-linkedin-text bg-transparent border-0 border-transparent rounded-[4px] px-2.5 py-1.5 m-0 shadow-none outline-none resize-none whitespace-pre-wrap break-words [overflow-wrap:anywhere] caret-linkedin-blue box-border transition-[box-shadow] duration-150 focus:ring-0 focus-visible:shadow-[inset_0_0_0_1px_rgba(10,102,194,0.35)] read-only:cursor-wait"
            aria-label="Post text"
          />
          <div className="flex justify-end pt-1">
            <span
              className={`text-[12px] tabular-nums transition-colors duration-200 ${charCount > 1200 ? "text-amber-600 font-semibold" : "text-linkedin-secondary"}`}
            >
              {charCount.toLocaleString()} / 1,200
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-linkedin-border" />

        {/* Reaction buttons */}
        <div className="flex items-center px-1 py-[2px]">
          {[
            { icon: <LikeIcon />, label: "Like" },
            { icon: <CommentIcon />, label: "Comment" },
            { icon: <RepostIcon />, label: "Repost" },
            { icon: <SendIcon />, label: "Send" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex-1 flex items-center justify-center gap-2 py-3 mx-0.5 rounded-[4px] text-linkedin-secondary hover:bg-linkedin-hover active:bg-linkedin-border transition-colors duration-150"
            >
              {action.icon}
              <span className="text-[12px] font-semibold hidden sm:inline">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading for hook / sound-like-me / regenerate (refine uses left chat) */}
      {isLoading && post && !isRefining && (
        <div className="flex items-center gap-2 px-2 text-linkedin-blue animate-fadeIn">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[12px] font-semibold">Updating Preview...</span>
        </div>
      )}

      {/* Action toolbar */}
      <div className="flex flex-wrap gap-1.5 animate-fadeIn" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
        <ActionButton onClick={handleCopy}>
          {copied ? (
            <>
              <svg className="w-[14px] h-[14px] text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              Copy
            </>
          )}
        </ActionButton>

        <ActionButton onClick={onRegenerate} disabled={isLoading}>
          <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Regenerate
        </ActionButton>

        <ActionButton onClick={onImproveHook} disabled={isLoading}>
          <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Improve Hook
        </ActionButton>

        {hasWritingSample && (
          <button
            onClick={onSoundLikeMe}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-full border border-linkedin-blue/30 bg-linkedin-blue/5 px-3 py-[6px] text-[12px] font-semibold text-linkedin-blue transition-all duration-200 hover:bg-linkedin-blue/10 hover:border-linkedin-blue/50 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Sound More Like Me
          </button>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-linkedin-border bg-white px-3 py-[6px] text-[12px] font-semibold text-linkedin-secondary transition-all duration-200 hover:bg-linkedin-hover hover:border-[#b3b1ad] hover:text-linkedin-text active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {children}
    </button>
  );
}
