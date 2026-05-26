---
name: svg-to-pdf
description: Convert SVG files to tightly-cropped PDF documents with full emoji and Unicode support. Use this skill when the user asks to convert an SVG to PDF, export an SVG as PDF, or make a PDF from an SVG file. This solves the problem of Boxy SVG's built-in PDF export incorrectly displaying fonts, icons, and emoji.
---

# SVG to PDF

## Overview

Convert SVG files to tightly-cropped PDF documents using headless Chrome. This solves a specific problem: **Boxy SVG's built-in PDF export incorrectly renders some fonts, icons, and emoji**. By exporting as SVG from Boxy SVG and then converting to PDF via Chrome, all text, icons, and emoji render correctly.

## Conversion Workflow

### Step 1: Ask about the source

Ask the user if they are exporting from Boxy SVG. If yes, guide them to use these recommended SVG export settings in Boxy SVG:

**Boxy SVG Export Settings (Export > SVG):**
- **Size**: Auto (or set explicit Width/Height in Pixels)
- **Units**: Pixels (px)
- **Normalization**: Custom
  - [x] Remove Boxy SVG metadata
  - [x] Remove foreign metadata
  - [x] Remove animations
  - [x] Reset transform origins
  - [ ] Convert texts to paths *(leave unchecked)*
  - [x] Embed external fonts
  - [ ] Split compound paths *(leave unchecked)*

Then have them export as `.svg` and provide the file path.

If the user is not using Boxy SVG, skip this step and proceed with whatever SVG file they provide.

### Step 2: Identify the SVG file

Confirm the input SVG path and determine the output PDF path. If the user doesn't specify an output path, place the PDF alongside the SVG with a `.pdf` extension.

### Step 3: Run the conversion script

Execute the bundled script:

```bash
python3 <skill-dir>/scripts/svg_to_pdf.py "<input.svg>" "<output.pdf>"
```

The script:
1. Parses the SVG's `viewBox` (or `width`/`height`) to determine content dimensions
2. Inlines the SVG into an HTML wrapper with `@page` CSS that sets the page size to match the SVG dimensions exactly
3. Replaces any fixed `width`/`height` attributes on the SVG with `100%` so it fills the page
4. Renders via headless Chrome with `--no-margins --no-pdf-header-footer` flags

### Step 4: Verify the output

Check the output file exists and report the file size to the user.

## Requirements

- **Google Chrome** must be installed. The script checks these locations in order:
  - `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (macOS)
  - `google-chrome`, `chromium`, `chromium-browser` on PATH (Linux)
- **Python 3** (no additional pip packages needed)

## Troubleshooting

- **Whitespace around content**: The SVG's `viewBox` may have internal padding. Adjust the viewBox values to crop tighter, or modify the `@page` size in the wrapper HTML.
- **Missing emoji/Unicode**: This approach uses Chrome's text rendering which supports emoji natively. If emoji are still missing, ensure the system has emoji fonts installed.
- **Chrome not found**: Install Google Chrome or set the path in the script's `find_chrome()` function.

## Resources

### scripts/
- `svg_to_pdf.py` — Main conversion script. Requires only Python 3 and Google Chrome.
