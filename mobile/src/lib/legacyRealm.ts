/**
 * Read player progress out of the 2019 app's Realm file (realm-js 2.20, core 5, file format 9)
 * without the Realm library. A port of tools/realm-legacy/read_legacy.py, tested against the same
 * fixture. Read-only: it never writes to the old file.
 */

export type LegacyProgress = {
  answeredIds: number[];
  /** question id -> clue keys the player revealed, e.g. { FWD: 'True', ENG: 'True' } */
  selectedClues: Record<string, Record<string, string>>;
  purchased: string[];
  questionCount: number;
};

type Header = { inner: boolean; hasRefs: boolean; width: number; size: number; contextFlag: boolean };

export function readLegacyRealm(buf: Uint8Array): LegacyProgress {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  const header = (ref: number): Header => {
    if (buf[ref] !== 0x41 || buf[ref + 1] !== 0x41 || buf[ref + 2] !== 0x41 || buf[ref + 3] !== 0x41) {
      throw new Error(`no array header at ${ref}`);
    }
    const flags = buf[ref + 4];
    return {
      inner: !!(flags & 0x80),
      hasRefs: !!(flags & 0x40),
      contextFlag: !!(flags & 0x20),
      width: (1 << (flags & 0x07)) >> 1,
      size: (buf[ref + 5] << 16) | (buf[ref + 6] << 8) | buf[ref + 7],
    };
  };

  const ints = (ref: number): number[] => {
    const { width: w, size: n } = header(ref);
    const base = ref + 8;
    const out: number[] = new Array(n);
    if (w === 0) return out.fill(0);
    if (w < 8) {
      const per = 8 / w;
      const mask = (1 << w) - 1;
      for (let i = 0; i < n; i++) out[i] = (buf[base + Math.floor(i / per)] >> ((i % per) * w)) & mask;
      return out;
    }
    for (let i = 0; i < n; i++) {
      const at = base + i * (w / 8);
      if (w === 8) out[i] = view.getInt8(at);
      else if (w === 16) out[i] = view.getInt16(at, true);
      else if (w === 32) out[i] = view.getInt32(at, true);
      else out[i] = Number(view.getBigInt64(at, true));
    }
    return out;
  };

  const utf8 = (from: number, to: number) => new TextDecoder('utf-8').decode(buf.subarray(from, to));

  const strings = (ref: number): (string | null)[] => {
    const h = header(ref);
    if (h.hasRefs) return h.contextFlag ? bigStrings(ref) : longStrings(ref);
    const { width: w, size: n } = h;
    const base = ref + 8;
    if (w === 0) return new Array(n).fill('');
    const out: (string | null)[] = [];
    for (let i = 0; i < n; i++) {
      const start = base + i * w;
      const pad = buf[start + w - 1];
      out.push(pad === w ? null : utf8(start, start + w - 1 - pad));
    }
    return out;
  };

  const longStrings = (ref: number): string[] => {
    const [offsetsRef, blobRef] = ints(ref);
    const blobStart = blobRef + 8;
    let prev = 0;
    return ints(offsetsRef).map((end) => {
      const s = utf8(blobStart + prev, blobStart + end - 1);
      prev = end;
      return s;
    });
  };

  const bigStrings = (ref: number): (string | null)[] =>
    ints(ref).map((blob) => {
      if (blob === 0) return null;
      let end = blob + 8 + header(blob).size;
      while (end > blob + 8 && buf[end - 1] === 0) end--;
      return utf8(blob + 8, end);
    });

  const leaves = (ref: number): number[] => {
    if (!header(ref).inner) return [ref];
    return ints(ref).slice(1, -1).flatMap(leaves);
  };
  const columnInts = (ref: number) => leaves(ref).flatMap(ints);
  const columnStrings = (ref: number) => leaves(ref).flatMap(strings);

  const topRef = Number(view.getBigUint64((buf[23] & 1) * 8, true));
  const group = ints(topRef);
  const tableNames = strings(group[0]);
  const tableRefs = ints(group[1]);

  const COLUMN_INT = 0, COLUMN_BOOL = 1, COLUMN_STRING = 2, COLUMN_LINK = 12, INDEXED = 1;

  const readTable = (name: string): Record<string, any>[] => {
    const at = tableNames.indexOf(name);
    if (at < 0) return [];
    const top = ints(tableRefs[at]);
    const spec = ints(top[0]);
    const types = ints(spec[0]), names = strings(spec[1]), attrs = ints(spec[2]);
    const colRefs = ints(top[1]);
    const cols: Record<string, (number | string | null)[]> = {};
    let slot = 0;
    types.forEach((t, i) => {
      const ref = colRefs[slot];
      const n = names[i] as string;
      if (t === COLUMN_STRING) cols[n] = columnStrings(ref);
      else if (t === COLUMN_INT || t === COLUMN_BOOL || t === COLUMN_LINK) cols[n] = columnInts(ref);
      slot += attrs[i] & INDEXED ? 2 : 1; // a search index occupies the next slot
    });
    const keys = Object.keys(cols);
    const rows = keys.length ? cols[keys[0]].length : 0;
    return Array.from({ length: rows }, (_, r) => Object.fromEntries(keys.map((k) => [k, cols[k][r]])));
  };

  const questions = readTable('class_Question');
  const selected = readTable('class_SelectedClues');
  const products = readTable('class_Product');

  const progress: LegacyProgress = {
    answeredIds: questions.filter((q) => q.answered).map((q) => q.id).sort((a, b) => a - b),
    selectedClues: {},
    purchased: products.filter((p) => p.purchased).map((p) => p.productId),
    questionCount: questions.length,
  };
  for (const q of questions) {
    const link = q.selectedClues; // row index + 1, 0 = null
    if (!link) continue;
    const chosen = Object.fromEntries(
      Object.entries(selected[link - 1] ?? {}).filter(([, v]) => typeof v === 'string' && v),
    ) as Record<string, string>;
    if (Object.keys(chosen).length) progress.selectedClues[String(q.id)] = chosen;
  }
  return progress;
}
