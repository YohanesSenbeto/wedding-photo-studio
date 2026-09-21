"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { useJob } from "@/hooks/use-jobs";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { JobCard } from "@/components/job-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { statusBadgeVariant } from "@/components/job-card";
import { formatDateTime } from "@/lib/utils";

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const { data, isLoading } = useJob(jobId);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const { job, outputs } = data;
  const jpgOutput = outputs.find((o) => o.format === "JPG") ?? outputs[0] ?? null;
  const jobFinished = job.status === "COMPLETED" || job.status === "FAILED";

  return (
    <div className="space-y-6">
      <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All jobs
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-wide">
            {job.type === "CREATE_ALBUM" ? "Album Generation" : "Professional Edit"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Job {job.id} · created {formatDateTime(job.createdAt)}
          </p>
        </div>
        <Badge variant={statusBadgeVariant(job.status)}>{job.status.replace("_", " ")}</Badge>
      </header>

      {job.status !== "COMPLETED" && job.status !== "FAILED" && (
        <Card>
          <CardContent className="py-6">
            <p className="mb-3 text-sm text-muted-foreground">
              Photoshop is working — this page updates automatically.
            </p>
            <JobCard job={job} />
          </CardContent>
        </Card>
      )}

      {job.status === "FAILED" && (
        <Card className="border-danger/40">
          <CardHeader>
            <CardTitle className="text-danger">Job failed</CardTitle>
            <CardDescription>{job.friendlyError || job.errorMessage}</CardDescription>
          </CardHeader>
          {job.errorCode && (
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Error code: <code className="rounded bg-surface-2 px-1">{job.errorCode}</code> — check
                the agent console on the Photoshop machine for the full log.
              </p>
            </CardContent>
          )}
        </Card>
      )}

      {job.type === "EDIT_PHOTO" && job.photoId && (
        <Card>
          <CardHeader>
            <CardTitle>Before / After</CardTitle>
            <CardDescription>
              Left: original upload · Right: output produced by Adobe Photoshop 2022.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jpgOutput ? (
              <BeforeAfterSlider
                photoId={job.photoId}
                outputId={jpgOutput.id}
                fileName={jpgOutput.fileName}
              />
            ) : !jobFinished ? (
              <BeforeAfterSlider photoId={job.photoId} outputId={null} fileName="edit" />
            ) : (
              <div className="rounded-md border border-warning/40 bg-warning/10 p-4 text-xs text-warning">
                <div className="flex items-start gap-2">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">No edited image was produced.</p>
                    {job.errorCode === "NO_OUTPUT" ? (
                      <p>{job.friendlyError || job.errorMessage}</p>
                    ) : (
                      <p>
                        The agent finished this job without uploading any output files
                        {job.errorCode ? (
                          <>
                            {" "}
                            (<code className="rounded bg-background/60 px-1">{job.errorCode}</code>)
                          </>
                        ) : null}
                        . Check the agent console on the Photoshop machine for the full log.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {outputs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Outputs ({outputs.length})</CardTitle>
            <CardDescription>Download PSD, TIFF or JPG files produced by Photoshop.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {outputs.map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-md border border-border bg-surface-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm" title={o.fileName}>
                      {o.fileName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {o.format} · {(o.fileSize / 1024 / 1024).toFixed(1)} MB
                      {o.dpi ? ` · ${o.dpi} DPI` : ""}
                      {o.colorMode ? ` · ${o.colorMode}` : ""}
                    </p>
                  </div>
                  <a
                    href={`/api/output/${o.id}/file`}
                    download
                    className="ml-2 shrink-0 text-xs font-semibold uppercase tracking-wider text-gold hover:underline"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
