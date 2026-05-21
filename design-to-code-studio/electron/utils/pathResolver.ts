import { app } from 'electron';
import path from 'path';

/**
 * Resolves paths under the Electron userData directory (and temp).
 * All path-sensitive code should import from here to keep paths centralised.
 */

export function getUserDataPath(...segments: string[]): string {
  return path.join(app.getPath('userData'), ...segments);
}

export function getTempPath(...segments: string[]): string {
  return path.join(app.getPath('temp'), 'design-to-code-studio', ...segments);
}

export function getDbPath(): string {
  return getUserDataPath('app.db');
}

export function getUploadDir(): string {
  return getUserDataPath('uploads');
}

export function getCacheDir(): string {
  return getUserDataPath('cache');
}
