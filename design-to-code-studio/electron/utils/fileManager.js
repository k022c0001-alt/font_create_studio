import fs from 'node:fs/promises';
import path from 'node:path';
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
export async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}
export function validateImageFile(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        throw new Error('Unsupported image file extension');
    }
}
export async function writeCodeBundle(targetDir, name, jsx, css) {
    await ensureDir(targetDir);
    const jsxPath = path.join(targetDir, `${name}.tsx`);
    const cssPath = path.join(targetDir, `${name}.css`);
    await fs.writeFile(jsxPath, jsx, 'utf-8');
    await fs.writeFile(cssPath, css, 'utf-8');
    return targetDir;
}
