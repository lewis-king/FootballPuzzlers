#!/usr/bin/env python3
"""The questions auditor: a click-through review of proposed question changes.

    python3 tools/question-auditor/auditor.py            # then open http://localhost:8790

Reviews live in tools/question-auditor/reviews/<name>.json (made by extract_audit.py, or by the
factory for a new pack). Every decision is saved straight away to <name>.decisions.json next to it,
so you can stop and come back. When you're done, apply.py writes the approved and edited ones into
config/baseQuestions.json. Standard library only; it listens on localhost.
"""
import json
import os
import pathlib
import re
import sys
import tempfile
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = pathlib.Path(__file__).resolve().parent
REVIEWS = HERE / 'reviews'
PORT = int(os.environ.get('PORT', 8790))
NAME = re.compile(r'^[\w.-]+$')


def load(path, default):
    return json.loads(path.read_text()) if path.exists() else default


def save(path, data):
    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix='.tmp')
    with os.fdopen(fd, 'w') as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
        f.write('\n')
    os.replace(tmp, path)


class Handler(BaseHTTPRequestHandler):
    def send(self, code, body, kind='application/json'):
        data = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('content-type', kind)
        self.send_header('cache-control', 'no-store')
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass

    def do_GET(self):
        if self.path in ('/', '/index.html'):
            return self.send(200, (HERE / 'index.html').read_bytes(), 'text/html; charset=utf-8')
        if self.path == '/api/reviews':
            out = []
            for f in sorted(REVIEWS.glob('*.json')):
                if f.name.endswith('.decisions.json'):
                    continue
                r = load(f, {})
                d = load(f.with_suffix('.decisions.json'), {})
                out.append({'name': f.stem, 'title': r.get('title', f.stem), 'items': len(r.get('items', [])), 'decided': len(d)})
            return self.send(200, out)
        m = re.match(r'^/api/review/([\w.-]+)$', self.path)
        if m:
            f = REVIEWS / f'{m[1]}.json'
            if not f.exists():
                return self.send(404, {'error': 'no such review'})
            return self.send(200, {'review': load(f, {}), 'decisions': load(f.with_suffix('.decisions.json'), {})})
        self.send(404, {'error': 'not found'})

    def do_POST(self):
        m = re.match(r'^/api/decision/([\w.-]+)$', self.path)
        if not m or not (REVIEWS / f'{m[1]}.json').exists():
            return self.send(404, {'error': 'not found'})
        body = json.loads(self.rfile.read(int(self.headers.get('content-length', 0))) or b'{}')
        key, status = body.get('key'), body.get('status')
        path = REVIEWS / f'{m[1]}.decisions.json'
        decisions = load(path, {})
        if status == 'undo':
            decisions.pop(key, None)
        elif status in ('approved', 'edited', 'rejected') and isinstance(key, str):
            entry = {'status': status, 'at': time.strftime('%Y-%m-%dT%H:%M:%S')}
            for k in ('question', 'answers', 'clues', 'note'):
                if k in body:
                    entry[k] = body[k]
            decisions[key] = entry
        else:
            return self.send(400, {'error': 'bad decision'})
        save(path, decisions)
        self.send(200, {'ok': True, 'decided': len(decisions)})


if __name__ == '__main__':
    REVIEWS.mkdir(exist_ok=True)
    print(f'Questions auditor: http://localhost:{PORT}  (Ctrl+C to stop)')
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
