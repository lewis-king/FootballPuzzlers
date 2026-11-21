"""Spike: read progress out of a 2019 Football Who Am I Realm file (core 5, file format 9)
without the Realm library. Proves the format can be decoded before porting to TypeScript.

Usage: python3 read_legacy.py <file.realm>
"""
import json
import struct
import sys

buf = open(sys.argv[1], 'rb').read()


def header(ref):
    if buf[ref:ref + 4] != b'AAAA':
        raise ValueError(f'no array header at {ref}')
    flags = buf[ref + 4]
    size = int.from_bytes(buf[ref + 5:ref + 8], 'big')
    return {
        'inner': bool(flags & 0x80),
        'has_refs': bool(flags & 0x40),
        'wtype': (flags & 0x18) >> 3,
        'width': (1 << (flags & 0x07)) >> 1,
        'size': size,
    }


def ints(ref):
    h = header(ref)
    w, n, base = h['width'], h['size'], ref + 8
    if w == 0:
        return [0] * n
    if w < 8:
        per = 8 // w
        mask = (1 << w) - 1
        return [(buf[base + i // per] >> ((i % per) * w)) & mask for i in range(n)]
    fmt = {8: 'b', 16: 'h', 32: 'i', 64: 'q'}[w]
    return list(struct.unpack_from('<' + fmt * n, buf, base))


def strings(ref):
    """Short-string leaf (ArrayString): fixed width per element, last byte = padding count."""
    h = header(ref)
    w, n, base = h['width'], h['size'], ref + 8
    if h['has_refs']:
        return big_strings(ref) if buf[ref + 4] & 0x20 else long_strings(ref)
    if w == 0:
        return [''] * n
    out = []
    for i in range(n):
        cell = buf[base + i * w: base + (i + 1) * w]
        pad = cell[-1]
        out.append(None if pad == w else cell[:w - 1 - pad].decode('utf-8'))
    return out


def long_strings(ref):
    """ArrayStringLong: [offsets, blob(, nulls)]; each string stored with a trailing zero."""
    offsets_ref, blob_ref = ints(ref)[:2]
    offsets = ints(offsets_ref)
    blob_start = blob_ref + 8
    out, prev = [], 0
    for end in offsets:
        out.append(buf[blob_start + prev: blob_start + end - 1].decode('utf-8'))
        prev = end
    return out


def big_strings(ref):
    """ArrayBigBlobs (has_refs + context flag): one blob ref per element, 0 = null."""
    out = []
    for blob in ints(ref):
        if blob == 0:
            out.append(None)
            continue
        n = header(blob)['size']
        out.append(buf[blob + 8: blob + 8 + n].rstrip(b'\0').decode('utf-8'))
    return out


def leaves(ref):
    """Walk a B+tree column and yield leaf refs in order."""
    h = header(ref)
    if not h['inner']:
        yield ref
        return
    children = ints(ref)[1:-1]
    for child in children:
        yield from leaves(child)


def column_ints(ref):
    return [v for leaf in leaves(ref) for v in ints(leaf)]


def column_strings(ref):
    return [v for leaf in leaves(ref) for v in strings(leaf)]


top_ref = struct.unpack_from('<QQ', buf, 0)[buf[23] & 1]
group = ints(top_ref)
table_names = strings(group[0])
table_refs = ints(group[1])

COLUMN_INT, COLUMN_BOOL, COLUMN_STRING, COLUMN_LINK = 0, 1, 2, 12
INDEXED = 1  # col_attr_Indexed


def read_table(name):
    top = ints(table_refs[table_names.index(name)])
    spec = ints(top[0])
    types, names, attrs = ints(spec[0]), strings(spec[1]), ints(spec[2])
    col_refs = ints(top[1])
    cols, slot = {}, 0
    for t, n, a in zip(types, names, attrs):
        ref = col_refs[slot]
        if t == COLUMN_STRING:
            cols[n] = column_strings(ref)
        elif t in (COLUMN_INT, COLUMN_BOOL, COLUMN_LINK):
            cols[n] = column_ints(ref)
        slot += 2 if a & INDEXED else 1  # a search index occupies the next slot
    rows = len(next(iter(cols.values()))) if cols else 0
    return [{k: v[i] for k, v in cols.items()} for i in range(rows)]


questions = read_table('class_Question')
selected = read_table('class_SelectedClues')
products = read_table('class_Product')

progress = {
    'answeredIds': sorted(q['id'] for q in questions if q['answered']),
    'selectedClues': {},
    'purchased': [p['productId'] for p in products if p['purchased']],
    'questionCount': len(questions),
}
for q in questions:
    link = q['selectedClues']  # stored as row index + 1, 0 = null
    if link:
        chosen = {k: v for k, v in selected[link - 1].items() if v}
        if chosen:
            progress['selectedClues'][str(q['id'])] = chosen
# question text/answer let the migration match by content, not just by id
progress['answers'] = {str(q['id']): q['acceptableAnswers'].split(',')[0] for q in questions}
print(json.dumps(progress, indent=1, ensure_ascii=False))
