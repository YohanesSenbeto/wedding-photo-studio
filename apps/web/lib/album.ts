import { ALBUM_TEMPLATES, LAYOUT_LIBRARY, slotsForLayout, type LayoutSlot } from "@wedding/config";
import type { Prisma } from "@prisma/client";

export interface NewAlbumPage {
  order: number;
  templateKey: string;
  templateTitle: string;
  layoutKey: string;
  caption: string | null;
  photoIds: string[];
  params: LayoutSlot[];
}

/** Resolve the standard wedding page set into persisted AlbumPage rows. */
export function buildAlbumPages(templateKeys: string[]): NewAlbumPage[] {
  return templateKeys.map((key, order) => {
    const template =
      ALBUM_TEMPLATES.find((t) => t.key === key) ?? {
        key,
        title: key,
        description: "",
        defaultLayout: "single-framed",
      };
    const layout = LAYOUT_LIBRARY[template.defaultLayout] ?? LAYOUT_LIBRARY["single-framed"];
    return {
      order,
      templateKey: template.key,
      templateTitle: template.title,
      layoutKey: template.defaultLayout,
      caption: null,
      photoIds: [] as string[],
      params: slotsForLayout(template.defaultLayout, layout.slots.length),
    };
  });
}

/** Map our internal page shape onto the Prisma album page create input shape. */
export function toPrismaAlbumPageCreateInputs(
  pages: NewAlbumPage[]
): Prisma.AlbumPageCreateWithoutAlbumInput[] {
  return pages.map((p) => ({
    order: p.order,
    templateKey: p.templateKey,
    templateTitle: p.templateTitle,
    layoutKey: p.layoutKey,
    caption: p.caption,
    photoIds: p.photoIds,
    params: p.params as unknown as Prisma.InputJsonValue,
  }));
}
