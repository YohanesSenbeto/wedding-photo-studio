"use client";

import { usePresets } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const PARAM_LABELS: [string, string][] = [
  ["exposure", "Exposure"],
  ["contrast", "Contrast"],
  ["temperature", "Temp"],
  ["saturation", "Sat"],
  ["vibrance", "Vib"],
  ["clarity", "Clarity"],
  ["sharpness", "Sharp"],
  ["noiseReduction", "NR"],
  ["skinRetouch", "Skin"],
  ["vignette", "Vig"],
];

export default function PresetsPage() {
  const presets = usePresets();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Editing Presets</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Deterministic, adjustable Photoshop adjustments — not magic. Each value is applied with
          real Photoshop operations by the local agent and can be refined before every edit.
        </p>
      </header>
      {presets.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(presets.data ?? []).map((p) => {
            const params = p.params as Record<string, number | boolean | string>;
            return (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {params.blackWhite === true && <Badge variant="neutral">Black &amp; White</Badge>}
                    {params.cropMode && params.cropMode !== "AS_SHOT" && (
                      <Badge variant="neutral">{String(params.cropMode).replace("_", " ")}</Badge>
                    )}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                    {PARAM_LABELS.map(([key, label]) => (
                      <div key={key} className="flex justify-between border-b border-border/50 py-0.5">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="text-foreground">{String(params[key] ?? 0)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
