/**
 * Minimal JPEG dimension parser (no native dependencies).
 * Walks JPEG markers and reads the first Start-Of-Frame (SOFn) segment.
 */
export interface JpegSize {
  width: number;
  height: number;
}

const SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

/** Markers with a 2-byte length field that we skip over. */
const SKIP_WITH_LENGTH = new Set([
  0xe0, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xeb, 0xec, 0xed, 0xee, 0xef, // APPn
  0xdb, 0xdd, 0xfe, 0xc4, 0xcc, 0xda, // DQT, DRI, COM, DHT, DAC, SOS
]);

export function parseJpegSize(buf: Uint8Array): JpegSize | null {
  // JPEG marker walk: find the first SOFn (Start-of-Frame) segment.
  // We resync to 0xFF before each marker and skip through
  // entropy-coded data after SOS by resynchronizing on 0xFF bytes.
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;

  let i = 2;
  let sawSos = false;

  while (i + 1 < buf.length) {
    // Resync to a marker byte (skip entropy/stuffed 0xFF 0x00 after SOS).
    while (i < buf.length && buf[i] !== 0xff) i += 1;
    if (i + 1 >= buf.length) return null;

    const marker = buf[i + 1];

    // Padding: FF FF
    if (marker === 0xff) {
      i += 1;
      continue;
    }

    // Standalone markers (no length field).
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }

    // End of image before we found a SOF.
    if (marker === 0xd9) return null;

    // SOFn: read height/width.
    if (SOF_MARKERS.has(marker)) {
      if (i + 9 > buf.length) return null;
      const height = (buf[i + 5] << 8) | buf[i + 6];
      const width = (buf[i + 7] << 8) | buf[i + 8];
      if (width > 0 && height > 0) return { width, height };
      return null;
    }

    // Marker with a 2-byte length field.
    if (i + 4 > buf.length) return null;
    const length = (buf[i + 2] << 8) | buf[i + 3];
    if (length < 2) return null;

    if (marker === 0xda) sawSos = true;

    // Advance past the marker + length field.
    i += 2 + length;

    // After SOS, the compressed data is a stream of bytes where markers are
    // delimited by 0xFF. Stuffed 0xFF 0x00 bytes must be treated as a single
    // 0xFF. We rescan from the current position to find the next marker.
    if (sawSos) {
      // Stay at current position; the outer loop will resync to next 0xFF.
      continue;
    }
  }

  return null;
}
