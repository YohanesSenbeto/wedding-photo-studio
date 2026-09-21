import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { CreateAlbumSchema } from "@wedding/validation";
import { prisma } from "@/lib/db";
import { toAlbumDTO } from "@/lib/dto";
import { buildAlbumPages, toPrismaAlbumPageCreateInputs } from "@/lib/album";
import { jsonOk, toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/album/create — create album + pages (DRAFT). */
export async function POST(request: NextRequest) {
  try {
    const body = CreateAlbumSchema.parse(await request.json());
    const templateKeys = body.templateKeys ?? DEFAULT_TEMPLATE_KEYS;
    const pages = buildAlbumPages(templateKeys);
    const pageCreates = toPrismaAlbumPageCreateInputs(pages);

    const album = await prisma.album.create({
      data: {
        groomName: body.groomName,
        brideName: body.brideName,
        weddingDate: body.weddingDate,
        location: body.location,
        caption: body.caption ?? null,
        status: "DRAFT",
        pages: { create: pageCreates },
      },
    });

    const albumWithPages = await prisma.album.findUnique({
      where: { id: album.id },
      include: { pages: { orderBy: { order: "asc" } } },
    });

    return jsonOk(
      { album: toAlbumDTO(albumWithPages!) },
      201
    );
  } catch (err) {
    return toErrorResponse(err);
  }
}

const DEFAULT_TEMPLATE_KEYS = [
  "01_Cover",
  "02_Getting_Ready",
  "03_Bride",
  "04_Groom",
  "05_Ceremony",
  "06_Family",
  "07_Couple_Portraits",
  "08_Reception",
  "09_Dance",
  "10_Details",
  "11_Candid",
  "12_Final_Portrait",
];

