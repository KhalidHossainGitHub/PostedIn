import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, 1_000);
}

let ratelimit: Ratelimit | null | undefined;

function getRatelimiter(): Ratelimit | null {
  if (ratelimit !== undefined) {
    return ratelimit;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    ratelimit = null;
    return null;
  }

  const max = parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 20);
  const redis = new Redis({ url, token });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, "1 m"),
    prefix: "postedin:generate",
    ephemeralCache: new Map(),
  });

  return ratelimit;
}

export type GenerateRateLimitResult =
  | { ok: true; headers: Record<string, string> }
  | { ok: false; response: NextResponse };

export async function enforceGenerateRateLimit(
  req: NextRequest
): Promise<GenerateRateLimitResult> {
  const limiter = getRatelimiter();

  if (!limiter) {
    if (process.env.VERCEL === "1") {
      console.warn(
        "[postedin] Rate limiting disabled: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
      );
    }
    return { ok: true, headers: {} };
  }

  const ip = getClientIp(req);
  const result = await limiter.limit(ip);
  void result.pending.catch(() => undefined);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };

  if (result.success) {
    return { ok: true, headers };
  }

  const retryAfterSec = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000)
  );

  return {
    ok: false,
    response: NextResponse.json(
      {
        error:
          "Too many requests from this network. Please wait a minute and try again.",
      },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": String(retryAfterSec),
        },
      }
    ),
  };
}
