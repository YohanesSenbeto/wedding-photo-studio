"use client";

import { useState } from "react";
import type { AlbumDTO } from "@wedding/types";
import { LAYOUT_LIBRARY } from "@wedding/config";
import { usePhotos } from "@/hooks/use-photos";
import { useAssignPages } from "@/hooks/use-albums";
import { useToast } from "@/components/toast";
import { LayoutPreview } from "@/components/layout-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Per-page photo assignment with auto-assign and save. */
export function AlbumPagesEditor({ album }: { album: AlbumDTO }) {
  const toast = useToast();
  const photos = usePhotos();
  const assign = useAssignPages(album.id);

  const [assignments, setAssignments] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(album.pages.map((p) => [p.templateKey, [...p.photoIds]]))
  );

  const togglePhoto = (templateKey: string, photoId: string) => {
    setAssignments((prev) => {
      const current = prev[templateKey] ?? [];
      const next = current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId].slice(0, 6);
      return { ...prev, [templateKey]: next };
    });
  };

  const autoAssign = () => {
    const pool = (photos.data ?? []).map((p) => p.id);
    if (pool.length === 0) return;
    const next: Record<string, string[]> = {};
    let idx = 0;
    for (const page of album.pages) {
      const layout = LAYOUT_LIBRARY[page.layoutKey];
      const slots = Math.max(1, layout?.slots.length ?? 1);
      const ids: string[] = [];
      for (let s = 0; s < slots; s++) {
        ids.push(pool[idx % pool.length]);
        idx += 1;
      }
      next[page.templateKey] = ids;
    }
    setAssignments(next);
  };

  const save = () => {
    assign.mutate(assignments, {
      onSuccess: () => toast.toast({ kind: "success", title: "Page photos saved" }),
      onError: (err: Error) =>
        toast.toast({ kind: "error", title: "Save failed", description: err.message }),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={autoAssign}
          disabled={(photos.data?.length ?? 0) === 0}
        >
          Auto-assign
        </Button>
        <Button variant="outline" size="sm" onClick={save} disabled={assign.isPending}>
          {assign.isPending ? "Saving…" : "Save page photos"}
        </Button>
      </div>
      {album.pages.map((page) => {
        const layout = LAYOUT_LIBRARY[page.layoutKey];
        const assigned = assignments[page.templateKey] ?? [];
        return (
          <div key={page.id} className="rounded-md border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">
                  {String(page.order + 1).padStart(2, "0")} · {page.templateTitle}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {layout?.name ?? page.layoutKey} · {assigned.length} assigned
                </p>
              </div>
              <div className="w-28 shrink-0">
                <LayoutPreview slots={layout?.slots ?? []} />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(photos.data ?? []).map((p) => {
                const active = assigned.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => togglePhoto(page.templateKey, p.id)}
                    className={cn(
                      "rounded border px-2 py-1 text-[10px] transition-colors focus-gold",
                      active
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border text-muted-foreground hover:bg-surface-2"
                    )}
                  >
                    {p.originalName.slice(0, 18)}
                  </button>
                );
              })}
              {(photos.data ?? []).length === 0 && (
                <p className="text-[11px] text-muted-foreground">Upload photos first.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
