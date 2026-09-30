#!/usr/bin/env python3
"""Export a proposal (or research note) HTML to docx / pdf / md / standalone html.

Usage:
    python3 export.py <dir>/proposal.html [--format docx|pdf|md|html|all] [--out DIR] [--keep-notes]

What happens:
  1. The editable region (<main id="doc">) is cleaned: template hints (.hint),
     notes (.note, unless --keep-notes) and .no-export elements are removed.
  2. Each <figure> SVG is rendered to a 2x PNG with headless Chrome in the light
     theme, so CSS-variable colors, fonts and emoji come out exactly as on screen.
  3. html: one self-contained file (CSS inlined, SVGs kept as vector, no editor).
     pdf:  Chrome prints the standalone html (vector figures, print CSS).
     docx: pandoc from an <img> version of the html (Word / Google Docs import).
     md:   pandoc gfm with figs/*.png.

Google Docs: upload the .docx to Drive with conversion (Claude can do this with
the Google Drive connector: create_file, base64 docx, contentMimeType
application/vnd.openxmlformats-officedocument.wordprocessingml.document).

Requires: Google Chrome, pandoc (docx/md), beautifulsoup4.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from bs4 import BeautifulSoup

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
]


def find_chrome():
    for c in CHROME_CANDIDATES:
        if os.path.isfile(c):
            return c
        w = shutil.which(c)
        if w:
            return w
    sys.exit("Chrome/Chromium not found (needed to render figures and PDF)")


def chrome(args, cwd=None):
    base = [find_chrome(), "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--no-first-run", "--no-default-browser-check", "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=2000"]
    r = subprocess.run(base + args, capture_output=True, text=True, cwd=cwd)
    if r.returncode != 0:
        sys.stderr.write(r.stderr)
    return r


def svg_size(svg, width=820):
    vb = svg.get("viewBox") or svg.get("viewbox")
    if vb:
        _, _, w, h = [float(x) for x in re.split(r"[ ,]+", vb.strip())]
        return width, round(width * h / w)
    return width, round(width * 0.4)


def clean_doc(soup, keep_notes):
    doc = soup.find("main", id="doc")
    if doc is None:
        sys.exit("no <main id='doc'> found")
    kill = [".hint", ".no-export"] + ([] if keep_notes else [".note"])
    for sel in kill:
        for el in doc.select(sel):
            if el.name in ("td", "th"):
                el.clear()  # keep table shape
                el["class"] = [c for c in el.get("class", []) if c != "hint"]
            else:
                el.decompose()
    for el in doc.select("[contenteditable]"):
        del el["contenteditable"]
    # drop TL;DR lines / callouts whose only text left is their bold label
    for el in doc.select(".tldr p, .callout"):
        label = el.find("b")
        rest = el.get_text(strip=True)[len(label.get_text(strip=True)) if label else 0:]
        if not rest.strip():
            el.decompose()
    for el in doc.select(".tldr"):
        if not el.get_text(strip=True):
            el.decompose()
    return doc


def standalone_html(title, css, doc_html):
    return f"""<!doctype html>
