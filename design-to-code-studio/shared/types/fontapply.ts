export type FontapplyPointType = 'corner' | 'smooth' | 'tangent';

export interface FontapplyHandle {
  x: number;
  y: number;
}

export interface FontapplyPoint {
  id: string;
  x: number;
  y: number;
  type: FontapplyPointType;
  handle_in: FontapplyHandle | null;
  handle_out: FontapplyHandle | null;
}

export interface FontapplyContour {
  id: string;
  closed: boolean;
  points: FontapplyPoint[];
}

export interface FontapplyGlyph {
  char: string;
  unicode: string;
  width: number;
  contours: FontapplyContour[];
}

export interface FontapplyGlyphMetrics {
  ascender?: number;
  cap_height?: number;
  x_height?: number;
  descender?: number;
  lsb?: number;
  rsb?: number;
  units_per_em?: number;
}

export interface FontapplyHealthResponse {
  status?: string;
  ok?: boolean;
  [key: string]: unknown;
}

export interface FontapplyGlyphListResponse {
  supported: string[];
  total: number;
}

export interface FontapplyGetGlyphResponse {
  glyph: FontapplyGlyph;
  metrics?: FontapplyGlyphMetrics;
}

export interface FontapplyProjectScopedRequest {
  projectId?: number;
}

export interface FontapplyGlyphRequest extends FontapplyProjectScopedRequest {
  unicode: string;
}

export interface FontapplySaveGlyphRequest extends FontapplyProjectScopedRequest {
  unicode: string;
  glyph: FontapplyGlyph;
}
