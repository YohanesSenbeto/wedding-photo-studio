"use client";

import type { PhotoDTO, EditingJobDTO, PresetDTO, AlbumDTO, OutputFileDTO, AgentDTO } from "@wedding/types";

/**
 * Browser API client. Uploads use XHR so we can report real progress.
 */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = body as { error?: string; code?: string };
    throw Object.assign(new Error(err.error || `Request failed (${res.status})`), {
      code: err.code,
      status: res.status,
    });
  }
  return body as T;
}

export const api = {
  listPhotos: () => request<{ photos: PhotoDTO[] }>("/api/photos"),
  deletePhoto: (id: string) => request<{ deleted: string }>(`/api/photos/${id}`, { method: "DELETE" }),

  listPresets: () => request<{ presets: PresetDTO[] }>("/api/presets"),

  listJobs: () => request<{ jobs: (EditingJobDTO & { photoName: string | null })[] }>("/api/jobs"),
  getJob: (jobId: string) =>
    request<{ job: EditingJobDTO; outputs: OutputFileDTO[] }>(`/api/edit/${jobId}`),

  startEdit: (input: {
    photoIds: string[];
    presetKey?: string;
    presetId?: string;
    customParams?: Record<string, unknown>;
    outputFormats: string[];
    quality: string;
    colorMode: string;
    dpi: number;
  }) =>
    request<{ jobs: EditingJobDTO[] }>("/api/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),

  agentStatus: () => request<{ agents: (AgentDTO & { photoshopMode: string })[] }>("/api/agent/status"),

  listAlbums: () => request<{ albums: AlbumDTO[] }>("/api/album"),
  createAlbum: (input: {
    groomName: string;
    brideName: string;
    weddingDate: string;
    location: string;
    caption?: string;
    templateKeys?: string[];
  }) =>
    request<{ album: AlbumDTO }>("/api/album/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  assignPages: (albumId: string, assignments: Record<string, string[]>) =>
    request<{ ok: boolean }>(`/api/album/${albumId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignments }),
    }),
  generateAlbum: (
    albumId: string,
    input: { outputFormats?: string[]; quality?: string; dpi?: number; colorMode?: string }
  ) =>
    request<{ job: EditingJobDTO }>(`/api/album/${albumId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),

  listOutputs: (filters: { photoId?: string; albumId?: string } = {}) => {
    const sp = new URLSearchParams();
    if (filters.photoId) sp.set("photoId", filters.photoId);
    if (filters.albumId) sp.set("albumId", filters.albumId);
    const qs = sp.toString();
    return request<{ outputs: OutputFileDTO[] }>(`/api/output${qs ? `?${qs}` : ""}`);
  },
  outputFileUrl: (id: string) => `/api/output/${id}/file`,
  photoFileUrl: (id: string) => `/api/photos/${id}/file`,
};

/** Upload with real per-file progress via XHR. */
export function uploadPhotos(
  files: File[],
  onProgress: (fileName: string, percent: number) => void
): Promise<{ photos: PhotoDTO[]; failed: { name: string; error: string }[] }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    for (const f of files) form.append("files", f, f.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/photos/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        for (const f of files) onProgress(f.name, percent);
      }
    };
    xhr.onload = () => {
      let body: unknown = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as { photos: PhotoDTO[]; failed: { name: string; error: string }[] });
      } else {
        const err = body as { error?: string };
        reject(new Error(err.error || `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

/** Ask the LOCAL agent (same machine) to open a folder in Explorer. */
export async function openInExplorer(folderPath: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_AGENT_URL || "http://127.0.0.1:47821";
  const res = await fetch(`${base}/open-folder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: folderPath }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Agent responded ${res.status}`);
  }
}
