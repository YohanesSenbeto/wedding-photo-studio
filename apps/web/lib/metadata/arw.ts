/**
 * Minimal TIFF/IFD dimension parser for Sony ARW files.
 * ARW is TIFF-based: IFD0 usually carries ImageWidth (0x0100) and
 * ImageLength/Height (0x0101) as LONG or SHORT entries.
 */
export interface RawSize {
  width: number;
  height: number;
}

export function parseArwSize(buf: Uint8Array): RawSize | null {
  if (buf.length < 8) return null;
  const le = buf[0] === 0x49 && buf[1] === 0x49; // "II"
  const be = buf[0] === 0x4d && buf[1] === 0x4d; // "MM"
  if (!le && !be) return null;
  if (buf[2] !== 0x2a || buf[3] !== 0x00) return null;

  const u16 = (o: number) => (le ? buf[o] | (buf[o + 1] << 8) : (buf[o] << 8) | buf[o + 1]);
  const u32 = (o: number) =>
    le
      ? (buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16) | (buf[o + 3] << 24)) >>> 0
      : ((buf[o] << 24) | (buf[o + 1] << 16) | (buf[o + 2] << 8) | buf[o + 3]) >>> 0;

  const ifd0 = u32(4);
  if (ifd0 + 2 > buf.length) return null;
  const count = u16(ifd0);
  if (count > 512) return null; // sanity

  let width: number | null = null;
  let height: number | null = null;

  for (let e = 0; e < count; e++) {
    const off = ifd0 + 2 + e * 12;
    if (off + 12 > buf.length) return null;
    const tag = u16(off);
    if (tag !== 0x0100 && tag !== 0x0101) continue;
    const type = u16(off + 2);
    const num = u32(off + 4);
    let value: number;
    if (type === 3 && num === 1) {
      // SHORT inline (value stored in first 2 bytes of the value field)
      value = u16(off + 8);
    } else if (type === 4 && num === 1) {
      value = u32(off + 8);
    } else {
      continue; // offset-based or unexpected — not supported by this parser
    }
    if (tag === 0x0100) width = value;
    else height = value;
    if (width !== null && height !== null) {
      return { width, height };
    }
  }
  return null;
}
