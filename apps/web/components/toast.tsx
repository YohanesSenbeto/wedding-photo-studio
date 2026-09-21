"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, Info, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastKind = "success" | "error" | "info" | "loading";

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  update: (id: string, patch: Partial<Omit<Toast, "id">>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-4), { ...t, id }]);
      if (t.kind !== "loading") {
        setTimeout(() => dismiss(id), t.kind === "error" ? 8000 : 5000);
      }
      return id;
    },
    [dismiss]
  );

  const update = React.useCallback(
    (id: string, patch: Partial<Omit<Toast, "id">>) => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      if (patch.kind && patch.kind !== "loading") {
        setTimeout(() => dismiss(id), 5000);
      }
    },
    [dismiss]
  );

  const value = React.useMemo(() => ({ toast, dismiss, update }), [toast, dismiss, update]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex animate-fade-in items-start gap-2 rounded-lg border border-border bg-surface p-3 shadow-lg",
              t.kind === "error" && "border-danger/40",
              t.kind === "success" && "border-success/40"
            )}
          >
            {t.kind === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />}
            {t.kind === "error" && <AlertTriangle className="mt-0.5 h-4 w-4 text-danger" />}
            {t.kind === "info" && <Info className="mt-0.5 h-4 w-4 text-gold" />}
            {t.kind === "loading" && <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-gold" />}
            <div className="flex-1 text-sm">
              <p className="font-medium">{t.title}</p>
              {t.description && <p className="mt-0.5 text-muted-foreground">{t.description}</p>}
            </div>
            <button
              aria-label="Dismiss notification"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => dismiss(t.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
