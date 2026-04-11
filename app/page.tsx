"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import InputForm from "@/components/InputForm";
import OutputBox from "@/components/OutputBox";
import RefineChat from "@/components/RefineChat";
import type { DraftCheckpoint } from "@/lib/draftCheckpoint";
import type { GenerateAction } from "@/lib/openai";
import { sanitizePostOutput } from "@/lib/sanitizePost";

function NavbarLogo() {
  return (
    <Image
      src="/PostedIn-Logo.png"
      alt="PostedIn"
      width={34}
      height={34}
      className="h-[34px] w-[34px] shrink-0 object-contain rounded-[6px]"
      priority
    />
  );
}

export default function Home() {
  const [thoughts, setThoughts] = useState("");
  const [writingSample, setWritingSample] = useState("");
  const [post, setPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState("");
  const [refineInput, setRefineInput] = useState("");
  const [refineTurns, setRefineTurns] = useState<string[]>([]);
  const [draftCheckpoints, setDraftCheckpoints] = useState<DraftCheckpoint[]>(
    []
  );
  const [leftTab, setLeftTab] = useState<"input" | "refine">("input");

  const canUseRefine =
    thoughts.trim().length > 0 && (post.trim().length > 0 || isRefining);

  useEffect(() => {
    // While any generate/refine/improve runs, post is cleared first — don't jump tabs mid-request.
    if (isLoading) return;
    const allowRefine =
      thoughts.trim().length > 0 &&
      (post.trim().length > 0 || isRefining);
    if (leftTab === "refine" && !allowRefine) {
      setLeftTab("input");
    }
  }, [leftTab, thoughts, post, isRefining, isLoading]);

  const restoreDraftCheckpoint = (index: number) => {
    if (isLoading) return;
    const snap = draftCheckpoints[index];
    if (!snap || index >= draftCheckpoints.length - 1) return;
    setPost(snap.post);
    setRefineTurns([...snap.turns]);
    setDraftCheckpoints(draftCheckpoints.slice(0, index + 1));
  };

  const callAPI = async (
    action: GenerateAction,
    opts?: { refinement?: string }
  ) => {
    setIsLoading(true);
    if (action === "refine") setIsRefining(true);
    setError("");

    const postBackup = post;

    try {
      setPost("");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thoughts,
          writingSample,
          action,
          currentPost: postBackup,
          refinement: opts?.refinement,
          refinementHistory:
            action === "refine" ? refineTurns : undefined,
        }),
      });

      const ct = res.headers.get("content-type") || "";

      if (!res.ok) {
        let msg = "Something went wrong";
        if (ct.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          msg = data.error || msg;
        } else {
          const t = await res.text();
          if (t) msg = t;
        }
        throw new Error(msg);
      }

      if (!res.body || !ct.includes("text/plain")) {
        throw new Error("Unexpected response from server");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          setPost(raw);
        }
        raw += decoder.decode();
      } finally {
        reader.releaseLock();
      }

      const finalPost = sanitizePostOutput(raw);
      let nextTurns = refineTurns;

      if (action === "generate" || action === "regenerate") {
        nextTurns = [];
        setDraftCheckpoints([
          { post: finalPost, turns: nextTurns, kind: "initial" },
        ]);
        setRefineInput("");
      } else if (action === "refine" && opts?.refinement?.trim()) {
        nextTurns = [...refineTurns, opts.refinement.trim()];
        setDraftCheckpoints((prev) => [
          ...prev,
          {
            post: finalPost,
            turns: nextTurns,
            kind: "refine",
            afterRefineIndex: refineTurns.length,
          },
        ]);
        setRefineInput("");
      } else if (action === "improve_hook") {
        nextTurns = [...refineTurns];
        setDraftCheckpoints((prev) => [
          ...prev,
          { post: finalPost, turns: nextTurns, kind: "hook" },
        ]);
      } else if (action === "sound_like_me") {
        nextTurns = [...refineTurns];
        setDraftCheckpoints((prev) => [
          ...prev,
          { post: finalPost, turns: nextTurns, kind: "sound" },
        ]);
      }

      setPost(finalPost);
      setRefineTurns(nextTurns);
    } catch (err: unknown) {
      if (postBackup) setPost(postBackup);
      else setPost("");
      const message =
        err instanceof Error ? err.message : "Failed to generate post";
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen bg-linkedin-bg">
      {/* LinkedIn nav bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-linkedin-border shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-[1128px] flex items-center justify-between gap-4 px-4 h-[52px]">
          <div className="flex items-center min-w-0 shrink-0">
            <NavbarLogo />
          </div>
          <p className="text-[11px] sm:text-[12px] font-semibold text-linkedin-secondary text-right leading-snug shrink-0">
            Your LinkedIn Writing Assistant
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1128px] px-4 py-4 sm:py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-[14px] text-red-800 flex items-center gap-2 animate-slideUp">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
          {/* Left: Input / Refine tabs */}
          <div className="animate-fadeIn flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-linkedin-secondary uppercase tracking-wider px-0.5">
              Compose
            </p>
            <div className="bg-white rounded-lg border border-linkedin-border overflow-hidden">
              <div
                className="flex border-b border-linkedin-border px-2 sm:px-3 pt-1"
                role="tablist"
                aria-label="Compose panel"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={leftTab === "input"}
                  id="tab-input"
                  aria-controls="panel-input"
                  onClick={() => setLeftTab("input")}
                  className={`px-3 sm:px-4 py-2.5 text-[14px] font-semibold border-b-2 -mb-px transition-colors duration-150 ${
                    leftTab === "input"
                      ? "border-linkedin-blue text-linkedin-blue"
                      : "border-transparent text-linkedin-secondary hover:text-linkedin-text"
                  }`}
                >
                  Input
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={leftTab === "refine"}
                  id="tab-refine"
                  aria-controls="panel-refine"
                  disabled={!canUseRefine}
                  title={
                    !thoughts.trim()
                      ? "Add a prompt on the Input tab first"
                      : !post.trim() && !isRefining
                        ? "Generate a post first, then you can refine it"
                        : undefined
                  }
                  onClick={() => canUseRefine && setLeftTab("refine")}
                  className={`px-3 sm:px-4 py-2.5 text-[14px] font-semibold border-b-2 -mb-px transition-colors duration-150 ${
                    leftTab === "refine"
                      ? "border-linkedin-blue text-linkedin-blue"
                      : "border-transparent text-linkedin-secondary hover:text-linkedin-text"
                  } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-linkedin-secondary`}
                >
                  Refine
                </button>
              </div>

              <div
                id="panel-input"
                role="tabpanel"
                aria-labelledby="tab-input"
                hidden={leftTab !== "input"}
                className="p-4"
              >
                <InputForm
                  thoughts={thoughts}
                  setThoughts={setThoughts}
                  writingSample={writingSample}
                  setWritingSample={setWritingSample}
                  onGenerate={() => callAPI("generate")}
                  isLoading={isLoading}
                  panelActive={leftTab === "input"}
                />
              </div>

              <div
                id="panel-refine"
                role="tabpanel"
                aria-labelledby="tab-refine"
                hidden={leftTab !== "refine"}
              >
                {canUseRefine ? (
                  <RefineChat
                    refineInput={refineInput}
                    setRefineInput={setRefineInput}
                    refineTurns={refineTurns}
                    draftCheckpoints={draftCheckpoints}
                    onRestoreCheckpoint={restoreDraftCheckpoint}
                    onRefine={() =>
                      callAPI("refine", { refinement: refineInput.trim() })
                    }
                    isLoading={isLoading}
                    isRefining={isRefining}
                    embedded
                    panelActive={leftTab === "refine"}
                  />
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-[13px] text-linkedin-secondary leading-relaxed">
                      Add a prompt and generate a post on the{" "}
                      <span className="font-semibold text-linkedin-text">
                        Input
                      </span>{" "}
                      tab to use Refine.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: LinkedIn preview only */}
          <div
            className="animate-fadeIn"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            <p className="text-[11px] font-semibold text-linkedin-secondary uppercase tracking-wider mb-2 px-0.5">
              Output
            </p>
            <OutputBox
              post={post}
              setPost={setPost}
              onRegenerate={() => callAPI("regenerate")}
              onImproveHook={() => callAPI("improve_hook")}
              onSoundLikeMe={() => callAPI("sound_like_me")}
              isLoading={isLoading}
              isRefining={isRefining}
              hasWritingSample={writingSample.trim().length > 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
