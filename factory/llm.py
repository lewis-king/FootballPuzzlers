"""Local LLM calls through Ollama, with JSON-schema constrained output."""
import json
import pathlib
import subprocess
import sys
import time
import urllib.error
import urllib.request

OLLAMA = 'http://localhost:11434/api/chat'
WRITER = 'gemma4:31b'
CHECKER = 'qwen3.8:27b'
NEED_GB = {WRITER: 24, CHECKER: 22}  # weights + 32k context, measured on the 5090
_loaded = set()


def free_vram_gb():
    out = subprocess.run(['nvidia-smi', '--query-gpu=memory.free', '--format=csv,noheader,nounits'],
                         capture_output=True, text=True).stdout
    return int(out.split()[0]) / 1024


def resident():
    """Models Ollama already has loaded (e.g. left over from a crashed run)."""
    with urllib.request.urlopen('http://localhost:11434/api/ps', timeout=10) as r:
        return {m['name'] for m in json.load(r)['models']}


def wait_for_gpu(model, poll=60):
    """The GPU is shared (ComfyUI, other jobs). Wait for room rather than crash or evict someone."""
    if model in _loaded or model in resident():
        _loaded.add(model)
        return
    need, waited = NEED_GB.get(model, 24), 0
    while (free := free_vram_gb()) < need:
        if waited % 600 == 0:
            print(f'[llm] waiting for GPU: {free:.1f} GB free, {model} needs {need} GB', file=sys.stderr, flush=True)
        time.sleep(poll)
        waited += poll
    _loaded.add(model)


class BadOutput(Exception):
    pass


BAD_DIR = pathlib.Path(__file__).parent / 'cache' / 'bad-output'


def chat_json(model, system, user, schema, temperature=0.4, num_ctx=16384, max_tokens=2500, tries=3):
    """Schema-constrained chat. Keep num_ctx the same for every call to a model: Ollama reloads the
    model whenever it changes, which once made an eval run several times slower.
    Schema-constrained chat. Output is capped (a runaway answer once ran to 25k chars) and
    retried with a fresh sample if it isn't valid JSON; failures are kept in cache/bad-output."""
    wait_for_gpu(model)
    for attempt in range(tries):
        body = {
            'model': model,
            'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': user}],
            'format': schema,
            'stream': False,
            'think': False,
            'keep_alive': '30m',   # stay resident through a batch
            'options': {'temperature': temperature if attempt == 0 else max(temperature, 0.3 * attempt), 'num_ctx': num_ctx, 'num_predict': max_tokens,
                        'repeat_penalty': 1.1, 'seed': int(time.time()) + attempt},
        }
        req = urllib.request.Request(OLLAMA, data=json.dumps(body).encode(),
                                     headers={'Content-Type': 'application/json'})
        text = _post_until_ok(req, model)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            BAD_DIR.mkdir(parents=True, exist_ok=True)
            (BAD_DIR / f'{model.replace(":", "_")}-{int(time.time())}.txt').write_text(text)
            print(f'[llm] {model} gave invalid JSON ({len(text)} chars), retry {attempt + 1}/{tries}',
                  file=sys.stderr, flush=True)
    raise BadOutput(f'{model}: no valid JSON after {tries} tries')


def _post_until_ok(req, model, max_waits=12):
    """Ollama answers 500 when the model can't be (re)loaded, usually because another GPU job
    (ComfyUI) took the memory. Wait for room and retry instead of losing a long run."""
    for n in range(max_waits):
        try:
            with urllib.request.urlopen(req, timeout=900) as r:
                return json.load(r)['message']['content']
        except urllib.error.HTTPError as e:
            if e.code != 500 or n == max_waits - 1:
                raise
            print(f'[llm] Ollama 500 ({e.read()[:200]!r}); waiting for GPU then retrying', file=sys.stderr, flush=True)
            _loaded.discard(model)
            time.sleep(30)
            wait_for_gpu(model)


def unload(model):
    """Free VRAM so the next model fits: the writer and checker don't fit on the GPU together."""
    body = json.dumps({'model': model, 'keep_alive': 0}).encode()
    req = urllib.request.Request('http://localhost:11434/api/generate', data=body,
                                 headers={'Content-Type': 'application/json'})
    urllib.request.urlopen(req, timeout=120).read()
    _loaded.discard(model)
