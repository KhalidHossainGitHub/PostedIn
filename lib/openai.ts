import "server-only";
import OpenAI from "openai";
import { sanitizePostOutput } from "@/lib/sanitizePost";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not configured on the server.");
}

const openai = new OpenAI({
  apiKey,
});

const SYSTEM_PROMPT = `You are an expert LinkedIn content writer.

Your job is to turn messy, unstructured thoughts into high-quality LinkedIn posts that feel natural, personal, and engaging.

You MUST:
- Write like a real person, not like AI
- Keep the tone conversational and human
- Avoid corporate buzzwords and fluff
- Avoid em dashes completely
- Keep sentences simple and readable
- Make the post flow naturally

Structure EVERY post like this:
1. Hook (strong opening that fits the ideas)
2. Body (story, experience, or idea)
3. Takeaway (clear reflection, lesson, or insight)

Formatting rules:
- Use short paragraphs (1-2 lines max)
- Add natural spacing between paragraphs
- Keep total length under 1200 characters
- Make it feel like a real LinkedIn post

If a writing sample is provided:
- Mimic how that person structures posts: line breaks, paragraph length, rhythm
- Match tone, sentence shape, and voice closely

Do NOT:
- Sound robotic
- Over-explain
- Use generic phrases like "In today's fast-paced world"`;

export type GenerateAction =
  | "generate"
  | "regenerate"
  | "refine"
  | "improve_hook"
  | "sound_like_me";

export interface GenerateParams {
  thoughts: string;
  writingSample?: string;
  action: GenerateAction;
  currentPost?: string;
  refinement?: string;
  refinementHistory?: string[];
}

function buildUserPrompt(params: GenerateParams): string {
  const {
    thoughts,
    writingSample,
    action,
    currentPost,
    refinement,
    refinementHistory,
  } = params;

  if (action === "refine" && currentPost && refinement?.trim()) {
    let p = `You are editing an existing LinkedIn post. Apply the user's latest request with a light touch. Change only what they ask; keep everything else as close as possible unless they clearly want a bigger rewrite.

Current post:
${currentPost}`;

    if (refinementHistory?.length) {
      p += `\n\nEarlier tweak requests (already reflected in the current post above):\n${refinementHistory.map((h, i) => `${i + 1}. ${h}`).join("\n")}`;
    }

    p += `\n\nLatest request:\n${refinement.trim()}`;

    if (thoughts?.trim()) {
      p += `\n\nOriginal prompt / notes (context only, do not repeat verbatim):\n${thoughts.trim()}`;
    }
    if (writingSample?.trim()) {
      p += `\n\nWriting sample (keep voice, line breaks, and rhythm aligned):\n${writingSample.trim()}`;
    }

    p += `\n\nOutput the full revised post only. No preamble, no quotes around it. Stay under 1200 characters.`;

    return p;
  }

  if (action === "improve_hook" && currentPost) {
    return `Here is a LinkedIn post. Rewrite ONLY the hook (the first 1-2 lines) to make it stronger and more attention-grabbing. Keep the rest of the post exactly the same.

Post:
${currentPost}`;
  }

  if (action === "sound_like_me" && currentPost && writingSample) {
    return `Here is a LinkedIn post I generated, and samples of my own writing. Rewrite the entire post to sound much more like me. Closely match my sentence structure, paragraph breaks, word choice, rhythm, and tone from the samples. Keep the core message and structure (hook, body, takeaway) intact.

Post:
${currentPost}

My writing samples:
${writingSample}`;
  }

  let prompt = `Turn the following rough thoughts into a LinkedIn post.

Thoughts:
${thoughts}`;

  if (writingSample?.trim()) {
    prompt += `

How I write (match structure, pacing, line breaks, and voice):
${writingSample.trim()}`;
  }

  prompt += `

Instructions:
- Choose a hook style that fits the ideas (story, question, bold take, etc.). Do not be generic.
- Follow structure: hook, then body, then takeaway.
- If writing samples are included, strongly mirror how I format and sound.
- Keep it concise, engaging, and natural.`;

  return prompt;
}

/**
 * Stream raw completion chunks as UTF-8 bytes. Client should run
 * {@link sanitizePostOutput} on the full string when the stream ends.
 */
export function createCompletionStream(params: GenerateParams): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildUserPrompt(params) },
          ],
          temperature: 0.8,
          max_tokens: 1000,
          stream: true,
        });

        for await (const chunk of stream) {
          const t = chunk.choices[0]?.delta?.content ?? "";
          if (t) controller.enqueue(encoder.encode(t));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

/** Non-streaming (e.g. tests); same prompts as the stream. */
export async function generatePost(params: GenerateParams): Promise<string> {
  const stream = createCompletionStream(params);
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  return sanitizePostOutput(raw);
}
