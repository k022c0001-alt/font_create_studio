import fs from 'node:fs/promises';
import path from 'node:path';

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export function validateImageFile(fileName: string): void {
  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Unsupported image file extension');
  }
}

export async function writeCodeBundle(targetDir: string, name: string, jsx: string, css: string): Promise<string> {
  await ensureDir(targetDir);
  const jsxPath = path.join(targetDir, `${name}.tsx`);
  const cssPath = path.join(targetDir, `${name}.css`);
  await fs.writeFile(jsxPath, jsx, 'utf-8');
  await fs.writeFile(cssPath, css, 'utf-8');
  return targetDir;
}
