/**
 * Predefined Unicode range presets for font subsetting.
 * These match common character sets used in Japanese/Latin web fonts.
 */

export const UNICODE_RANGES = {
  /** Basic Latin (ASCII printable) */
  BASIC_LATIN: 'U+0020-007E',

  /** Latin-1 Supplement */
  LATIN_SUPPLEMENT: 'U+0080-00FF',

  /** Latin Extended-A */
  LATIN_EXTENDED_A: 'U+0100-017F',

  /** Greek and Coptic */
  GREEK: 'U+0370-03FF',

  /** Cyrillic */
  CYRILLIC: 'U+0400-04FF',

  /** Hiragana */
  HIRAGANA: 'U+3040-309F',

  /** Katakana */
  KATAKANA: 'U+30A0-30FF',

  /** CJK Unified Ideographs (common-use kanji) */
  CJK_COMMON: 'U+4E00-9FFF',

  /** CJK Compatibility Ideographs */
  CJK_COMPAT: 'U+F900-FAFF',

  /** Halfwidth and Fullwidth Forms */
  HALFWIDTH_FULLWIDTH: 'U+FF00-FFEF',

  /** Punctuation (CJK symbols and punctuation) */
  CJK_PUNCTUATION: 'U+3000-303F',

  /** Number Forms */
  NUMBER_FORMS: 'U+2150-218F',

  /** Currency Symbols */
  CURRENCY: 'U+20A0-20CF',
} as const;

export type UnicodeRangeKey = keyof typeof UNICODE_RANGES;

/** Convenience presets that combine multiple ranges. */
export const SUBSET_PRESETS: Record<string, string[]> = {
  latin: [UNICODE_RANGES.BASIC_LATIN, UNICODE_RANGES.LATIN_SUPPLEMENT],
  japanese: [
    UNICODE_RANGES.BASIC_LATIN,
    UNICODE_RANGES.HIRAGANA,
    UNICODE_RANGES.KATAKANA,
    UNICODE_RANGES.CJK_COMMON,
    UNICODE_RANGES.CJK_PUNCTUATION,
  ],
  japaneseExtended: [
    UNICODE_RANGES.BASIC_LATIN,
    UNICODE_RANGES.HIRAGANA,
    UNICODE_RANGES.KATAKANA,
    UNICODE_RANGES.CJK_COMMON,
    UNICODE_RANGES.CJK_COMPAT,
    UNICODE_RANGES.CJK_PUNCTUATION,
    UNICODE_RANGES.HALFWIDTH_FULLWIDTH,
  ],
};
