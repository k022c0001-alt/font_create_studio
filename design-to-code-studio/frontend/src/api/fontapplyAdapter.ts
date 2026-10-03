import type { FontapplyGlyph } from '../../../shared/types/fontapply';

export type GlyphPointType = 'corner' | 'smooth' | 'tangent';

export interface GlyphVec2 {
  x: number;
  y: number;
}

export interface GlyphAnchorPoint {
  id: string;
  pos: GlyphVec2;
  type: GlyphPointType;
  handleIn: GlyphVec2 | null;
  handleOut: GlyphVec2 | null;
}

export interface GlyphContour {
  id: string;
  closed: boolean;
  points: GlyphAnchorPoint[];
}

export interface GlyphData {
  char: string;
  unicode: string;
  width: number;
  contours: GlyphContour[];
}

export interface FontVariationParams {
  weight: number;
  width: number;
  slant: number;
  roundness: number;
}

export function fromFontapplyGlyph(glyph: FontapplyGlyph): GlyphData {
  return {
    char: glyph.char,
    unicode: glyph.unicode,
    width: glyph.width,
    contours: glyph.contours.map((contour) => ({
      id: contour.id,
      closed: contour.closed,
      points: contour.points.map((point) => ({
        id: point.id,
        pos: { x: point.x, y: point.y },
        type: point.type,
        handleIn: point.handle_in,
        handleOut: point.handle_out,
      })),
    })),
  };
}

export function toFontapplyGlyph(glyph: GlyphData): FontapplyGlyph {
  return {
    char: glyph.char,
    unicode: glyph.unicode,
    width: glyph.width,
    contours: glyph.contours.map((contour) => ({
      id: contour.id,
      closed: contour.closed,
      points: contour.points.map((point) => ({
        id: point.id,
        x: point.pos.x,
        y: point.pos.y,
        type: point.type,
        handle_in: point.handleIn,
        handle_out: point.handleOut,
      })),
    })),
  };
}
