#!/usr/bin/env python3
"""Local server for a proposal directory: static files + save + export.

Usage:
    python3 serve.py <proposal-dir> [--port 8765]

Endpoints (localhost only):
    GET  /api/version?path=proposal.html   -> {"hash": sha1 of file}
    POST /api/save   {path, html, base}    -> replaces the region between
         <!-- DOC:START --> and <!-- DOC:END -->; 409 if file changed since `base`
    POST /api/export {path, format}        -> runs export.py; {"outputs": [...]}

Everything else is served as static files with caching disabled, so the
browser always sees Claude's latest edits.
"""

import argparse
import hashlib
import json
import re
import subprocess
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

HERE = Path(__file__).resolve().parent
MARK = re.compile(r"(<!-- DOC:START -->)(.*?)(<!-- DOC:END -->)", re.S)


def sha(p: Path) -> str:
    return hashlib.sha1(p.read_bytes()).hexdigest()


class Handler(SimpleHTTPRequestHandler):
    root: Path

    def log_message(self, fmt, *args):  # quiet static noise, keep API calls
        first = str(args[0]) if args else ""  # log_error passes non-str args (e.g. HTTPStatus)
        if "/api/" in first and "/api/version" not in first:
            sys.stderr.write("%s\n" % (fmt % args))

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _resolve(self, rel: str) -> Path | None:
        p = (self.root / rel).resolve()
        if self.root not in p.parents and p != self.root:
            return None
        return p

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/api/version":
            p = self._resolve(parse_qs(u.query).get("path", [""])[0])
            if not p or not p.is_file():
                return self._json(404, {"error": "no such file"})
            return self._json(200, {"hash": sha(p)})
        if u.path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
            return
        if u.path == "/":
            self.send_response(302)
            self.send_header("Location", "/proposal.html")
            self.end_headers()
            return
        return super().do_GET()

    def do_POST(self):
        u = urlparse(self.path)
        try:
            data = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        except json.JSONDecodeError:
            return self._json(400, {"error": "bad json"})
        p = self._resolve(data.get("path", ""))
        if not p or not p.is_file() or p.suffix != ".html":
            return self._json(404, {"error": "no such html file"})

        if u.path == "/api/save":
            cur = sha(p)
            if data.get("base") and data["base"] != cur:
                return self._json(409, {"error": "changed on disk", "hash": cur})
            text = p.read_text()
            if not MARK.search(text):
                return self._json(422, {"error": "DOC:START/DOC:END markers missing"})
            new = MARK.sub(lambda m: m.group(1) + data["html"] + m.group(3), text, count=1)
            p.write_text(new)
            return self._json(200, {"hash": sha(p)})

        if u.path == "/api/export":
            fmt = data.get("format", "docx")
            r = subprocess.run([sys.executable, str(HERE / "export.py"), str(p), "--format", fmt, "--json"],
                               capture_output=True, text=True)
            if r.returncode != 0:
                return self._json(500, {"error": (r.stderr or r.stdout)[-800:]})
            out = json.loads(r.stdout.strip().splitlines()[-1])
            rel = [str(Path(o).resolve().relative_to(self.root)) for o in out["outputs"]]
            return self._json(200, {"outputs": rel})

        return self._json(404, {"error": "unknown endpoint"})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("--port", type=int, default=8765)
    a = ap.parse_args()
    root = Path(a.dir).expanduser().resolve()
    Handler.root = root

    def handler(*args, **kw):
        return Handler(*args, directory=str(root), **kw)

    for port in range(a.port, a.port + 20):
        try:
            srv = ThreadingHTTPServer(("127.0.0.1", port), handler)
            break
        except OSError:
            continue
    else:
        sys.exit("no free port")
    print(f"serving {root} at http://127.0.0.1:{port}/proposal.html", flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
