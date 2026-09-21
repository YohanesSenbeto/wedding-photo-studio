"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** Accessible toggle switch (no radix dependency). */
export function Switch({ checked, onCheckedChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className="flex items-center gap-2 focus-gold disabled:opacity-50"
    >
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          checked ? "bg-gold" : "bg-surface-2 border border-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full transition-all",
            checked ? "left-4 bg-zinc-950" : "left-0.5 bg-muted-foreground"
          )}
        />
      </span>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
    </button>
  );
}
