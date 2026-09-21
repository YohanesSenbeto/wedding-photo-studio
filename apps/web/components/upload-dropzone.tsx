"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";
import { validatePhotoUpload, UploadValidationError } from "@wedding/validation";
import type { UploadItem } from "@/hooks/use-photos";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PhotoTile } from "./photo-tile";

interface Props {
  items: UploadItem[];
  onChange: (items: UploadItem[]) => void;
  onFilesChosen: (files: File[]) => void;
  uploading: boolean;
}

/**
 * Professional drag & drop upload for JPG/JPEG + Sony ARW.
 * Client-side pre-validation uses the SAME Zod schema as the server
 * (packages/validation) so users get instant feedback.
 */
export function UploadDropzone({ items, onChange, onFilesChosen, uploading }: Props) {
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const acceptFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const accepted: File[] = [];
    const next = [...items];
    for (const file of Array.from(fileList)) {
      try {
        const meta = validatePhotoUpload({ name: file.name, size: file.size, type: file.type });
        next.push({
          file,
          progress: 0,
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
          previewUrl: meta.isRaw ? null : URL.createObjectURL(file),
          isRaw: meta.isRaw,
        });
        accepted.push(file);
      } catch (err) {
        const message =
          err instanceof UploadValidationError ? err.message : `${file.name} is not supported`;
        next.push({
          file,
          progress: 100,
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
          previewUrl: null,
          isRaw: file.name.toLowerCase().endsWith(".arw"),
          error: message,
        });
      }
    }
    onChange(next);
    if (accepted.length > 0) onFilesChosen(accepted);
  };

  const removeAt = (index: number) => {
    const next = [...items];
    const [removed] = next.splice(index, 1);
    if (removed && removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    onChange(next);
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <section aria-label="Upload wedding photos">
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag and drop photos here, or press Enter to select photos"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          acceptFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragOver ? "border-gold bg-gold/5" : "border-border hover:border-gold/50 hover:bg-surface"
        )}
      >
        <UploadCloud className={cn("mb-3 h-10 w-10", dragOver ? "text-gold" : "text-muted-foreground")} />
        <h2 className="font-display text-2xl tracking-wide">Upload wedding photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Drag &amp; drop your JPG / Sony ARW files here</p>
        <p className="text-xs text-muted-foreground">or</p>
        <Button type="button" variant="outline" size="sm" className="mt-2 pointer-events-none" tabIndex={-1}>
          Select Photos
        </Button>
        <p className="mt-3 text-[11px] text-muted-foreground">
          JPG up to 40 MB · ARW RAW up to 200 MB · originals are never modified
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept=".jpg,.jpeg,.arw,image/jpeg,application/octet-stream"
          onChange={(e) => {
            acceptFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.id ?? `${item.file.name}-${index}`}>
              <PhotoTile
                item={item}
                index={index}
                onRemove={() => removeAt(index)}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
              />
            </li>
          ))}
        </ul>
      )}
      {uploading && (
        <p className="mt-3 animate-pulse text-center text-sm text-gold">
          Uploading photos to the studio…
        </p>
      )}
    </section>
  );
}
