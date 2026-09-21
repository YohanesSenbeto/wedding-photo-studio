"use client";

import { Wand2, TriangleAlert } from "lucide-react";
import type { PresetDTO } from "@wedding/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/input";
import { Switch } from "@/components/switch";

export interface EditPanelViewProps {
  agentOnline: boolean;
  photoshopAvailable: boolean;
  /** "COM" (real Photoshop) or "DRYRUN" (clearly-labelled simulation). */
  photoshopMode: string;
  selectedPhotoIds: string[];
  selectedPreset: PresetDTO | null;
  formats: string[];
  toggleFormat: (f: string) => void;
  quality: string;
  setQuality: (q: string) => void;
  cmyk: boolean;
  setCmyk: (v: boolean) => void;
  pending: boolean;
  disabled?: boolean;
  onMakeEdit: () => void;
}

/** Presentational part of the edit panel (see edit-panel.tsx for the logic). */
export function EditPanelView(props: EditPanelViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Output &amp; Edit</CardTitle>
        <CardDescription>
          Jobs are processed by the local Photoshop 2022 agent on your Windows machine.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!props.agentOnline && (
          <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              No agent connected. Start it on the Photoshop machine with{" "}
              <code className="rounded bg-background/60 px-1">npm run agent</code>. Jobs will wait
              in the queue until it connects.
            </span>
          </div>
        )}
        {props.agentOnline && props.photoshopMode === "DRYRUN" && (
          <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Agent connected in <strong>DRY RUN</strong> mode — it simulates the pipeline and
              produces <strong>no edited images</strong>. Start the agent on the Windows machine
              with Photoshop 2022 (<code className="rounded bg-background/60 px-1">AGENT_PHOTOSHOP_MODE=AUTO</code>) to get real edits.
            </span>
          </div>
        )}
        {props.agentOnline &&
          props.photoshopMode !== "DRYRUN" &&
          !props.photoshopAvailable && (
            <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Photoshop was not detected on the agent machine. Check PHOTOSHOP_PATH in the agent
                .env.
              </span>
            </div>
          )}

        <div>
          <Label>Output formats</Label>
          <div className="flex gap-2">
            {["JPG", "TIFF", "PSD"].map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={props.formats.includes(f)}
                onClick={() => props.toggleFormat(f)}
                className={
                  "rounded-md border px-4 py-2 text-xs font-semibold tracking-wider transition-colors focus-gold " +
                  (props.formats.includes(f)
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:bg-surface-2")
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="quality">Quality</Label>
            <Select
              id="quality"
              value={props.quality}
              onChange={(e) => props.setQuality(e.target.value)}
            >
              <option value="WEB">Web — 72 DPI</option>
              <option value="HIGH">High Quality — 150 DPI</option>
              <option value="PRINT">Print — 300 DPI</option>
            </Select>
          </div>
          <div className="flex items-end pb-2">
            <Switch
              checked={props.cmyk}
              onCheckedChange={props.setCmyk}
              disabled={props.quality !== "PRINT"}
              label={props.quality === "PRINT" ? "CMYK for print export" : "CMYK (print quality only)"}
            />
          </div>
        </div>

        <Button
          size="lg"
          className="w-full text-base tracking-wide"
          disabled={props.disabled || props.pending}
          onClick={props.onMakeEdit}
        >
          <Wand2 className="h-5 w-5" />
          {props.pending ? "Queueing…" : "MAKE PROFESSIONAL EDIT"}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          {props.selectedPhotoIds.length} photo(s) selected ·{" "}
          {props.selectedPreset ? props.selectedPreset.name : "no preset selected"} ·{" "}
          {props.formats.join(" + ") || "no format"}
        </p>
      </CardContent>
    </Card>
  );
}
