/**
 * Save code: the whole save packed into text the player copies on one phone and pastes on another.
 * No server, no account. Purchases are not included (they restore from the store).
 *
 * Bytes: version, streak days, streak last day, max id, answered bitset, then the help used per
 * question (one byte = clue mask in the low 6 bits + letters revealed in the top 2), written
 * sparsely (id gaps) or densely (a byte per id), whichever is shorter.
 * A CRC-16 is appended, the bytes are scrambled so the code doesn't show its structure, and the
 * result is written in Crockford base32 (no I, L, O or U, so it survives being read aloud).
 * Guessing a valid code is possible but pointless: the player would only be cheating themselves.
 */

export type SaveData = {
  answered: number[];
  /** question id -> clue bitmask (bit i = CLUE_KEYS[i] revealed) */
  clues: Record<number, number>;
  /** question id -> letters revealed, 0-3 */
  letters: Record<number, number>;
  streak: { days: number; lastDay: number };
};

const VERSION = 1;
const PREFIX = 'WHO';
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export class SaveCodeError extends Error {}

export function encodeSave(save: SaveData): string {
  const out: number[] = [VERSION];
  varint(out, save.streak.days);
  varint(out, save.streak.lastDay);
  const ids = new Set<number>([...save.answered, ...Object.keys(save.clues).map(Number), ...Object.keys(save.letters).map(Number)]);
  const maxId = ids.size ? Math.max(...ids) : 0;
  varint(out, maxId);
  const bits = new Array(Math.ceil(maxId / 8)).fill(0);
  for (const id of save.answered) bits[(id - 1) >> 3] |= 1 << ((id - 1) & 7);
  out.push(...bits);

  const helped = [...ids]
    .map((id) => ({ id, b: ((save.clues[id] ?? 0) & 0x3f) | (Math.min(save.letters[id] ?? 0, 3) << 6) }))
    .filter((h) => h.b)
    .sort((a, b) => a.id - b.id);
  // Help used is written sparsely (id gap + byte) or, for heavy players, as one byte per id.
  const sparse: number[] = [];
  let prev = 0;
  for (const h of helped) {
    varint(sparse, h.id - prev);
    sparse.push(h.b);
    prev = h.id;
  }
  if (sparse.length + 1 <= maxId) {
    out.push(0);
    varint(out, helped.length);
    out.push(...sparse);
  } else {
    out.push(1);
    const dense = new Array(maxId).fill(0);
    for (const h of helped) dense[h.id - 1] = h.b;
    out.push(...dense);
  }
  const crc = crc16(out);
  out.push(crc >> 8, crc & 0xff);
  const text = base32(scramble(out));
  return PREFIX + '-' + text.match(/.{1,4}/g)!.join('-');
}

export function decodeSave(code: string): SaveData {
  const clean = code
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/^WHO/, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
  if (!clean || /[^0-9A-Z]/.test(clean) || /U/.test(clean)) throw new SaveCodeError('That code has letters a save code never uses.');
  const bytes = scramble(unbase32(clean));
  if (bytes.length < 6) throw new SaveCodeError('That code is too short. Check you copied all of it.');
  const body = bytes.slice(0, -2);
  const crc = (bytes[bytes.length - 2] << 8) | bytes[bytes.length - 1];
  if (crc16(body) !== crc) throw new SaveCodeError("That code doesn't check out. Check you copied all of it.");

  let at = 0;
  const read = () => {
    if (at >= body.length) throw new SaveCodeError('That code is incomplete.');
    return body[at++];
  };
  const readVarint = () => {
    let v = 0, shift = 0, b;
    do { b = read(); v += (b & 0x7f) * 2 ** shift; shift += 7; } while (b & 0x80);
    return v;
  };
  if (read() !== VERSION) throw new SaveCodeError('That code is from a newer version of the app. Update the app and try again.');
  const streak = { days: readVarint(), lastDay: readVarint() };
  const maxId = readVarint();
  const answered: number[] = [];
  for (let i = 0; i < Math.ceil(maxId / 8); i++) {
    const byte = read();
    for (let j = 0; j < 8; j++) if (byte & (1 << j)) answered.push(i * 8 + j + 1);
  }
  const clues: Record<number, number> = {};
  const letters: Record<number, number> = {};
  const put = (id: number, b: number) => {
    if (b & 0x3f) clues[id] = b & 0x3f;
    if (b >> 6) letters[id] = b >> 6;
  };
  const mode = read();
  if (mode === 0) {
    let id = 0;
    for (let n = readVarint(); n > 0; n--) {
      id += readVarint();
      put(id, read());
    }
  } else if (mode === 1) {
    for (let id = 1; id <= maxId; id++) put(id, read());
  } else {
    throw new SaveCodeError("That code doesn't check out.");
  }
  if (at !== body.length) throw new SaveCodeError("That code doesn't check out.");
  return { answered, clues, letters, streak };
}

function varint(out: number[], v: number) {
  v = Math.max(0, Math.floor(v));
  while (v >= 0x80) { out.push((v & 0x7f) | 0x80); v = Math.floor(v / 128); }
  out.push(v);
}

function crc16(bytes: number[]): number {
  let crc = 0xffff; // CRC-16/CCITT-FALSE
  for (const b of bytes) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc;
}

/** XOR with a fixed keystream. Its own inverse. Hides structure, not a security measure. */
function scramble(bytes: number[]): number[] {
  let s = 0x5eed1e55;
  return bytes.map((b) => {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    return b ^ (s >>> 24);
  });
}

function base32(bytes: number[]): string {
  let bits = 0, value = 0, out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) { out += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
    value &= (1 << bits) - 1;
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function unbase32(text: string): number[] {
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of text) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) throw new SaveCodeError('That code has letters a save code never uses.');
    value = (value << 5) | v;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
    value &= (1 << bits) - 1;
  }
  return out;
}
