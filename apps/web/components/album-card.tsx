"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import type { AlbumDTO } from "@wedding/types";
import { useGenerateAlbum } from "@/hooks/use-albums";
import { useToast } from "@/components/toast";
import { AlbumPagesEditor } from "./album-pages-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ALBUM_BADGE: Record<string, "neutral" | "info" | "warning" | "success" | "danger" | "default"> = {
  DRAFT: "neutral",
  QUEUED: "info",
  PROCESSING: "warning",
  COMPLETED: "success",
  FAILED: "danger",
};

/** One album: info, per-page photo assignment, generate action. */
export function AlbumCard({ album }: { album: AlbumDTO }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const generate = useGenerateAlbum(album.id);

  const generateAlbum = () => {
    generate.mutate(
      { quality: "PRINT", dpi: 300, outputFormats: ["JPG", "PSD"] },
      {
        onSuccess: () =>
          toast.toast({
            kind: "success",
            title: "Album queued for Photoshop",
            description: "The agent will assemble every page and upload the results.",
          }),
        onError: (err: Error) =>
          toast.toast({ kind: "error", title: "Generation failed", description: err.message }),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>
              {album.groomName} <span className="text-gold">&amp;</span> {album.brideName}
            </CardTitle>
            <CardDescription>
              {album.weddingDate} · {album.location} · {album.pages.length} pages
            </CardDescription>
          </div>
          <Badge variant={ALBUM_BADGE[album.status]}>{album.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
            {open ? "Hide pages" : "Assign photos"}
          </Button>
          <Button
            size="sm"
            onClick={generateAlbum}
            disabled={generate.isPending || album.status === "PROCESSING"}
          >
            <Wand2 className="h-4 w-4" /> {generate.isPending ? "Queueing…" : "Generate Album"}
          </Button>
        </div>
        {open && <AlbumPagesEditor album={album} />}
      </CardContent>
    </Card>
  );
}
