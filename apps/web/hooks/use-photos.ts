"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, uploadPhotos } from "@/lib/api-client";
import type { PhotoDTO } from "@wedding/types";

export function usePhotos() {
  return useQuery({
    queryKey: ["photos"],
    queryFn: api.listPhotos,
    select: (d) => d.photos,
  });
}

export interface UploadItem {
  id?: string;
  file: File;
  progress: number;
  previewUrl?: string | null;
  isRaw?: boolean;
  error?: string;
}

export function usePhotoUploader(onItemChange: (items: UploadItem[]) => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const items: UploadItem[] = files.map((file) => ({ file, progress: 0 }));
      onItemChange([...items]);
      const result = await uploadPhotos(files, (_name, percent) => {
        for (const it of items) it.progress = percent;
        onItemChange([...items]);
      });
      // surface per-file failures from the server response
      if (result.failed.length > 0) {
        for (const f of result.failed) {
          const match = items.find((it) => it.file.name === f.name);
          if (match) {
            match.error = f.error;
            match.progress = 100;
          }
        }
        onItemChange([...items]);
      }
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePhoto(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["photos"] }),
  });
}

export function usePresets() {
  return useQuery({
    queryKey: ["presets"],
    queryFn: api.listPresets,
    select: (d) => d.presets,
    staleTime: 5 * 60_000,
  });
}

export function useAgentStatus() {
  return useQuery({
    queryKey: ["agent-status"],
    queryFn: api.agentStatus,
    select: (d) => d.agents[0] ?? null,
    refetchInterval: 10_000,
  });
}
