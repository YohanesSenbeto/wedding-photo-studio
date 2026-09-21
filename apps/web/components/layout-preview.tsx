import type { LayoutSlot } from "@wedding/config";

interface Props {
  slots: LayoutSlot[];
  label?: string;
}

/** Mini CSS mock-up of an album layout (percent-based slots). */
export function LayoutPreview({ slots, label }: Props) {
  return (
    <div aria-label={label ? `Layout preview: ${label}` : "Layout preview"}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-surface-2">
        {slots.map((slot, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center border border-gold/40 bg-gold/10 text-[9px] font-semibold text-gold"
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.w}%`,
              height: `${slot.h}%`,
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
        ))}
      </div>
      {label && <p className="mt-1.5 text-center text-[11px] text-muted-foreground">{label}</p>}
    </div>
  );
}
