"use client";

import { Trash2 } from "lucide-react";
import type { PhotoDTO } from "@wedding/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { formatBytes, cn } from "@/lib/utils";

interface Props {
  photos: PhotoDTO[];
  isLoading?: boolean;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDelete: (id: string) => void;
}

/** Uploaded-photo grid with multi-select for editing. */
export function PhotoGallery({ photos, isLoading, selectedIds, onToggle, onSelectAll, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }
  if (photos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No photos yet — upload JPG or Sony ARW files above.
      </p>
    );
  }
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedIds.size} of {photos.length} selected
        </p>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs uppercase tracking-wider text-gold hover:underline focus-gold"
        >
          {selectedIds.size === photos.length ? "Clear selection" : "Select all"}
        </button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {photos.map((photo) => {
          const selected = selectedIds.has(photo.id);
          return (
            <li key={photo.id} className="relative">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onToggle(photo.id)}
                className={cn(
                  "block w-full overflow-hidden rounded-lg border-2 text-left transition-colors focus-gold",
                  selected ? "border-gold" : "border-border hover:border-gold/40"
                )}
              >
                <span className="flex h-32 items-center justify-center bg-surface-2">
                  {photo.isRaw ? (
                    <span className="text-center text-[10px] uppercase tracking-widest text-purple-300">
                      ARW
                      <br />
                      RAW
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={api.photoFileUrl(photo.id)}
                      alt={photo.originalName}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className="block p-2">
                  <span className="block truncate text-xs font-medium" title={photo.originalName}>
                    {photo.originalName}
                  </span>
                  <span className="mt-1 flex items-center gap-1">
                    <Badge variant={photo.isRaw ? "raw" : "neutral"}>{photo.isRaw ? "RAW" : "JPG"}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatBytes(photo.fileSize)}</span>
                    {photo.width && photo.height && (
                      <span className="text-[10px] text-muted-foreground">
                        {photo.width}×{photo.height}
                      </span>
                    )}
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${photo.originalName}`}
                onClick={() => onDelete(photo.id)}
                className="absolute right-1 top-1 rounded bg-background/80 p-1 text-danger opacity-0 transition-opacity hover:text-danger focus:opacity-100 group-hover:opacity-100 [li:hover>&]:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              {selected && (
                <span className="pointer-events-none absolute left-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-zinc-950">
                  ✓
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
