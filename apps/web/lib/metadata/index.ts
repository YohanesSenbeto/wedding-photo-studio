import { open } from "node:fs/promises";
import { parseJpegSize } from "./jpeg";
import { parseArwSize } from "./arw";

export interface ImageDimensions {
  width: number | null;
  height: number | null;
}

/**
 * Probe image dimensions from the file header.
 * - JPG: JPEG SOF marker scan
 * - ARW (Sony RAW): TIFF IFD0 ImageWidth/ImageLength
 *
 * If parsing fails (exotic variants), returns nulls — Photoshop/ACR will know
 * the real size later, and the UI degrades gracefully.
 */
export async function probeImageDimensions(
  filePath: string,
  extension: string
): Promise<ImageDimensions> {
  try {
    const handle = await open(filePath, "r");
    try {
      const head = Buffer.alloc(4 * 1024 * 1024); // headers live at the start; 4 MB is plenty
      const { bytesRead } = await handle.read({
        position: 0,
        length: head.length,
        buffer: head,
      });
      const slice = head.subarray(0, bytesRead);
      if (extension === "arw") {
        const size = parseArwSize(head);
        return { width: size?.width ?? null, height: size?.height ?? null };
      }
      const size = parseJpegSize(head);
      return { width: size?.width ?? null, height: size?.height ?? null };
    } finally {
      await handle.close();
    }
  } catch {
    return { width: null, height: null };
  }
}
