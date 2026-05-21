/** Font manifest entry type shared between Electron, React, and Python. */

export interface FontManifestEntry {
  id: string;
  projectId: string;
  family: string;
  filePath: string;
  format: 'ttf' | 'otf' | 'woff2';
  isVariable: boolean;
  createdAt: string;
}

export interface VariableAxis {
  tag: string;   // e.g. "wght"
  name: string;  // e.g. "Weight"
  min: number;
  max: number;
  default: number;
}

export interface FontSubsetRequest {
  fontId: string;
  unicodeRanges: string[];
}

export interface FontConvertRequest {
  fontId: string;
}
