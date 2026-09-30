#!/usr/bin/env python3
"""Scaffold a new project proposal directory from the skill's template.

Usage:
    python3 new_proposal.py <dir> --title "Project title" [--author "Name"]
    python3 new_proposal.py <dir> --update-assets      # refresh editor/css and the note template in an existing proposal
    python3 new_proposal.py <dir> --note slug --title "Note title" --question "..."  # new research note

Creates:
    <dir>/proposal.html          main document (edit in browser or by Claude)
    <dir>/_assets/               editor.js + proposal.css (copied, so the dir is portable)
    <dir>/research/index.html    list of research notes (unverified by default)
    <dir>/research/_note_template.html
"""

import argparse
import datetime as dt
import html
import re
import shutil
import sys
from pathlib import Path

TEMPLATE = Path(__file__).resolve().parent.parent / "assets" / "template"


def fill(text: str, **kw) -> str:
    for k, v in kw.items():
        text = text.replace("{{" + k + "}}", html.escape(v))
    return text


def new_note(root: Path, slug: str, title: str, question: str) -> Path:
    d = dt.date.today()
    today = f"{d.day} {d:%B %Y}"
    tpl = (root / "research" / "_note_template.html").read_text()
    out = root / "research" / f"{slug}.html"
    if out.exists():
        sys.exit(f"{out} already exists")
    out.write_text(fill(tpl, NOTE_TITLE=title, DATE=today, QUESTION=question))
    # link it from research/index.html
    idx = root / "research" / "index.html"
    s = idx.read_text()
    # Claude fills <p class="a"> with the note's one- or two-sentence answer when the note is done
    item = (f'<li><span class="badge unverified">Unverified</span> <a href="{slug}.html">{html.escape(title)}</a>\n'
            f'<p class="q">{html.escape(question)}</p>\n<p class="a"></p></li>\n')
    s = re.sub(r'(<ul class="research-list">\n?)', r"\1" + item.replace("\\", "\\\\"), s, count=1)
    idx.write_text(s)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("--title", default="Untitled project")
    ap.add_argument("--author", default="")
    ap.add_argument("--update-assets", action="store_true")
    ap.add_argument("--note", help="create research/<slug>.html instead of a new proposal")
    ap.add_argument("--question", default="")
    a = ap.parse_args()
    root = Path(a.dir).expanduser().resolve()

    if a.note:
        print(new_note(root, a.note, a.title, a.question))
        return
    if a.update_assets:
        shutil.copytree(TEMPLATE / "_assets", root / "_assets", dirs_exist_ok=True)
        # new research notes should also start from the current note template
        (root / "research").mkdir(exist_ok=True)
        shutil.copy(TEMPLATE / "research" / "_note_template.html", root / "research" / "_note_template.html")
        print(f"refreshed {root / '_assets'} and research/_note_template.html")
        return
    if (root / "proposal.html").exists():
        sys.exit(f"{root}/proposal.html exists; use --update-assets to refresh the editor only")

    root.mkdir(parents=True, exist_ok=True)
    shutil.copytree(TEMPLATE / "_assets", root / "_assets", dirs_exist_ok=True)
    shutil.copytree(TEMPLATE / "research", root / "research", dirs_exist_ok=True)
    d = dt.date.today()
    today = f"{d.day} {d:%B %Y}"
    p = fill((TEMPLATE / "proposal.html").read_text(), TITLE=a.title, AUTHOR=a.author or "author", DATE=today)
    (root / "proposal.html").write_text(p)
    print(root / "proposal.html")


if __name__ == "__main__":
    main()
