"use client";

import * as React from "react";
import type { PresetDTO } from "@wedding/types";
import type { CustomPresetParams } from "@wedding/validation";
import { useStartEdit } from "@/hooks/use-jobs";
import { useAgentStatus } from "@/hooks/use-photos";
import { useToast } from "@/components/toast";
import { EditPanelView } from "./edit-panel-view";

interface Props {
  selectedPhotoIds: string[];
  selectedPreset: PresetDTO | null;
  customParams: CustomPresetParams;
  onCompleted: (jobIds: string[]) => void;
  disabled?: boolean;
}

const QUALITY_DPI: Record<string, number> = { WEB: 72, HIGH: 150, PRINT: 300 };

/**
 * Container for output options + the primary "MAKE PROFESSIONAL EDIT" action.
 * Clicking it validates the selection, queues EditingJobs and hands them to
 * the LOCAL PHOTOSHOP AGENT — the web app never edits pixels itself.
 */
export function EditPanel({ selectedPhotoIds, selectedPreset, customParams, onCompleted, disabled }: Props) {
  const toast = useToast();
  const startEdit = useStartEdit();
  const agentStatus = useAgentStatus();

  const [formats, setFormats] = React.useState<string[]>(["JPG"]);
  const [quality, setQuality] = React.useState("HIGH");
  const [cmyk, setCmyk] = React.useState(false);

  const agentOnline = agentStatus.data?.status === "ONLINE" || agentStatus.data?.status === "BUSY";
  const photoshopAvailable = agentStatus.data?.photoshopAvailable ?? false;
  const photoshopMode = agentStatus.data?.photoshopMode ?? "";

  const toggleFormat = (format: string) => {
    setFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const handleMakeEdit = () => {
    if (selectedPhotoIds.length === 0) {
      toast.toast({ kind: "error", title: "Select photos first", description: "Choose at least one photo to edit." });
      return;
    }
    if (!selectedPreset) {
      toast.toast({ kind: "error", title: "Choose a preset", description: "Pick a professional editing preset." });
      return;
    }
    if (formats.length === 0) {
      toast.toast({ kind: "error", title: "Choose an output format", description: "Select JPG, TIFF and/or PSD." });
      return;
    }

    const hasOverrides = Object.keys(customParams).length > 0;
    startEdit.mutate(
      {
        photoIds: selectedPhotoIds,
        presetKey: selectedPreset.key.replace(/^builtin-/, ""),
        customParams: hasOverrides ? (customParams as Record<string, unknown>) : undefined,
        outputFormats: formats,
        quality,
        colorMode: quality === "PRINT" && cmyk ? "CMYK" : "RGB",
        dpi: QUALITY_DPI[quality] ?? 300,
      },
      {
        onSuccess: (data) => {
          toast.toast({
            kind: "success",
            title: `${data.jobs.length} job(s) queued`,
            description: "The local Photoshop agent will start editing automatically.",
          });
          onCompleted(data.jobs.map((j) => j.id));
        },
        onError: (err: Error) => {
          toast.toast({ kind: "error", title: "Could not start editing", description: err.message });
        },
      }
    );
  };

  return (
    <EditPanelView
      agentOnline={agentOnline}
      photoshopAvailable={photoshopAvailable}
      photoshopMode={photoshopMode}
      selectedPhotoIds={selectedPhotoIds}
      selectedPreset={selectedPreset}
      formats={formats}
      toggleFormat={toggleFormat}
      quality={quality}
      setQuality={setQuality}
      cmyk={cmyk}
      setCmyk={setCmyk}
      pending={startEdit.isPending}
      disabled={disabled}
      onMakeEdit={handleMakeEdit}
    />
  );
}
