import { useMemo } from 'react';

import type { CapStyle, JoinStyle, StrokeParams } from '../../../../shared/types/font';

export interface StrokeEditorProps {
  value: StrokeParams | undefined;
  onChange: (stroke: StrokeParams | undefined) => void;
  enabled: boolean;
}

const DEFAULT_STROKE: Required<StrokeParams> = {
  weight: 120,
  cap_style: 'round',
  join_style: 'round',
};

const CAP_STYLES: Array<{ value: CapStyle; label: string }> = [
  { value: 'butt', label: 'Butt' },
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
];

const JOIN_STYLES: Array<{ value: JoinStyle; label: string }> = [
  { value: 'miter', label: 'Miter' },
  { value: 'round', label: 'Round' },
  { value: 'bevel', label: 'Bevel' },
];

const PREVIEW_VIEWBOX_WIDTH = 220;
const PREVIEW_VIEWBOX_HEIGHT = 120;
const PREVIEW_GUIDE_START_X = 30;
const PREVIEW_GUIDE_END_X = 190;
const PREVIEW_GUIDE_TOP_Y = 20;
const PREVIEW_GUIDE_BOTTOM_Y = 80;
const PREVIEW_LINE_Y = 50;
const PREVIEW_JOIN_POINTS = '40,100 110,70 180,100';
const PREVIEW_STROKE_SCALE = 8;
const MIN_PREVIEW_STROKE_WIDTH = 2;

function clampWeight(weight: number): number {
  return Math.max(0, Math.min(1000, weight));
}

export function StrokeEditor({ value, onChange, enabled }: StrokeEditorProps) {
  const strokeEnabled = value !== undefined;

  const currentStroke = useMemo<Required<StrokeParams>>(
    () => ({
      weight: clampWeight(value?.weight ?? DEFAULT_STROKE.weight),
      cap_style: value?.cap_style ?? DEFAULT_STROKE.cap_style,
      join_style: value?.join_style ?? DEFAULT_STROKE.join_style,
    }),
    [value],
  );

  const controlsDisabled = !enabled || !strokeEnabled;
  const previewStrokeWidth = Math.max(MIN_PREVIEW_STROKE_WIDTH, currentStroke.weight / PREVIEW_STROKE_SCALE);

  const handleToggle = (nextEnabled: boolean): void => {
    if (!enabled) {
      return;
    }

    onChange(nextEnabled ? currentStroke : undefined);
  };

  const updateWeight = (rawValue: string): void => {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      return;
    }

    onChange({
      ...currentStroke,
      weight: clampWeight(parsed),
    });
  };

  const updateCapStyle = (capStyle: CapStyle): void => {
    onChange({
      ...currentStroke,
      cap_style: capStyle,
    });
  };

  const updateJoinStyle = (joinStyle: JoinStyle): void => {
    onChange({
      ...currentStroke,
      join_style: joinStyle,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
      <div className="space-y-5">
        <label htmlFor="stroke-enabled" className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            id="stroke-enabled"
            type="checkbox"
            className="h-4 w-4"
            checked={strokeEnabled}
            disabled={!enabled}
            onChange={(event) => handleToggle(event.target.checked)}
          />
          ストローク有効化
        </label>

        <div className="space-y-2">
          <label id="stroke-weight-label" htmlFor="stroke-weight-range" className="block text-sm font-medium text-slate-700">
            Weight (0 - 1000)
          </label>
          <div className="grid grid-cols-[1fr_120px] items-center gap-3">
            <input
              id="stroke-weight-range"
              type="range"
              min={0}
              max={1000}
              step={1}
              value={currentStroke.weight}
              disabled={controlsDisabled}
              aria-labelledby="stroke-weight-label"
              onChange={(event) => updateWeight(event.target.value)}
            />
            <input
              id="stroke-weight-number"
              type="number"
              min={0}
              max={1000}
              step={1}
              value={currentStroke.weight}
              disabled={controlsDisabled}
              aria-labelledby="stroke-weight-label"
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-right"
              onChange={(event) => updateWeight(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="stroke-cap-style" className="block text-sm font-medium text-slate-700">
            Cap Style
          </label>
          <select
            id="stroke-cap-style"
            value={currentStroke.cap_style}
            disabled={controlsDisabled}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            onChange={(event) => updateCapStyle(event.target.value as CapStyle)}
          >
            {CAP_STYLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="stroke-join-style" className="block text-sm font-medium text-slate-700">
            Join Style
          </label>
          <select
            id="stroke-join-style"
            value={currentStroke.join_style}
            disabled={controlsDisabled}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            onChange={(event) => updateJoinStyle(event.target.value as JoinStyle)}
          >
            {JOIN_STYLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">プレビュー</h3>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <svg viewBox={`0 0 ${PREVIEW_VIEWBOX_WIDTH} ${PREVIEW_VIEWBOX_HEIGHT}`} className="h-44 w-full">
            <line
              x1={PREVIEW_GUIDE_START_X}
              y1={PREVIEW_GUIDE_TOP_Y}
              x2={PREVIEW_GUIDE_START_X}
              y2={PREVIEW_GUIDE_BOTTOM_Y}
              stroke="#cbd5e1"
              strokeWidth={1}
            />
            <line
              x1={PREVIEW_GUIDE_END_X}
              y1={PREVIEW_GUIDE_TOP_Y}
              x2={PREVIEW_GUIDE_END_X}
              y2={PREVIEW_GUIDE_BOTTOM_Y}
              stroke="#cbd5e1"
              strokeWidth={1}
            />

            <line
              x1={PREVIEW_GUIDE_START_X}
              y1={PREVIEW_LINE_Y}
              x2={PREVIEW_GUIDE_END_X}
              y2={PREVIEW_LINE_Y}
              stroke="#1d4ed8"
              strokeWidth={previewStrokeWidth}
              strokeLinecap={currentStroke.cap_style}
              opacity={strokeEnabled ? 1 : 0.35}
            />

            <polyline
              points={PREVIEW_JOIN_POINTS}
              fill="none"
              stroke="#0f766e"
              strokeWidth={previewStrokeWidth}
              strokeLinejoin={currentStroke.join_style}
              strokeLinecap="round"
              opacity={strokeEnabled ? 1 : 0.35}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default StrokeEditor;
