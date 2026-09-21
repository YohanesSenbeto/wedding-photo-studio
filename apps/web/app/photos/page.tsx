"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { UploadDropzone } from "@/components/upload-dropzone";
import { PhotoGallery } from "@/components/photo-gallery";
import { PresetPicker } from "@/components/preset-picker";
import { EditPanel } from "@/components/edit-panel";
import { usePhotos, usePresets, usePhotoUploader, useDeletePhoto } from "@/hooks/use-photos";
import { useToast } from "@/components/toast";
import type { UploadItem } from "@/hooks/use-photos";
import type { PresetDTO } from "@wedding/types";
import type { CustomPresetParams } from "@wedding/validation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PhotosPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const photos = usePhotos();
  const presets = usePresets();
  const deletePhoto = useDeletePhoto();

  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [selectedPreset, setSelectedPreset] = React.useState<PresetDTO | null>(null);
  const [customParams, setCustomParams] = React.useState<CustomPresetParams>({});

  const uploader = usePhotoUploader((next) => setItems(next));

  const handleUploaded = () => {
    qc.invalidateQueries({ queryKey: ["photos"] });
    const failures = items.filter((i) => i.error);
    if (failures.length > 0) {
      toast.toast({
        kind: "error",
        title: `${failures.length} file(s) rejected`,
        description: failures[0].error,
      });
    }
    setTimeout(() => setItems((prev) => prev.filter((i) => !i.error)), 1500);
  };

  const togglePhoto = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds((prev) =>
      prev.size === (photos.data?.length ?? 0)
        ? new Set()
        : new Set((photos.data ?? []).map((p) => p.id))
    );
  };

  const handleDelete = (id: string) => {
    deletePhoto.mutate(id, {
      onSuccess: () => {
        toast.toast({ kind: "success", title: "Photo deleted" });
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
      onError: (err: Error) => toast.toast({ kind: "error", title: "Delete failed", description: err.message }),
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Photos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload, select, choose a preset — then make the professional edit.
        </p>
      </header>

      <UploadDropzone
        items={items}
        onChange={setItems}
        onFilesChosen={(files) =>
          uploader.mutate(files, {
            onSuccess: handleUploaded,
            onError: (err: Error) =>
              toast.toast({ kind: "error", title: "Upload failed", description: err.message }),
          })
        }
        uploading={uploader.isPending}
      />

      <Card>
        <CardHeader>
          <CardTitle>Select photos to edit</CardTitle>
          <CardDescription>Click a photo to include it in the professional edit batch.</CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoGallery
            photos={photos.data ?? []}
            isLoading={photos.isLoading}
            selectedIds={selectedIds}
            onToggle={togglePhoto}
            onSelectAll={selectAll}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose a professional preset</CardTitle>
          <CardDescription>
            Deterministic Photoshop adjustments — refine them before starting if you like.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {presets.isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : (
            <PresetPicker
              presets={presets.data ?? []}
              selectedKey={selectedPreset?.key ?? null}
              onSelect={(p) => {
                setSelectedPreset(p);
                setCustomParams({});
              }}
              customParams={customParams}
              onCustomChange={(patch) => setCustomParams((prev) => ({ ...prev, ...patch }))}
            />
          )}
        </CardContent>
      </Card>

      <EditPanel
        selectedPhotoIds={[...selectedIds]}
        selectedPreset={selectedPreset}
        customParams={customParams}
        disabled={photos.isLoading}
        onCompleted={() => {
          setSelectedIds(new Set());
          qc.invalidateQueries({ queryKey: ["jobs"] });
        }}
      />
    </div>
  );
}
