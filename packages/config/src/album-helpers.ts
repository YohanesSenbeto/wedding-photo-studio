export interface AlbumPageCreateInput {
  order: number;
  templateKey: string;
  templateTitle: string;
  layoutKey: string;
  caption?: string | null;
  photoIds?: string[];
  params?: unknown;
}

export function toAlbumPageCreateInputs(
  pages: unknown[]
): AlbumPageCreateInput[] {
  return pages as AlbumPageCreateInput[];
}
