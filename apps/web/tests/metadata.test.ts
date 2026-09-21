import { describe, it, expect } from "vitest";
import { parseJpegSize } from "@/lib/metadata/jpeg";
import { parseArwSize } from "@/lib/metadata/arw";

/** Builds a minimal, structurally-valid JPEG byte stream. */
function buildJpeg(width: number, height: number, withApp1 = false): Uint8Array {
  const bytes: number[] = [0xff, 0xd8]; // SOI

  if (withApp1) {
    // APP1 (EXIF) containing a fake embedded thumbnail SOF0 that must be skipped
    const payload = [0x00, 0x00]; // placeholder length fixed below
    const thumb = [0xff, 0xc0, 0x00, 0x07, 0x08, 0x01, 0x00, 0x01, 0x01, 0x00];
    const content = [...thumb];
    const len = content.length + 2;
    bytes.push(0xff, 0xe1, (len >> 8) & 0xff, len & 0xff, ...content);
    void payload;
  }

  // DQT (67 bytes total)
  bytes.push(0xff, 0xdb, 0x00, 0x43, 0x00, ...new Array(65).fill(0x10));
  // SOF0: precision 8, height, width, 1 component
  bytes.push(
    0xff, 0xc0, 0x00, 0x0b, 0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x01, 0x01, 0x11, 0x00
  );
  // SOS + entropy data containing a fake marker + EOI
  bytes.push(0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00);
  bytes.push(0x12, 0x34, 0xff, 0xd8, 0x56, 0x78); // decoy bytes in entropy stream
  bytes.push(0xff, 0xd9); // EOI
  return new Uint8Array(bytes);
}

describe("JPEG size parser", () => {
  it("reads dimensions from SOF0", () => {
    const size = parseJpegSize(buildJpeg(4000, 2500));
    expect(size).toEqual({ width: 4000, height: 2500 });
  });

  it("skips APPn segments (EXIF thumbnails) before SOF", () => {
    const size = parseJpegSize(buildJpeg(1920, 1080, true));
    expect(size).toEqual({ width: 1920, height: 1080 });
  });

  it("returns null for non-JPEG data", () => {
    expect(parseJpegSize(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
    expect(parseJpegSize(new Uint8Array([]))).toBeNull();
  });
});

/** Builds a minimal little-endian TIFF IFD0 as used by Sony ARW. */
function buildArw(width: number, height: number): Uint8Array {
  const buf: number[] = [];
  // Header: II, 42, IFD0 offset = 8
  buf.push(0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00);
  // IFD0: 2 entries
  buf.push(0x02, 0x00);
  // Entry 1: tag 0x0100 (ImageWidth), type 4 (LONG), count 1, value
  buf.push(0x00, 0x01, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00,
    width & 0xff, (width >> 8) & 0xff, (width >> 16) & 0xff, (width >> 24) & 0xff);
  // Entry 2: tag 0x0101 (ImageLength), type 4, count 1, value
  buf.push(0x01, 0x01, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00,
    height & 0xff, (height >> 8) & 0xff, (height >> 16) & 0xff, (height >> 24) & 0xff);
  // Next IFD offset = 0
  buf.push(0x00, 0x00, 0x00, 0x00);
  return new Uint8Array(buf);
}

describe("Sony ARW (TIFF IFD) size parser", () => {
  it("reads full-size dimensions from IFD0", () => {
    expect(parseArwSize(buildArw(6000, 4000))).toEqual({ width: 6000, height: 4000 });
    expect(parseArwSize(buildArw(4000, 6000))).toEqual({ width: 4000, height: 6000 });
  });

  it("handles SHORT-typed values", () => {
    // Both entries as type 3 (SHORT), count 1, value inline in the first
    // 2 bytes of the 4-byte value field.
    const buf: number[] = [0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x02, 0x00];
    buf.push(0x00, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x20, 0x03, 0x00, 0x00); // width 800
    buf.push(0x01, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0xc0, 0x02, 0x00, 0x00); // height 704
    buf.push(0x00, 0x00, 0x00, 0x00);
    expect(parseArwSize(new Uint8Array(buf))).toEqual({ width: 800, height: 704 });
  });

  it("returns null for non-TIFF data", () => {
    expect(parseArwSize(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBeNull();
    expect(parseArwSize(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});
