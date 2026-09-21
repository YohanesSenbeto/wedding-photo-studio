"use client";

import Link from "next/link";
import { Images, CheckCircle2, XCircle, Loader2, Server, Zap } from "lucide-react";
import { useJobs } from "@/hooks/use-jobs";
import { usePhotos } from "@/hooks/use-photos";
import { useOutputs } from "@/hooks/use-albums";
import { StatCard } from "@/components/stat-card";
import { JobCard } from "@/components/job-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WORKFLOW = [
  { step: "1", title: "Upload Photos", desc: "Drag & drop JPG / Sony ARW files." },
  { step: "2", title: "Select Photos", desc: "Pick the shots to edit." },
  { step: "3", title: "Choose Preset", desc: "8 professional styles, refinable." },
  { step: "4", title: "Make Professional Edit", desc: "Photoshop 2022 does the work." },
];

export default function DashboardPage() {
  const jobs = useJobs();
  const photos = usePhotos();
  const outputs = useOutputs();

  const allJobs = jobs.data ?? [];
  const processing = allJobs.filter((j) => !["COMPLETED", "FAILED", "QUEUED"].includes(j.status)).length;
  const completed = allJobs.filter((j) => j.status === "COMPLETED").length;
  const failed = allJobs.filter((j) => j.status === "FAILED").length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Professional Studio</p>
        <h1 className="mt-1 font-display text-4xl tracking-wide">
          Wedding Photo <span className="gold-gradient-text">Editing Studio</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Upload JPG and Sony ARW photos, choose a professional preset and click{" "}
          <span className="text-gold">MAKE PROFESSIONAL EDIT</span> — your local Windows agent
          drives Adobe Photoshop 2022 to produce PSD, TIFF and JPG outputs.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Photos" value={photos.data?.length ?? "…"} tone="gold" icon={<Images className="h-4 w-4" />} />
        <StatCard label="Processing" value={jobs.isLoading ? "…" : processing} icon={<Loader2 className="h-4 w-4" />} />
        <StatCard label="Completed" value={jobs.isLoading ? "…" : completed} tone="success" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Failed" value={jobs.isLoading ? "…" : failed} tone={failed > 0 ? "danger" : "neutral"} icon={<XCircle className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow</CardTitle>
          <CardDescription>From raw files to album-ready exports.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((w) => (
              <li key={w.step} className="rounded-lg border border-border bg-surface-2 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold">
                  {w.step}
                </span>
                <p className="mt-2 text-sm font-medium">{w.title}</p>
                <p className="text-xs text-muted-foreground">{w.desc}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Editing Jobs</CardTitle>
            <CardDescription>
              <Link href="/jobs" className="text-gold hover:underline">
                View all jobs →
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.isLoading && <p className="text-sm text-muted-foreground">Loading jobs…</p>}
            {!jobs.isLoading && allJobs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No jobs yet. Upload photos and click MAKE PROFESSIONAL EDIT.
              </p>
            )}
            {allJobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} compact />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
            <CardDescription>Agent &amp; Photoshop connection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Server className="h-4 w-4" /> Agent
              </span>
              <Badge variant={processing > 0 ? "warning" : "neutral"}>
                {processing > 0 ? "BUSY" : "checking…"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" /> Outputs produced
              </span>
              <span className="font-semibold">{outputs.data?.length ?? "…"}</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              The browser never edits pixels. Every professional edit is executed by Adobe
              Photoshop 2022 through the local agent on your Windows machine.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
