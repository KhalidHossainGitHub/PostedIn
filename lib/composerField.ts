/** Shared chrome for Refine + Input tab composers (keep in sync visually). */
export const COMPOSER_ROW =
  "flex items-end gap-1.5 rounded-2xl border border-linkedin-border bg-white px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-linkedin-blue focus-within:ring-1 focus-within:ring-linkedin-blue transition-[border-color,box-shadow] duration-150 md:px-2.5 md:py-1";

/**
 * `composer-field-textarea`: margin/appearance reset in globals.css (mobile textarea quirks).
 * Mobile: py-2.5 + leading-5 + 16px text → one line centers in ~40px (matches h-10 controls).
 * md+: tighter padding to pair with h-7 controls.
 */
export const COMPOSER_TEXTAREA_BASE =
  "composer-field-textarea min-h-0 min-w-0 flex-1 resize-none bg-transparent py-2.5 text-base leading-5 text-linkedin-text placeholder-linkedin-secondary/60 outline-none [box-sizing:border-box] md:py-[5px] md:text-[14px]";
