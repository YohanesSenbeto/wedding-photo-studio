"use client";

import { X, ChevronUp, ChevronDown, FileWarning, ImageIcon } from "lucide-react";
import type { UploadItem } from "@/hooks/use-photos";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";

interface Props {
  item: UploadItem;
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/** One tile in the upload tray: thumbnail, name, size, RAW badge, controls. */
export function PhotoTile({ item, index, onRemove, onMoveUp, onMoveDown }: Props) {
  const raw = item.file.name.toLowerCase().endsWith(".arw");
  const invalid = Boolean(item.error);
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex h-28 items-center justify-center bg-surface-2">
        {item.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
        ) : raw ? (
          <div className="flex flex-col items-center gap-1 text-purple-300">
            <FileWarning className="h-7 w-7" />
            <span className="text-[10px] uppercase tracking-widest">RAW preview n/a</span>
          </div>
        ) : (
          <ImageIcon className="h-7 w-7 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-1 p-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Photo {String(index + 1).padStart(2, "0")}
        </p>
        <p className="truncate text-xs font-medium" title={item.file.name}>
          {item.file.name}
        </p>
        <div className="flex items-center gap-1.5">
          <Badge variant={raw ? "raw" : "neutral"}>{raw ? "RAW" : "JPG"}</Badge>
          <span className="text-[10px] text-muted-foreground">{formatBytes(item.file.size)}</span>
        </div>
        {item.error && <p className="text-[10px] leading-snug text-danger">{item.error}</p>}
        {!invalid && item.progress > 0 && item.progress < 100 && (
          <Progress value={item.progress} className="h-1" />
        )}
      </div>
      <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          aria-label={`Move ${item.file.name} up`}
          onClick={onMoveUp}
          className="rounded bg-background/80 p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Move ${item.file.name} down`}
          onClick={onMoveDown}
          className="rounded bg-background/80 p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Remove ${item.file.name}`}
          onClick={onRemove}
          className="rounded bg-background/80 p-1 text-danger"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
