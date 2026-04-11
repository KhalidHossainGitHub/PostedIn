import { NextRequest, NextResponse } from "next/server";
import { createCompletionStream, type GenerateAction } from "@/lib/openai";

const ALLOWED_ACTIONS = new Set<string>([
  "generate",
  "regenerate",
  "refine",
  "improve_hook",
  "sound_like_me",
]);

/** Per-field cap to limit abuse / runaway token costs (chars). */
const MAX_THOUGHTS = 16_000;
const MAX_WRITING_SAMPLE = 24_000;
const MAX_CURRENT_POST = 8_000;
const MAX_REFINEMENT = 4_000;
const MAX_HISTORY_ITEMS = 50;
const MAX_HISTORY_ITEM_LEN = 2_000;

function clampStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.length > max ? v.slice(0, max) : v;
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const b = body as Record<string, unknown>;
    const actionRaw = b.action;
    const act =
      typeof actionRaw === "string" && ALLOWED_ACTIONS.has(actionRaw)
        ? (actionRaw as GenerateAction)
        : "generate";

    if (typeof actionRaw === "string" && !ALLOWED_ACTIONS.has(actionRaw)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const thoughts = clampStr(b.thoughts, MAX_THOUGHTS);
    const writingSample = clampStr(b.writingSample, MAX_WRITING_SAMPLE);
    const currentPost = clampStr(b.currentPost, MAX_CURRENT_POST);
    const refinement = clampStr(b.refinement, MAX_REFINEMENT);

    const historyRaw = b.refinementHistory;
    const history =
      Array.isArray(historyRaw)
        ? historyRaw
            .filter((x): x is string => typeof x === "string")
            .slice(0, MAX_HISTORY_ITEMS)
            .map((s) => clampStr(s, MAX_HISTORY_ITEM_LEN))
        : undefined;

    if (
      (act === "generate" || act === "regenerate") &&
      !thoughts.trim()
    ) {
      return NextResponse.json(
        { error: "Please add your prompt first." },
        { status: 400 }
      );
    }

    if (act === "refine") {
      if (!currentPost.trim()) {
        return NextResponse.json(
          { error: "Generate a post first, then you can refine it." },
          { status: 400 }
        );
      }
      if (!refinement.trim()) {
        return NextResponse.json(
          { error: "Describe what you want changed." },
          { status: 400 }
        );
      }
    }

    if (act === "improve_hook" && !currentPost.trim()) {
      return NextResponse.json(
        { error: "Generate a post first before improving the hook." },
        { status: 400 }
      );
    }

    if (
      act === "sound_like_me" &&
      (!currentPost.trim() || !writingSample.trim())
    ) {
      return NextResponse.json(
        {
          error:
            "Add a writing sample and generate a post before using Sound more like me.",
        },
        { status: 400 }
      );
    }

    const stream = createCompletionStream({
      thoughts,
      writingSample: writingSample || undefined,
      action: act,
      currentPost: currentPost || undefined,
      refinement: refinement || undefined,
      refinementHistory: history?.length ? history : undefined,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
