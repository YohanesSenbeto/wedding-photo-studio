import type {
  PhotoDTO,
  EditingJobDTO,
  OutputFileDTO,
  AlbumDTO,
  AlbumPageDTO,
} from "@wedding/types";
import type { Photo, EditingJob, OutputFile, Album, AlbumPage } from "@prisma/client";
import { getFriendlyError } from "@wedding/config";

type WithDates = { createdAt: Date; updatedAt: Date };


export function toPhotoDTO(p: Photo): PhotoDTO {
  return {
    id: p.id,
    originalName: p.originalName,
    fileName: p.fileName,
    filePath: p.filePath,
    mimeType: p.mimeType,
    extension: (p.extension === "arw" ? "arw" : "jpg") as PhotoDTO["extension"],
    width: p.width,
    height: p.height,
    fileSize: p.fileSize,
    status: p.status,
    isRaw: p.extension === "arw",
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function toJobDTO(j: Omit<EditingJob, keyof WithDates> & WithDates): EditingJobDTO {
  return {
    id: j.id,
    photoId: j.photoId,
    albumId: j.albumId,
    type: j.type,
    status: j.status,
    progress: j.progress,
    agentJobId: j.agentJobId,
    inputPath: j.inputPath,
    outputPath: j.outputPath,
    errorMessage: j.errorMessage,
    errorCode: j.errorCode,
    friendlyError: getFriendlyError(j.errorCode, j.errorMessage ?? undefined),
    startedAt: j.startedAt?.toISOString() ?? null,
    completedAt: j.completedAt?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
  };
}

export function toOutputDTO(o: OutputFile): OutputFileDTO {
  return {
    id: o.id,
    jobId: o.jobId,
    photoId: o.photoId,
    albumId: o.albumId,
    kind: o.kind,
    format: o.format,
    fileName: o.fileName,
    fileSize: o.fileSize,
    width: o.width,
    height: o.height,
    dpi: o.dpi,
    colorMode: o.colorMode,
    createdAt: o.createdAt.toISOString(),
  };
}

type PageRow = AlbumPage & { outputId: string | null };

export function toPageDTO(pg: PageRow): AlbumPageDTO {
  return {
    id: pg.id,
    albumId: pg.albumId,
    order: pg.order,
    templateKey: pg.templateKey,
    templateTitle: pg.templateTitle,
    layoutKey: pg.layoutKey,
    caption: pg.caption,
    photoIds: [...pg.photoIds],
    outputId: pg.outputId,
  };
}

export function toAlbumDTO(
  a: Album & { pages: PageRow[] }
): AlbumDTO {
  return {
    id: a.id,
    groomName: a.groomName,
    brideName: a.brideName,
    weddingDate: a.weddingDate,
    location: a.location,
    caption: a.caption,
    status: a.status,
    pages: [...a.pages].sort((x, y) => x.order - y.order).map(toPageDTO),
    createdAt: a.createdAt.toISOString(),
  };
}

