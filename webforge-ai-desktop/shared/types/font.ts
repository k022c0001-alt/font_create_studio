export type FontOutputFormat = 'ttf' | 'woff2';
export type PreviewType = 'sample' | 'grid' | 'sizes' | 'weights';
export type CapStyle = 'butt' | 'round' | 'square';
export type JoinStyle = 'miter' | 'round' | 'bevel';

export interface FontMetricsInput {
  upm?: number;
  ascender?: number;
  descender?: number;
  cap_height?: number;
  x_height?: number;
  line_gap?: number;
}

export interface StrokeParams {
  weight?: number;
  cap_style?: CapStyle;
  join_style?: JoinStyle;
}

export interface GlyphRequest {
  name: string;
  unicode?: number;
  shape?: string;
  advance_width?: number;
  lsb?: number;
  stroke?: StrokeParams;
}

export type FontMetrics = FontMetricsInput;
export type GlyphDefinition = GlyphRequest;

export interface FontMetadataInput {
  family_name?: string;
  style_name?: string;
  version?: string;
  copyright?: string;
  designer?: string;
  description?: string;
  url?: string;
}

export interface GenerateFontRequest {
  metadata?: FontMetadataInput;
  metrics?: FontMetricsInput;
  glyphs: GlyphRequest[];
  output_format?: FontOutputFormat;
  include_kerning?: boolean;
}

export interface SubsetRequest {
  font_id?: string;
  file_b64?: string;
  text?: string;
  unicodes?: number[];
  preset?: 'landing_jp' | 'landing_en';
  output_format?: FontOutputFormat;
  hinting?: boolean;
}

export interface ConvertRequest {
  font_id?: string;
  file_b64?: string;
  family_name?: string;
  style_name?: string;
  weight?: number;
  output_format?: FontOutputFormat;
}

export interface PreviewRequest {
  font_id: string;
  type?: PreviewType;
  text?: string;
  width?: number;
  height?: number;
  font_size?: number;
  columns?: number;
}

export interface GenerateFontResponse {
  font_id: string;
  family_name: string;
  style_name: string;
  glyph_count: number;
  output_format: string;
  file_size_bytes: number;
  font_face_css: string;
  data_url: string;
}

export interface SubsetResponse {
  font_id: string;
  original_glyph_count: number;
  subset_glyph_count: number;
  original_size_bytes: number;
  subset_size_bytes: number;
  reduction_percent: string;
  font_face_css: string;
  data_url: string;
}

export interface ConvertResponse {
  font_id: string;
  family_name: string;
  style_name: string;
  weight: number;
  original_size_bytes: number;
  converted_size_bytes: number;
  reduction_percent: string;
  font_face_css: string;
  data_url: string;
}

export interface IpcFontChannels {
  'font:generate': (request: GenerateFontRequest) => Promise<GenerateFontResponse>;
  'font:subset': (request: SubsetRequest) => Promise<SubsetResponse>;
  'font:convert': (request: ConvertRequest) => Promise<ConvertResponse>;
  'font:preview': (request: PreviewRequest) => Promise<Blob>;
}
