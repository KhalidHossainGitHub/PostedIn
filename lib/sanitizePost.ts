/** Normalize typographic punctuation to plain ASCII (LinkedIn-style). */
export function sanitizePostOutput(text: string): string {
  return text
    .replace(/\u2014/g, " - ") // em dash
    .replace(/\u2013/g, "-") // en dash
    .replace(/\u2015/g, "-") // horizontal bar
    .replace(/\u2012/g, "-") // figure dash
    .replace(/\u2018/g, "'") // ‘
    .replace(/\u2019/g, "'") // ’
    .replace(/\u201a/g, "'") // ‚
    .replace(/\u201b/g, "'") // ‛
    .replace(/\u201c/g, '"') // “
    .replace(/\u201d/g, '"') // ”
    .replace(/\u201e/g, '"') // „
    .replace(/\u201f/g, '"'); // ‟
}
