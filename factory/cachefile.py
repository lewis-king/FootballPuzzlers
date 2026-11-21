"""Cache files that survive a crash: writes are atomic, and a damaged file reads as a miss."""
import json
import os
import pathlib


def read_json(path):
    """The cached value, or None if the file is missing or unreadable (e.g. cut short by a crash)."""
    path = pathlib.Path(path)
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError, UnicodeDecodeError):
        return None


def write_json(path, obj, **kw):
    """Write to a temp file then rename, so a crash never leaves half a file behind."""
    path = pathlib.Path(path)
    tmp = path.with_name(path.name + '.tmp')
    tmp.write_text(json.dumps(obj, ensure_ascii=False, **kw))
    os.replace(tmp, path)
