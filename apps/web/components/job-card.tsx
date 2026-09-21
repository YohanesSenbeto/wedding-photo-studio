"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { JobStatus } from "@wedding/types";
import { ACTIVE_JOB_STATUSES } from "@wedding/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatDateTime } from "@/lib/utils";

const STATUS_VARIANT: Record<JobStatus, "default" | "neutral" | "success" | "warning" | "danger" | "info"> = {
  QUEUED: "neutral",
  CONNECTING: "info",
  PROCESSING: "info",
  PHOTOSHOP_OPENING: "warning",
  EDITING: "default",
  EXPORTING: "info",
  COMPLETED: "success",
  FAILED: "danger",
};

export function statusBadgeVariant(status: JobStatus) {
  return STATUS_VARIANT[status];
}

interface Props {
  job: {
    id: string;
    status: JobStatus;
    progress: number;
    photoName?: string | null;
    type?: string;
    createdAt: string;
    completedAt?: string | null;
    friendlyError?: string | null;
    errorCode?: string | null;
  };
  compact?: boolean;
}

export function JobCard({ job, compact }: Props) {
  const active = ACTIVE_JOB_STATUSES.includes(job.status);
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-gold/40 focus-gold",
        compact && "p-3"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {job.photoName || (job.type === "CREATE_ALBUM" ? "Wedding album" : "Photo edit")}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {job.type === "CREATE_ALBUM" ? "Album generation" : "Professional edit"} ·{" "}
            {formatDateTime(job.createdAt)}
          </p>
        </div>
        <Badge variant={statusBadgeVariant(job.status)}>
          {active && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          {job.status.replace("_", " ")}
        </Badge>
      </div>
      {active && <Progress value={job.progress} className="mt-3" />}
      {job.status === "FAILED" && job.friendlyError && !compact && (
        <p className="mt-2 text-xs text-danger">{job.friendlyError}</p>
      )}
    </Link>
  );
}
