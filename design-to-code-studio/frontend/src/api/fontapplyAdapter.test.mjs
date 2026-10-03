import test from 'node:test';
import assert from 'node:assert/strict';
import { fromFontapplyGlyph, toFontapplyGlyph } from './fontapplyAdapter.ts';

test('fromFontapplyGlyph/toFontapplyGlyph keep snake_case ↔ camelCase roundtrip', () => {
  const apiGlyph = {
    char: 'A',
    unicode: '0041',
    width: 660,
    contours: [
      {
        id: 'c0',
        closed: true,
        points: [
          {
            id: 'p0',
            x: 80,
            y: 100,
            type: 'smooth',
            handle_in: { x: 70, y: 90 },
            handle_out: { x: 90, y: 110 },
          },
        ],
      },
    ],
  };

  const reactGlyph = fromFontapplyGlyph(apiGlyph);
  assert.equal(reactGlyph.contours[0].points[0].pos.x, 80);
  assert.deepEqual(reactGlyph.contours[0].points[0].handleIn, { x: 70, y: 90 });

  const convertedBack = toFontapplyGlyph(reactGlyph);
  assert.deepEqual(convertedBack, apiGlyph);
});
