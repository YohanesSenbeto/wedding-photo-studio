"use client";

import { useJobs } from "@/hooks/use-jobs";
import { JobCard } from "@/components/job-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobsPage() {
  const jobs = useJobs();
  const all = jobs.data ?? [];
  const active = all.filter((j) => !["COMPLETED", "FAILED"].includes(j.status));
  const done = all.filter((j) => ["COMPLETED", "FAILED"].includes(j.status));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Editing Jobs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live status of every Photoshop job on the local agent. Statuses update automatically.
        </p>
      </header>

      {active.length > 0 && (
        <section aria-label="Active jobs">
          <h2 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Active</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {active.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Finished jobs">
        <h2 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Finished</h2>
        {jobs.isLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : done.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No finished jobs yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {done.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
