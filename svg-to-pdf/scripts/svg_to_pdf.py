#!/usr/bin/env python3
"""Convert an SVG file to a tightly-cropped PDF using headless Chrome.

Usage:
    python3 svg_to_pdf.py <input.svg> [output.pdf]

If output path is omitted, the PDF is written next to the input with a .pdf extension.

Requirements:
    - Google Chrome installed at /Applications/Google Chrome.app (macOS)
      or available as `google-chrome` / `chromium` on PATH (Linux)
"""

import argparse
import os
import re
import subprocess
import sys
import tempfile


def find_chrome():
    """Locate Chrome binary."""
    candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "google-chrome",
        "chromium",
        "chromium-browser",
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
        # Check PATH
        result = subprocess.run(["which", c], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
    return None


def parse_svg_dimensions(svg_path):
    """Extract viewBox, width, and height from an SVG file."""
    with open(svg_path, "r") as f:
        header = f.read(2000)

    viewbox = None
    width = None
    height = None

    m = re.search(r'viewBox="([^"]+)"', header)
    if m:
        parts = m.group(1).split()
        if len(parts) == 4:
            viewbox = {
                "x": float(parts[0]),
                "y": float(parts[1]),
                "w": float(parts[2]),
                "h": float(parts[3]),
            }

    m = re.search(r'width="([\d.]+)', header)
    if m:
        width = float(m.group(1))

    m = re.search(r'height="([\d.]+)', header)
    if m:
        height = float(m.group(1))

    if viewbox:
        return viewbox["w"], viewbox["h"]
    elif width and height:
        return width, height
    else:
        return 500, 500  # sensible default


def build_wrapper_html(svg_path, page_w, page_h):
    """Create an HTML wrapper that inlines the SVG for tight rendering."""
    with open(svg_path, "r") as f:
        svg_content = f.read()

    # Strip XML declaration
    svg_content = svg_content.replace('<?xml version="1.0" encoding="utf-8"?>', "")

    # Replace fixed width/height with 100% so SVG fills the page
    svg_content = re.sub(
        r'width="[\d.]+px"\s*height="[\d.]+px"',
        'width="100%" height="100%"',
        svg_content,
    )

    html = f"""<!DOCTYPE html>
<html>
<head>
<style>
  @page {{
    size: {page_w}px {page_h}px;
    margin: 0;
  }}
  * {{ margin: 0; padding: 0; }}
  html, body {{
    width: {page_w}px;
    height: {page_h}px;
    overflow: hidden;
  }}
  svg {{
    display: block;
    width: {page_w}px;
    height: {page_h}px;
  }}
</style>
</head>
<body>
{svg_content}
</body>
</html>"""
    return html


def convert(input_svg, output_pdf):
    chrome = find_chrome()
    if not chrome:
        print("Error: Google Chrome not found.", file=sys.stderr)
        sys.exit(1)

    svg_w, svg_h = parse_svg_dimensions(input_svg)

    html_content = build_wrapper_html(input_svg, svg_w, svg_h)

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".html", delete=False
    ) as tmp:
        tmp.write(html_content)
        tmp_path = tmp.name

    try:
        cmd = [
            chrome,
            "--headless=new",
            "--disable-gpu",
            f"--print-to-pdf={output_pdf}",
            "--no-margins",
            "--no-pdf-header-footer",
            tmp_path,
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Chrome error: {result.stderr}", file=sys.stderr)
            sys.exit(1)
        print(f"PDF written to {output_pdf}")
    finally:
        os.unlink(tmp_path)


def main():
    parser = argparse.ArgumentParser(description="Convert SVG to tightly-cropped PDF")
    parser.add_argument("input", help="Input SVG file path")
    parser.add_argument("output", nargs="?", help="Output PDF file path (optional)")
    args = parser.parse_args()

    input_svg = os.path.abspath(args.input)
    if not os.path.isfile(input_svg):
        print(f"Error: {input_svg} not found.", file=sys.stderr)
        sys.exit(1)

    if args.output:
        output_pdf = os.path.abspath(args.output)
    else:
        output_pdf = os.path.splitext(input_svg)[0] + ".pdf"

    convert(input_svg, output_pdf)


if __name__ == "__main__":
    main()
