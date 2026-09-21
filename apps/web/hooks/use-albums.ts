"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useAlbums() {
  return useQuery({
    queryKey: ["albums"],
    queryFn: api.listAlbums,
    select: (d) => d.albums,
    refetchInterval: 20_000,
  });
}

export function useCreateAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createAlbum,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["albums"] }),
  });
}

export function useAssignPages(albumId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignments: Record<string, string[]>) => api.assignPages(albumId, assignments),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["albums"] }),
  });
}

export function useGenerateAlbum(albumId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { outputFormats?: string[]; quality?: string; dpi?: number; colorMode?: string }) =>
      api.generateAlbum(albumId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["albums"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useOutputs(filters: { photoId?: string; albumId?: string } = {}) {
  const key = ["outputs", filters.photoId ?? null, filters.albumId ?? null];
  return useQuery({
    queryKey: key,
    queryFn: () => api.listOutputs(filters),
    select: (d) => d.outputs,
    refetchInterval: 15_000,
  });
}
