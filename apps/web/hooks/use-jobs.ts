"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ACTIVE_JOB_STATUSES } from "@wedding/types";
import type { EditingJobDTO } from "@wedding/types";

/** Polls fast while any job is active. */
export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: api.listJobs,
    select: (d) => d.jobs,
    refetchInterval: (query) => {
      const jobs = query.state.data?.jobs ?? [];
      const anyActive = jobs.some((j) => ACTIVE_JOB_STATUSES.includes(j.status));
      return anyActive ? 2_000 : 15_000;
    },
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => api.getJob(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.job.status;
      return status && ACTIVE_JOB_STATUSES.includes(status) ? 2_000 : false;
    },
  });
}

export interface StartEditInput {
  photoIds: string[];
  presetKey?: string;
  presetId?: string;
  customParams?: Record<string, unknown>;
  outputFormats: string[];
  quality: string;
  colorMode: string;
  dpi: number;
}

export function useStartEdit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartEditInput) => api.startEdit(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}

export type JobListItem = EditingJobDTO & { photoName: string | null };
