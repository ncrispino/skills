#!/usr/bin/env python3
"""Render an SVG file to display PNG, hi-res PNG, and/or vector PDF.

Default writes a 2000px-wide PNG next to the input SVG.

Usage:
    python scripts/render_svg.py path/to/figure.svg
    python scripts/render_svg.py path/to/figure.svg --hires
    python scripts/render_svg.py path/to/figure.svg --pdf
    python scripts/render_svg.py path/to/figure.svg --all
    python scripts/render_svg.py path/to/figure.svg --width 3000

This script exists to remove the friction of the most important habit in
research-figure-design: render after every change and look at the PNG.
"""

import argparse
import sys
from pathlib import Path


def _import_cairosvg():
    try:
        import cairosvg  # noqa: F401
        return __import__("cairosvg")
    except ImportError:
        sys.stderr.write(
            "cairosvg is not installed.\n"
            "Install with one of:\n"
            "  pip install cairosvg --break-system-packages\n"
            "  python -m pip install cairosvg\n"
        )
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Render an SVG to PNG / PDF.")
    parser.add_argument("svg", help="Path to the input SVG file.")
    parser.add_argument(
        "--width", type=int, default=2000,
        help="Width in pixels for the display PNG (default 2000).",
    )
    parser.add_argument("--hires", action="store_true", help="Also write a 4000px-wide PNG.")
    parser.add_argument("--pdf", action="store_true", help="Also write a vector PDF.")
    parser.add_argument(
        "--all", action="store_true",
        help="Write display PNG, hi-res PNG, and PDF together.",
    )
    args = parser.parse_args()

    svg_path = Path(args.svg)
    if not svg_path.exists():
        sys.stderr.write(f"File not found: {svg_path}\n")
        sys.exit(1)
    if svg_path.suffix.lower() != ".svg":
        sys.stderr.write(f"Warning: input does not have .svg extension: {svg_path}\n")

    cairosvg = _import_cairosvg()

    stem = svg_path.with_suffix("")  # /path/to/figure (no extension)

    # Display PNG — always produced
    png_path = stem.with_suffix(".png")
    cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), output_width=args.width)
    print(f"wrote {png_path}")

    do_hires = args.hires or args.all
    do_pdf = args.pdf or args.all

    if do_hires:
        hires_path = Path(f"{stem}_hires.png")
        cairosvg.svg2png(url=str(svg_path), write_to=str(hires_path), output_width=4000)
        print(f"wrote {hires_path}")

    if do_pdf:
        pdf_path = stem.with_suffix(".pdf")
        cairosvg.svg2pdf(url=str(svg_path), write_to=str(pdf_path))
        print(f"wrote {pdf_path}")


if __name__ == "__main__":
    main()
