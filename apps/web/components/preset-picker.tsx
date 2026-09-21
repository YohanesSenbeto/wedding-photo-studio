"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import type { PresetDTO } from "@wedding/types";
import type { CustomPresetParams } from "@wedding/validation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "./switch";

interface Props {
  presets: PresetDTO[];
  selectedKey: string | null;
  onSelect: (preset: PresetDTO) => void;
  customParams: CustomPresetParams;
  onCustomChange: (patch: CustomPresetParams) => void;
  disabled?: boolean;
}

const REFINE_FIELDS: { key: keyof CustomPresetParams; label: string; min: number; max: number; step: number }[] = [
  { key: "exposure", label: "Exposure", min: -2, max: 2, step: 0.05 },
  { key: "contrast", label: "Contrast", min: -100, max: 100, step: 1 },
  { key: "temperature", label: "Temperature", min: -100, max: 100, step: 1 },
  { key: "saturation", label: "Saturation", min: -100, max: 100, step: 1 },
  { key: "vibrance", label: "Vibrance", min: -100, max: 100, step: 1 },
  { key: "clarity", label: "Clarity", min: -100, max: 100, step: 1 },
  { key: "sharpness", label: "Sharpness", min: 0, max: 150, step: 1 },
  { key: "skinRetouch", label: "Skin Retouch", min: 0, max: 100, step: 1 },
  { key: "vignette", label: "Vignette", min: -100, max: 100, step: 1 },
];

/**
 * Preset chooser + refine sliders.
 * Values are deterministic starting points — refined values travel with the
 * job as `customParams` and are applied by PHOTOSHOP, not the browser.
 */
export function PresetPicker({ presets, selectedKey, onSelect, customParams, onCustomChange, disabled }: Props) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {presets.map((preset) => {
          const active = preset.key === selectedKey;
          const p = preset.params as Record<string, number | boolean>;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onSelect(preset)}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors focus-gold disabled:opacity-50",
                active
                  ? "border-gold bg-gold/10"
                  : "border-border bg-surface hover:border-gold/40 hover:bg-surface-2"
              )}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display text-base tracking-wide">{preset.name}</h4>
                {active && <Sparkles className="h-4 w-4 text-gold" />}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{preset.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.blackWhite ? (
                  <Badge variant="neutral">B&amp;W</Badge>
                ) : (
                  <Badge variant="neutral">{String(p.temperature ?? 0)}° temp</Badge>
                )}
                <Badge variant="neutral">{String(p.clarity ?? 0)} clarity</Badge>
                <Badge variant="neutral">{String(p.skinRetouch ?? 0)} skin</Badge>
              </div>
            </button>
          );
        })}
      </div>

      {selectedKey && (
        <details className="mt-4 rounded-lg border border-border bg-surface">
          <summary className="cursor-pointer px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
            Refine this look before editing (deterministic, adjustable)
          </summary>
          <div className="grid grid-cols-1 gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            {REFINE_FIELDS.map((field) => (
              <div key={field.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider text-muted-foreground">{field.label}</span>
                  <span className="text-gold">{String(customParams[field.key] ?? 0)}</span>
                </div>
                <Slider
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={Number(customParams[field.key] ?? 0)}
                  aria-label={field.label}
                  onChange={(e) => onCustomChange({ [field.key]: Number(e.target.value) } as CustomPresetParams)}
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Switch
                checked={Boolean(customParams.blackWhite)}
                onCheckedChange={(v) => onCustomChange({ blackWhite: v })}
                label="Convert to black & white"
              />
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
