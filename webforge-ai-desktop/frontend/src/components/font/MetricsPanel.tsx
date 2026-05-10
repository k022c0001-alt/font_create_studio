import { useEffect, useMemo, useState } from 'react';

import type { FontMetricsInput } from '../../../../shared/types/font';

export interface MetricsPanelProps {
  value: FontMetricsInput | undefined;
  usePreset: boolean;
  onChangeMetrics: (metrics: FontMetricsInput | undefined) => void;
  onTogglePreset: (usePreset: boolean) => void;
}

type PresetType = 'latin' | 'japanese' | 'custom';

type MetricFieldConfig = {
  key: keyof FontMetricsInput;
  label: string;
  min: number;
  max: number;
  step?: number;
};

const LATIN_PRESET: Required<FontMetricsInput> = {
  upm: 1000,
  ascender: 800,
  descender: -200,
  cap_height: 700,
  x_height: 520,
  line_gap: 0,
};

const JAPANESE_PRESET: Required<FontMetricsInput> = {
  upm: 1000,
  ascender: 880,
  descender: -120,
  cap_height: 880,
  x_height: 880,
  line_gap: 0,
};

const FIELD_CONFIGS: MetricFieldConfig[] = [
  { key: 'upm', label: 'UPM (Units Per eM)', min: 16, max: 16384 },
  { key: 'ascender', label: 'Ascender', min: 1, max: 16384 },
  { key: 'descender', label: 'Descender', min: -16384, max: -1 },
  { key: 'cap_height', label: 'Cap Height', min: 1, max: 16384 },
  { key: 'x_height', label: 'X Height', min: 1, max: 16384 },
  { key: 'line_gap', label: 'Line Gap', min: 0, max: 16384 },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function MetricsPanel({ value, usePreset, onChangeMetrics, onTogglePreset }: MetricsPanelProps) {
  const [presetType, setPresetType] = useState<PresetType>(usePreset ? 'latin' : 'custom');
  const presetCheckboxId = 'metrics-use-preset';
  const presetLegendId = 'metrics-preset-legend';

  useEffect(() => {
    if (!usePreset) {
      setPresetType('custom');
      return;
    }

    if (presetType === 'custom') {
      setPresetType('latin');
    }
  }, [presetType, usePreset]);

  const currentMetrics = useMemo<Required<FontMetricsInput>>(
    () => ({
      upm: value?.upm ?? LATIN_PRESET.upm,
      ascender: value?.ascender ?? LATIN_PRESET.ascender,
      descender: value?.descender ?? LATIN_PRESET.descender,
      cap_height: value?.cap_height ?? LATIN_PRESET.cap_height,
      x_height: value?.x_height ?? LATIN_PRESET.x_height,
      line_gap: value?.line_gap ?? LATIN_PRESET.line_gap,
    }),
    [value],
  );

  const applyPreset = (nextPreset: PresetType): void => {
    setPresetType(nextPreset);

    if (nextPreset === 'custom') {
      onTogglePreset(false);
      onChangeMetrics(currentMetrics);
      return;
    }

    onTogglePreset(true);
    onChangeMetrics(nextPreset === 'latin' ? LATIN_PRESET : JAPANESE_PRESET);
  };

  const handleTogglePreset = (enabled: boolean): void => {
    onTogglePreset(enabled);

    if (!enabled) {
      setPresetType('custom');
      return;
    }

    if (presetType === 'custom') {
      setPresetType('latin');
      onChangeMetrics(LATIN_PRESET);
      return;
    }

    onChangeMetrics(presetType === 'latin' ? LATIN_PRESET : JAPANESE_PRESET);
  };

  const updateMetric = (key: keyof FontMetricsInput, rawValue: string, min: number, max: number): void => {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      return;
    }

    const next = { ...currentMetrics, [key]: clamp(parsed, min, max) };
    onChangeMetrics(next);
  };

  return (
    <div className="grid grid-cols-1 gap-6 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
      <div className="space-y-4">
        <label htmlFor={presetCheckboxId} className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            id={presetCheckboxId}
            type="checkbox"
            className="h-4 w-4"
            checked={usePreset}
            onChange={(event) => handleTogglePreset(event.target.checked)}
          />
          プリセット使用
        </label>

        <fieldset className="space-y-3" aria-labelledby={presetLegendId}>
          <legend id={presetLegendId} className="text-sm font-semibold text-slate-800">
            プリセット選択
          </legend>
          {(
            [
              { value: 'latin', label: 'Latin プリセット' },
              { value: 'japanese', label: 'Japanese プリセット' },
              { value: 'custom', label: 'Custom（カスタム）' },
            ] as const
          ).map((preset) => (
            <div key={preset.value} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                id={`metrics-preset-${preset.value}`}
                type="radio"
                name="metrics-preset"
                className="h-4 w-4"
                checked={presetType === preset.value}
                onChange={() => applyPreset(preset.value)}
              />
              <label htmlFor={`metrics-preset-${preset.value}`}>{preset.label}</label>
            </div>
          ))}
        </fieldset>
      </div>

      <div className="space-y-4">
        {FIELD_CONFIGS.map((field) => {
          const valueForField = currentMetrics[field.key] ?? field.min;
          const rangeInputId = `metrics-${field.key}-range`;
          const labelId = `metrics-${field.key}-label`;

          return (
            <div key={field.key} className="space-y-2">
              <label id={labelId} htmlFor={rangeInputId} className="block text-sm font-medium text-slate-700">
                {field.label}
              </label>
              <div className="grid grid-cols-[1fr_120px] items-center gap-3">
                <input
                  id={rangeInputId}
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step ?? 1}
                  value={valueForField}
                  disabled={usePreset}
                  onChange={(event) => updateMetric(field.key, event.target.value, field.min, field.max)}
                />
                <input
                  id={`metrics-${field.key}-number`}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step ?? 1}
                  value={valueForField}
                  disabled={usePreset}
                  aria-label={`${field.label} value`}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-right"
                  onChange={(event) => updateMetric(field.key, event.target.value, field.min, field.max)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MetricsPanel;
