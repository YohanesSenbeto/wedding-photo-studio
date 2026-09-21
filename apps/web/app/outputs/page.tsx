"use client";

import { Download } from "lucide-react";
import { useOutputs } from "@/hooks/use-albums";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";

const FORMAT_VARIANT: Record<string, "default" | "info" | "warning"> = {
  JPG: "default",
  TIFF: "info",
  PSD: "warning",
};

export default function OutputsPage() {
  const outputs = useOutputs();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Outputs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every PSD, TIFF and JPG produced by Photoshop on your local machine.
        </p>
      </header>
      {outputs.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (outputs.data ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No outputs yet — run MAKE PROFESSIONAL EDIT or generate an album.
        </p>
      ) : (
        <ul className="space-y-2">
          {(outputs.data ?? []).map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" title={o.fileName}>
                  {o.fileName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {o.kind === "ALBUM_PAGE" ? "Album page" : "Edited photo"} ·{" "}
                  {formatDateTime(o.createdAt)}
                  {o.width && o.height ? ` · ${o.width}×${o.height}px` : ""}
                  {o.dpi ? ` · ${o.dpi} DPI` : ""}
                  {o.colorMode ? ` · ${o.colorMode}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={FORMAT_VARIANT[o.format] ?? "neutral"}>{o.format}</Badge>
                <Badge variant="neutral">{(o.fileSize / 1024 / 1024).toFixed(1)} MB</Badge>
                <a
                  href={api.outputFileUrl(o.id)}
                  download
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-surface-2 focus-gold"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
