import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  tone?: "gold" | "success" | "danger" | "neutral";
  icon?: React.ReactNode;
  hint?: string;
}

export function StatCard({ label, value, tone = "neutral", icon, hint }: Props) {
  const toneClass = {
    gold: "text-gold",
    success: "text-success",
    danger: "text-danger",
    neutral: "text-foreground",
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className={cn("mt-2 font-display text-4xl", toneClass)}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
