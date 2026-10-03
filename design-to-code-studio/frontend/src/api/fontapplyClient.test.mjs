import test from 'node:test';
import assert from 'node:assert/strict';
import { createFontapplyClient, FontapplyApiError } from './fontapplyClient.ts';

test('client builds glyph URL with project_id', async () => {
  const calls = [];
  const client = createFontapplyClient({
    baseUrl: 'http://127.0.0.1:8000',
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({ glyph: { char: 'A', unicode: '0041', width: 600, contours: [] } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  await client.getGlyph({ unicode: '0041', projectId: 12 });
  assert.equal(calls[0]?.url, 'http://127.0.0.1:8000/api/glyphs/0041?project_id=12');
});

test('client saveGlyph sends Fontapply API payload shape', async () => {
  const glyph = {
    char: 'A',
    unicode: '0041',
    width: 600,
    contours: [
      {
        id: 'c0',
        closed: false,
        points: [{ id: 'p0', x: 1, y: 2, type: 'corner', handle_in: null, handle_out: null }],
      },
    ],
  };

  let capturedBody = '';
  const client = createFontapplyClient({
    baseUrl: 'http://127.0.0.1:8000',
    fetchImpl: async (_url, init) => {
      capturedBody = String(init?.body || '');
      return new Response(JSON.stringify({ glyph }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  await client.saveGlyph({ unicode: '0041', projectId: 1, glyph });
  assert.deepEqual(JSON.parse(capturedBody), glyph);
});

test('client error includes HTTP body', async () => {
  const client = createFontapplyClient({
    baseUrl: 'http://127.0.0.1:8000',
    fetchImpl: async () => new Response('validation failed', { status: 422 }),
  });

  await assert.rejects(() => client.health(), (error) => {
    assert.ok(error instanceof FontapplyApiError);
    assert.equal(error.status, 422);
    assert.equal(error.body, 'validation failed');
    return true;
  });
});
