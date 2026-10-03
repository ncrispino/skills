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


def fill_budget(doc):
    """Compute the live budget cells the editor fills in the browser.

    data-cost / data-sum / data-verdict are empty in the saved HTML, so without
    this every export loses the budget numbers.
    """
    def num(t):
        t = re.sub(r"[^0-9.\-eE]", "", t or "")
        try:
            return float(t)
        except ValueError:
            return 0.0

    def fmt(v):
        return f"{round(v):,}" if abs(v) >= 100 else str(round(v, 2))

    for table in doc.select("table.budget"):
        total = 0.0
        for row in table.select("tbody tr"):
            muls = row.select("td[data-mul]")
            if not muls:
                continue
            v = 1.0
            for c in muls:
                v *= num(c.get_text())
            out = row.select_one("td[data-cost]")
            if out:
                out.string = fmt(v)
            total += v
        s_cell = table.select_one("[data-sum]")
        if s_cell:
            s_cell.string = fmt(total)
        budget = num(table.get("data-budget", "0"))
        unit = table.get("data-unit", "")
        holder = table.parent if table.parent else doc
        v_cell = holder.select_one("[data-verdict]") or doc.select_one("[data-verdict]")
        if v_cell is not None and budget > 0:
            r = total / budget
            word = ("fits with headroom" if r <= 0.7 else
                    "fits, no slack for reruns" if r <= 1 else
                    "over budget: cut conditions or seeds")
            v_cell.string = f"{fmt(total)} of {fmt(budget)} {unit} ({round(r * 100)}%) — {word}"


def flatten_tables(doc):
    """pandoc's gfm writer emits a bare [TABLE] for tables it cannot represent,
    which silently loses them. Move tfoot rows into tbody and expand colspan in
    place, so a spanning label keeps its own column and the value stays last."""
    for table in doc.find_all("table"):
        body = table.find("tbody")
        for foot in table.find_all("tfoot"):
            for row in foot.find_all("tr"):
                (body or table).append(row.extract())
            foot.decompose()
        for row in table.find_all("tr"):
            for c in row.find_all(["td", "th"]):
                span = int(c.get("colspan") or 1)
                if c.has_attr("colspan"):
                    del c["colspan"]
                for _ in range(span - 1):
                    c.insert_after(doc_soup_new_tag(c, "td"))
                if c.has_attr("rowspan"):
                    del c["rowspan"]
        width = max((len(r.find_all(["td", "th"])) for r in table.find_all("tr")), default=0)
        for row in table.find_all("tr"):
            for _ in range(width - len(row.find_all(["td", "th"]))):
                row.append(doc_soup_new_tag(row, "td"))


def doc_soup_new_tag(node, name):
    from bs4 import BeautifulSoup as _BS
    return _BS(f"<{name}></{name}>", "html.parser").find(name)


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
    # margin comments: drop the comment, keep the text (kept as a highlight with --keep-notes)
    if not keep_notes:
        for m in doc.select("mark.cmt"):
            m.unwrap()
    # collapsed <details class="more"> blocks export expanded, as a bold lead-in + content
    for d in doc.select("details"):
        sm = d.find("summary", recursive=False)
        if sm is not None:
            p = doc_soup_new_tag(d, "p"); b = doc_soup_new_tag(d, "b")
            b.string = sm.get_text(" ", strip=True); p.append(b); sm.replace_with(p)
        d.name = "div"; d.attrs = {"class": ["more"]}
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
    fill_budget(doc)
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
    # clear first: a figure deleted from the doc would otherwise linger here and
    # get copied along as if it were current
    if figdir.exists():
        for f in figdir.glob("*.png"):
            f.unlink()
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
        flatten_tables(doc)
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
