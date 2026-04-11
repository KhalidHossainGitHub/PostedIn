/**
 * One saved draft after an AI step (client-only; no DB).
 * `turns` matches refine history for API consistency after restore.
 */
export type DraftCheckpoint = {
  post: string;
  turns: string[];
  kind: "initial" | "refine" | "hook" | "sound";
  /** Set when this snapshot is right after refine #n (0-based). */
  afterRefineIndex?: number;
};

export function checkpointShortLabel(c: DraftCheckpoint, index: number): string {
  if (index === 0) return "Original";
  if (c.kind === "refine" && c.afterRefineIndex !== undefined) {
    return `Refine ${c.afterRefineIndex + 1}`;
  }
  if (c.kind === "hook") return "Improve hook";
  if (c.kind === "sound") return "Sound like me";
  return `Version ${index + 1}`;
}

/** Checkpoint list index for the state right after refine turn `turnIndex` (0-based). */
export function checkpointIndexAfterRefine(
  checkpoints: DraftCheckpoint[],
  turnIndex: number
): number {
  const idx = checkpoints.findIndex((c) => c.afterRefineIndex === turnIndex);
  return idx;
}
