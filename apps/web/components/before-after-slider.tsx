"use client";

import * as React from "react";
import { Download, Maximize2, RotateCw, FolderOpen, ZoomIn, ZoomOut } from "lucide-react";
import { api, openInExplorer } from "@/lib/api-client";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Props {
  photoId: string; // original
  outputId: string | null; // edited (after job completes)
  fileName: string;
}

/**
 * Before/After comparison slider with zoom, rotate, fullscreen and download.
 * Before = original upload; After = file produced by PHOTOSHOP on the agent.
 */
export function BeforeAfterSlider({ photoId, outputId, fileName }: Props) {
  const toast = useToast();
  const [position, setPosition] = React.useState(50);
  const [rotation, setRotation] = React.useState(0);
  const [zoom, setZoom] = React.useState(1);
  const [fullscreen, setFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const onPointer = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  };

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragging.current) onPointer(e.clientX);
    };
    const onUp = () => (dragging.current = false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const openFolder = async () => {
    try {
      await openInExplorer("outputs");
      toast.toast({ kind: "success", title: "Opening output folder on the agent machine" });
    } catch (err) {
      toast.toast({
        kind: "error",
        title: "Agent not reachable",
        description: err instanceof Error ? err.message : "Is the local agent running?",
      });
    }
  };

  return (
    <section className={cn(fullscreen && "fixed inset-0 z-50 flex flex-col bg-background/95 p-4")}>
      <Toolbar
        fullscreen={fullscreen}
        hasOutput={Boolean(outputId)}
        outputId={outputId}
        onRotate={() => setRotation((r) => (r + 90) % 360)}
        onZoomIn={() => setZoom((z) => Math.min(4, z + 0.25))}
        onZoomOut={() => setZoom((z) => Math.max(1, z - 0.25))}
        onToggleFullscreen={() => setFullscreen((f) => !f)}
        onOpenFolder={openFolder}
      />
      <Viewport
        containerRef={containerRef}
        fullscreen={fullscreen}
        position={position}
        rotation={rotation}
        zoom={zoom}
        photoId={photoId}
        outputId={outputId}
        fileName={fileName}
        onPointerDown={(x) => {
          dragging.current = true;
          onPointer(x);
        }}
        onKeyDown={(delta) => setPosition((p) => Math.max(0, Math.min(100, p + delta)))}
      />
      <div className="mt-3 w-full max-w-md px-2">
        <Slider
          min={0}
          max={100}
          value={position}
          aria-label="Comparison position"
          onChange={(e) => setPosition(Number(e.target.value))}
        />
      </div>
    </section>
  );
}

/* Subcomponents are defined below. */
function Toolbar(props: ToolbarProps) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={props.onRotate} aria-label="Rotate">
        <RotateCw className="h-4 w-4" /> Rotate
      </Button>
      <Button variant="outline" size="sm" onClick={props.onZoomIn} aria-label="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={props.onZoomOut} aria-label="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={props.onToggleFullscreen} aria-label="Toggle fullscreen">
        <Maximize2 className="h-4 w-4" /> {props.fullscreen ? "Exit" : "Fullscreen"}
      </Button>
      <Button variant="outline" size="sm" onClick={props.onOpenFolder} aria-label="Open output folder">
        <FolderOpen className="h-4 w-4" /> Output folder
      </Button>
      {props.hasOutput && (
        <a href={api.outputFileUrl(props.outputId as string)} download>
          <Button variant="outline" size="sm" aria-label="Download edited file">
            <Download className="h-4 w-4" /> Download
          </Button>
        </a>
      )}
    </div>
  );
}

function Viewport(props: ViewportProps) {
  return (
    <div
      ref={props.containerRef}
      className={cn(
        "relative w-full select-none overflow-hidden rounded-lg border border-border bg-black",
        props.fullscreen ? "h-[75vh]" : "h-[420px]"
      )}
      onPointerDown={(e) => props.onPointerDown(e.clientX)}
      role="slider"
      aria-label="Before after comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(props.position)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") props.onKeyDown(-4);
        if (e.key === "ArrowRight") props.onKeyDown(4);
      }}
    >
      {/* AFTER (Photoshop output) — bottom layer */}
      <div className="absolute inset-0 flex items-center justify-center">
        {props.outputId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={api.outputFileUrl(props.outputId)}
            alt={`Edited ${props.fileName}`}
            draggable={false}
            className="max-h-full max-w-full object-contain transition-transform"
            style={{ transform: `rotate(${props.rotation}deg) scale(${props.zoom})` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Edited version will appear here after Photoshop completes.
          </div>
        )}
      </div>
      {/* BEFORE (original) — clipped top layer */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - props.position}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={api.photoFileUrl(props.photoId)}
          alt={`Original ${props.fileName}`}
          draggable={false}
          className="max-h-full max-w-full object-contain transition-transform"
          style={{ transform: `rotate(${props.rotation}deg) scale(${props.zoom})` }}
        />
      </div>
      {/* Divider */}
      <div className="absolute inset-y-0 z-10 w-0.5 bg-gold" style={{ left: `${props.position}%` }} aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold bg-background/80" />
      </div>
      <span className="absolute left-2 top-2 z-10 rounded bg-background/70 px-2 py-0.5 text-[10px] uppercase tracking-widest">
        Before
      </span>
      <span className="absolute right-2 top-2 z-10 rounded bg-background/70 px-2 py-0.5 text-[10px] uppercase tracking-widest">
        After · Photoshop
      </span>
    </div>
  );
}

interface ToolbarProps {
  fullscreen: boolean;
  hasOutput: boolean;
  outputId: string | null;
  onRotate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  onOpenFolder: () => void;
}

interface ViewportProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  fullscreen: boolean;
  position: number;
  rotation: number;
  zoom: number;
  photoId: string;
  outputId: string | null;
  fileName: string;
  onPointerDown: (clientX: number) => void;
  onKeyDown: (delta: number) => void;
}