<html lang="en" data-theme="light"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title><style>{css}
body {{ max-width: 860px; margin: 0 auto; padding: 32px 20px 80px; }}
</style></head>
<body><main id="doc">{doc_html}</main>
<div id="pp-tip"></div>
<script>/* hover tips for [data-tip] */
const t=document.getElementById('pp-tip');
document.addEventListener('mouseover',e=>{{const x=e.target.closest&&e.target.closest('[data-tip]');if(!x){{t.style.display='none';return}}t.textContent=x.getAttribute('data-tip');t.style.display='block'}});
document.addEventListener('mousemove',e=>{{t.style.left=Math.min(e.clientX+14,innerWidth-340)+'px';t.style.top=e.clientY+14+'px'}});
</script></body></html>"""


def render_figures(doc, css, figdir: Path):
    """Screenshot each figure's SVG to figs/<id>.png. Returns {figure-index: png path}."""
    figdir.mkdir(parents=True, exist_ok=True)
    out = {}
    with tempfile.TemporaryDirectory() as tmp:
        for i, fig in enumerate(doc.find_all("figure"), 1):
            svg = fig.find("svg")
            if svg is None:
                continue
            w, h = svg_size(svg)
            name = (fig.get("id") or f"fig-{i}") + ".png"
            page = Path(tmp) / f"f{i}.html"
            page.write_text(f"""<!doctype html><html data-theme="light"><head><meta charset="utf-8">
<style>{css}
html,body{{margin:0;padding:0;background:#fff}}
svg{{display:block;width:{w}px;height:{h}px;font-family:var(--font)}}</style></head>
<body>{svg}</body></html>""")
            png = figdir / name
            chrome([f"--screenshot={png}", f"--window-size={w},{h}", "--force-device-scale-factor=2",
                    "--default-background-color=ffffffff", page.as_uri()])
            if png.exists():
                out[i] = png
            else:
                sys.stderr.write(f"figure {i}: render failed\n")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--format", default="all", choices=["docx", "pdf", "md", "html", "all"])
    ap.add_argument("--out", help="output dir (default: <dir>/export)")
    ap.add_argument("--keep-notes", action="store_true")
    ap.add_argument("--json", action="store_true", help="print a JSON line with outputs (for serve.py)")
    a = ap.parse_args()

    src = Path(a.html).resolve()
    outdir = Path(a.out).resolve() if a.out else src.parent / "export"
    outdir.mkdir(parents=True, exist_ok=True)
    stem = src.stem

    soup = BeautifulSoup(src.read_text(), "html.parser")
    title = soup.title.get_text() if soup.title else stem
    css_link = soup.find("link", rel="stylesheet")
    css = (src.parent / css_link["href"]).read_text() if css_link else ""
    doc = clean_doc(soup, a.keep_notes)
    fmts = ["html", "pdf", "docx", "md"] if a.format == "all" else [a.format]
    outputs = []

    # standalone html (vector figures); also the source for pdf
    std = outdir / f"{stem}.html"
    std.write_text(standalone_html(title, css, doc.decode_contents()))
    if "html" in fmts:
        outputs.append(std)

    if "pdf" in fmts:
        pdf = outdir / f"{stem}.pdf"
        chrome([f"--print-to-pdf={pdf}", "--no-pdf-header-footer", std.as_uri()])
        if not pdf.exists():
            sys.exit("pdf export failed")
        outputs.append(pdf)

    if "docx" in fmts or "md" in fmts:
        if not shutil.which("pandoc"):
            sys.exit("pandoc not found (brew install pandoc)")
        pngs = render_figures(doc, css, outdir / "figs")
        for i, fig in enumerate(doc.find_all("figure"), 1):
            svg = fig.find("svg")
            if svg is not None and i in pngs:
                img = soup.new_tag("img", src=f"figs/{pngs[i].name}")
                cap = fig.find("figcaption")
                img["alt"] = cap.get_text(" ", strip=True) if cap else ""
                svg.replace_with(img)
        # pandoc cannot read CSS classes as styles; callouts become block quotes so they stay visually distinct
        for c in doc.select(".callout, .tldr"):
            c.name = "blockquote"
        img_html = outdir / f".{stem}.pandoc.html"
        img_html.write_text(f"<html><head><title>{title}</title></head><body>{doc.decode_contents()}</body></html>")
        if "docx" in fmts:
            docx = outdir / f"{stem}.docx"
            ref = Path(__file__).resolve().parent.parent / "assets" / "reference.docx"
            cmd = ["pandoc", str(img_html), "-f", "html", "-t", "docx", "-o", str(docx), f"--resource-path={outdir}"]
            if ref.exists():
                cmd.append(f"--reference-doc={ref}")
            subprocess.run(cmd, check=True)
            outputs.append(docx)
        if "md" in fmts:
            md = outdir / f"{stem}.md"
            subprocess.run(["pandoc", str(img_html), "-f", "html", "-t", "gfm-raw_html", "-o", str(md), "--wrap=none"], check=True)
            outputs.append(md)
        img_html.unlink()

    for o in outputs:
        print(f"wrote {o}", file=sys.stderr)
    if a.json:
        print(json.dumps({"outputs": [str(o) for o in outputs]}))


if __name__ == "__main__":
    main()
