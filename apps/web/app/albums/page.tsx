"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { CreateAlbumSchema } from "@wedding/validation";
import { useAlbums, useCreateAlbum, useGenerateAlbum } from "@/hooks/use-albums";
import { usePhotos } from "@/hooks/use-photos";
import { useToast } from "@/components/toast";
import { AlbumCard } from "@/components/album-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const FormSchema = CreateAlbumSchema;

type FormValues = z.infer<typeof FormSchema>;

export default function AlbumsPage() {
  const toast = useToast();
  const albums = useAlbums();
  const createAlbum = useCreateAlbum();
  const [showForm, setShowForm] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      groomName: "",
      brideName: "",
      weddingDate: "",
      location: "",
      caption: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createAlbum.mutate(values, {
      onSuccess: (data) => {
        toast.toast({
          kind: "success",
          title: "Album created",
          description: `${data.album.groomName} & ${data.album.brideName} — ${data.album.pages.length} pages ready for photos.`,
        });
        setShowForm(false);
        form.reset();
      },
      onError: (err: Error) => toast.toast({ kind: "error", title: "Could not create album", description: err.message }),
    });
  });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Wedding Albums</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            12 professional pages, assembled in Photoshop from your edited photos.
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" /> New Album
        </Button>
      </header>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Album configuration</CardTitle>
            <CardDescription>
              These values populate the Photoshop template text layers (names, date, location).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
              <div>
                <Label htmlFor="groomName">Groom name</Label>
                <Input id="groomName" placeholder="Joni" {...form.register("groomName")} />
                {form.formState.errors.groomName && (
                  <p className="mt-1 text-xs text-danger">{form.formState.errors.groomName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="brideName">Bride name</Label>
                <Input id="brideName" placeholder="Astu" {...form.register("brideName")} />
                {form.formState.errors.brideName && (
                  <p className="mt-1 text-xs text-danger">{form.formState.errors.brideName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="weddingDate">Wedding date</Label>
                <Input id="weddingDate" placeholder="03 MAY 2026" {...form.register("weddingDate")} />
                {form.formState.errors.weddingDate && (
                  <p className="mt-1 text-xs text-danger">{form.formState.errors.weddingDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Wedding location</Label>
                <Input id="location" placeholder="Addis Ababa" {...form.register("location")} />
                {form.formState.errors.location && (
                  <p className="mt-1 text-xs text-danger">{form.formState.errors.location.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="caption">Optional caption</Label>
                <Textarea id="caption" placeholder="Forever begins today…" {...form.register("caption")} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={createAlbum.isPending}>
                  {createAlbum.isPending ? "Creating…" : "Create Album"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {albums.isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (albums.data ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No albums yet — create one and assign photos to its pages.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(albums.data ?? []).map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
