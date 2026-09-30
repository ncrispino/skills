---
name: project-proposal
description: Write and iterate on research/engineering project proposals as a locally served, editable HTML doc (vim keybindings, live co-editing with Claude, figures as inline SVG) that exports to Word, PDF, Markdown and Google Docs. Structure is motivation → challenges → (threat model) → approach → infrastructure → experiments + budget → expected results. Use whenever the user wants to plan, scope, pitch or pressure-test a project, write a research proposal, project plan, one-pager or "what should we build and how would we test it", check whether a project is feasible on a budget, or continue an existing proposal.html, even if they don't say "proposal".
---

# Project Proposal

A proposal is a tool for deciding whether a project is worth doing and how to start it. It is not a sales document. The doc succeeds when a reader can see in five minutes what we are betting on, the simplest version we will build first, what it costs, and what result would make us stop.

This skill is shared with the user and is meant to improve over time. Read **Learned preferences** at the bottom before starting; it overrides the defaults above it.

## Core beliefs (why the template looks the way it does)

- **Start simple (the bitter lesson).** The user has lost projects by starting with an exciting big idea and later losing to a simple baseline that week 1 should have found. Every proposal has a *start-simple ladder*: R0 trivial baseline → R1 strongest simple baseline → R2 minimal version of the idea → R3 full idea. Each rung is gated by a measured result on the rung below. Build on existing work freely; everything we add must be justified by what actually works.
- **Feasibility is found in the experiment table.** Writing out every experiment, condition, seed and ablation, with cost, often shows a project is infeasible or too wide. The budget table is live (totals update as numbers change) so scoping happens in the doc, before any compute is spent.
- **Infrastructure is step 1.** Good infra (one runner, cached calls, append-only raw logs with provenance, recomputable metrics, a way to look at raw outputs) makes every later experiment cheaper and debuggable. The plan's first milestone is infra + baselines.
- **Safety projects need a threat model.** Asset, adversary, capabilities, goal, trust boundary, out of scope, plus a diagram. Experiments must test the attacker the threat model names.
- **Figures lead, prose follows.** Each major section gets a figure if a picture explains it faster than text. Prose is plain and short.
- **The main doc is the user's.** Research is kept separate (see below) and only enters the main doc after the user agrees.

## Writing style

Plain, direct, specific. The user dislikes mannered prose and filler.

- Short sentences. Concrete nouns, numbers, named baselines, named metrics, named datasets.
- One idea per bullet or paragraph. Cut anything a reader would skim past.
- No throat-clearing ("In this proposal we…"), no hype ("revolutionary", "crucial", "novel paradigm"), no "delve / landscape / leverage / robust / seamless / tapestry", no rhetorical triplets, no em-dash chains.
- Say what we will do, not what "could potentially be explored".
- Detailed where detail changes a decision (metrics, budgets, gates, threat model); brief everywhere else.
- Label anything imagined: mock results are marked HYPOTHETICAL; claims from research notes stay `class="unverified"` until the user accepts them.

## Look and feel

The page should read like a real document, not a web app: a white page on a cool grey background, outline in the left margin, serif body text (Source Serif 4), sans for headings, tables, captions and editor controls (IBM Plex Sans). Tables use horizontal rules only; callouts are a colored rule plus a sentence-case label, not boxes. No all-caps labels, no "A · B · C" metadata strings, no card grids. When changing the look, follow the frontend-design skill (plan tokens, check the plan against generic defaults, screenshot and critique) and keep `proposal.css` as the single place styles live.

## Files

```
<proposal-dir>/
  proposal.html          # the doc; content between <!-- DOC:START --> and <!-- DOC:END -->
  _assets/editor.js      # editor, vim, save/reload, TOC, budget math, hover tips
  _assets/proposal.css   # theme tokens + SVG figure classes (light/dark)
  research/index.html    # list of research notes with status badges
  research/<slug>.html   # one note per question (subagent output)
  export/                # generated: .docx .pdf .md .html + figs/*.png
```

Scripts (in this skill's `scripts/`):

| script | use |
|---|---|
| `new_proposal.py <dir> --title T --author A` | scaffold a proposal from `assets/template/` |
| `new_proposal.py <dir> --note slug --title T --question Q` | new research note, linked from research/index.html |
| `new_proposal.py <dir> --update-assets` | pull latest editor/css into an existing proposal |
| `serve.py <dir> [--port 8765]` | local server: static + save + export. Run in background. |
| `export.py <dir>/proposal.html --format docx\|pdf\|md\|html\|all` | exports (also from the toolbar or `:export docx`) |

Ask the user where proposals should live if it's not obvious (a `proposals/` folder in the project repo is a good default). Then start the server in the background and give the user the URL.

## Workflow

### 1. Intake (before writing anything)

Get these in conversation. Use AskUserQuestion for real forks; don't interview for things you can propose a default for.

1. The idea in the user's words, and the concrete example that made them want to do it.
2. The five summary paragraphs: the problem, hypothesis, first experiment, we succeed if (metric vs named comparison), we stop if. Draft them yourself and have the user correct them. Until these five are agreed, don't fill sections.
3. Constraints: budget ($ or GPU-hours), deadline, people, compute access, models/APIs allowed.
4. Is it a safety/security project (threat model needed)?
5. What research, if any, they want done, and on which questions.

### 2. Scaffold and serve

```bash
python3 <skill>/scripts/new_proposal.py <dir> --title "…" --author "…"
python3 <skill>/scripts/serve.py <dir>          # run_in_background
```

Give the user the URL that `serve.py` prints. Read it from the output, because the script moves to the next free port when 8765 is taken. Delete the threat-model section if not needed.

### 3. Fill section by section, with the user

Go in order, one or two sections per turn, and let the user react.

**Template rule: everything default is `class="hint"` and hidden.** Each section's guidance text, example tables, example figures and placeholder rows sit in one `<div class="hint">` after its heading. They are invisible in the doc (the user sees only headings until a section is written), revealed per section by hovering the heading and clicking "Guide", or all at once with the toolbar's Guide button or `:guide`. Export drops them. When you write a section, move what you need out of its hint block (drop the `hint` class) and delete the rest. Never leave template text or example numbers visible. Per-section checklists are in `references/section-guide.md`; read it when drafting a section for the first time in a session.

Order that works best: summary → Figure 1 sketch → Challenges (incl. "could a simple baseline already solve this?") → Approach ladder → Experiments + budget → Infrastructure → Expected results → Motivation polish → Plan → Risks. Experiments come early because they are where feasibility shows up; if the budget goes red, stop and rescope with the user before polishing prose.

### 4. Co-editing protocol (important)

The user edits in the browser (autosave ~1.5s after typing, `:w`, Cmd-S). You edit the same file with Edit.

- **Re-read `proposal.html` before every edit**; the user may have changed it. The server's hash check stops the browser overwriting your edits: the page live-reloads when the user has no unsaved changes, and shows a conflict banner if both changed.
- Edit only between `DOC:START` and `DOC:END` unless changing layout.
- **Every turn, grep for `class="note"`.** Notes are the user's inline comments to you (toolbar "+ Note" or vim `gc`). Address each, then delete it (or reply in the chat if it needs discussion).
- Keep edits surgical. Never regenerate the whole doc; the user's wording wins over yours.
- Log agreed decisions in the decision-log appendix with the date (e.g. "cut R3 from scope: budget"). This is how a later session knows why things are the way they are.

### 5. Figures

Inline `<svg>` inside `<figure id="fig-…">` with a `<figcaption>`. Use the CSS classes from `proposal.css` (`b-red`, `b-green`, `b-purple`, `b-blue`, `b-amber`, `b-slate`, `b-paper`, `t`, `t-s`, `t-h`, `ln`, `ln-red`, `dash`, `arrowhead`) instead of hex colors so figures follow light/dark and export correctly. Do not put `var(--x)` in SVG attributes (`fill="var(--red)"` silently fails); use `class=` or `style=`.

Color meaning is fixed across the doc: red = problem/baseline, purple = our method, green = success/expected result, blue = data/infra, amber = adversary/warning, slate = neutral.

Make figures earn their interactivity: `data-tip="…"` on any SVG element gives a hover tooltip (details that would clutter the figure); keep the static figure understandable without hovering, because exports lose hover. A viewBox width of 800 matches the doc column.

Before showing the user, render and look:

```bash
python3 <skill>/scripts/export.py <dir>/proposal.html --format md   # writes export/figs/<fig-id>.png
```

then Read the PNGs and fix overflow, overlaps and clipped text. For a big bespoke Figure 1, use the `research-figure-design` skill (sketch 3–5 layouts first) and paste the final SVG in, converting colors to the classes above.

### 6. Research: separate, unverified, opt-in

Research never edits `proposal.html`. When the user wants background (related work, simple baselines, datasets, costs):

1. Create one note per question: `new_proposal.py <dir> --note <slug> --title … --question …`.
2. Launch research subagents in parallel (Agent tool, one per note). Tell each: the question, the proposal's summary for context, to write **only** `research/<slug>.html` by filling the note template (answer, implication, confidence, findings with source links marked "read" vs "snippet only", simple baselines found, open questions), and to never touch `proposal.html`. Ask them to put effort into finding the *simplest strong baselines* and existing tools we can build on.
3. When they finish, fill each note's `<p class="a">` in `research/index.html` with its answer in one or two sentences, summarize each note in 2–3 lines in chat, then build `research/review.html`: one `<section class="approve-item" data-status="pending">` per suggested change (h3 title; `.kv` rows for Change, Caveat, Source; an empty `<p class="comment">`). The editor adds Approve / Reject / Discuss buttons and saves the choice as `data-status`. The user approves item by item there; don't ask them to pick findings in chat. Sort the page into four groups, in this order: **Already agreed in our conversation** (items the user already said in chat: pre-set `data-status="approved"` with an "Agreed" line quoting what they said), **Needs your decision** (real forks, each with a "Decide" line first stating the choice), **Recommended defaults** (quick approvals), **Later**. Merge duplicates across notes (say which item absorbed which), and when an item conflicts with something the user said, rewrite it to match the user and note the change. Give every item a Links row with direct links to the papers and docs it relies on (the PDF for papers), not only a link to the research note. Verify load-bearing claims yourself before listing them (e.g. that a cited paper exists) rather than leaving that to the user. Put a `[data-approve-summary]` span in the meta line for the tally.
4. Read the page back (`grep data-status`, plus the comments). Move only approved items into the main doc, citing the note (`<a href="research/slug.html">`). Take Discuss items to chat. Mark adopted notes' badge Adopted and log it in the decision log.
5. References the user supplies go straight into the references appendix, but check any identifiers they cite (OWASP, MITRE ATLAS, NIST, CVE IDs) against the primary source first; secondary summaries often get them wrong. MITRE ATLAS IDs are in `github.com/mitre-atlas/atlas-data` (`dist/ATLAS.yaml`).
6. Citations the user hasn't confirmed stay `class="unverified"`. Don't invent references; the `citation-verifier` skill can check a list.

### 7. Plan review (reviewer agent)

The skill ships a reviewer agent, `agents/proposal-reviewer.md` (symlinked into `~/.claude/agents/`, so it appears as the `proposal-reviewer` agent type in new sessions). It reads the proposal, source notes, research and this skill's rules, and writes `research/plan-review.html`: findings grouped as must fix / should fix / worth considering, each an approve item with Issue, Why and Change. It never edits the proposal.

Run it when the user asks ("review the plan", "check this", "what's off"), and offer it at milestones: summary agreed, experiments and budget drafted, full draft done. Launch it in the background with the proposal directory and any focus the user named. If the agent type isn't available in the current session, launch a general-purpose agent and paste the body of `agents/proposal-reviewer.md` as its instructions. When it finishes, give the user the verdict and the must-fix titles in chat, and point them at the page (the sidebar shows it with an open count). Apply only approved items, as with research findings.

### 8. Feasibility check

Before calling a draft done, check with the user:

- Budget verdict (green/amber/red from the live table). All ablations and seeds counted?
- Does each experiment map to a decision? Cut experiments that inform nothing.
- Is R1 genuinely the strongest cheap baseline, or a strawman?
- Is week 1 infra + baselines, with a single command reproducing the baseline numbers?
- Kill criteria stated as a measurable result.

If the project doesn't fit, say so plainly and propose the smaller version.

### 9. Export

From the toolbar, `:export docx|pdf|md|html|all`, or the script. `export.py` drops hints and notes (`--keep-notes` keeps them), renders each SVG to a 2x PNG in the light theme via headless Chrome, then:

- **pdf**: Chrome prints the standalone HTML (figures stay vector).
- **docx**: pandoc with figures as PNG. Callouts become block quotes. An optional `assets/reference.docx` sets Word styles if present.
- **Google Docs**: upload the docx with the Google Drive connector (`create_file`, `base64Content`, `contentMimeType: application/vnd.openxmlformats-officedocument.wordprocessingml.document`; Drive converts it). Ask before uploading; it leaves the machine.
- **md**: GitHub-flavored, figures as `figs/*.png`.
- **html**: one self-contained file with vector figures and hover tips, no editor.

Open the exported file (or render a page to PNG) and check it before telling the user it's done.

## Editor reference (for helping the user)

Vim is on by default (toggle in the toolbar or `:vim off`). Mode shows top-left; the caret is red in NORMAL.

- Motions: `h j k l`, `w b e`, `0 ^ $`, `gg G`, `{ }`, counts (`3j`), `Ctrl-d/u`, `zz`.
- Edit: `i a I A o O`, `x X`, `r<c>`, `s S`, `J`, `D C`, `dd cc yy` (on the current block: paragraph, list item, heading), `d/c/y` + motion (`dw`, `c$`, `dgg`), `p P`, `u`, `Ctrl-r`, `>> <<` (list indent). Undo is vim-style: one insert session is one undo step.
- Visual: `v` (charwise), `V` (block), then `d x y c`.
- Search: `/text`, `n N`. Ex: `:w`, `:e!` (reload from disk), `:export docx`, `:note`, `:guide`, `:3` (jump to section 3), `:set dark|light`, `:vim off`.
- The status line at the bottom shows mode, file, save state and word count.
- The sidebar button at the top left (or `:toc`) collapses the outline so the page centers; the choice is remembered per browser.
- Review pages hide approved items by default ("Show approved (n)" in the toolbar brings them back; remembered per browser). An item fades out a moment after it is approved, and a group heading disappears once everything in it is approved.
- The sidebar also links the whole project on every page: proposal, findings to review (with the open count), and each research note (dot color = status). It reads `research/index.html` and `research/review.html`, so keep those two files current.
- `gc` or "+ Note" inserts a note for Claude after the current block.
- Links: in NORMAL mode a click (or Enter with the caret on the link) opens it; in INSERT mode or with vim off, a click places the caret and Cmd/Ctrl-click opens. Pages open in NORMAL mode.
- In insert mode, at the start of an empty paragraph: `## ` → heading, `### ` → subheading, `- ` → bullet list, `1. ` → numbered list, `> ` → quote.
- Paste is plain text. Figures are not editable in the browser (their captions are); ask Claude to change them.

## Self-improvement: this skill should drift toward the user

The user will keep using and refining this skill; treat every proposal session as training data for it. At the end of a substantive session (a section agreed, a draft finished, a scoping decision made), take one beat and ask: did the user reveal a durable preference, correct the same thing twice, push back on a section's shape, add a section they always want, or hit an editor/export bug?

If yes, propose 1–3 short additions:

> Based on this session, I'd add these to the project-proposal skill:
> 1. <≤ 1 sentence>
>
> OK to add?

On approval, edit this skill directly (the skill lives in `~/GitHubProjects/skills/project-proposal/`, symlinked into `~/.claude/skills/`):

- Taste and structure → bullets under **Learned preferences**, or tighten the guidance above.
- Template changes the user wants every time → edit `assets/template/proposal.html` (and run `--update-assets` for editor/css changes in open proposals).
- Editor or export bugs → fix `_assets/editor.js` / `scripts/*.py` and note the gotcha below.
- Recurring figure shapes → add the SVG to `references/figure-patterns.md`.
- Review checks the user keeps asking for, or problems the reviewer missed → add them to `agents/proposal-reviewer.md`.

Record preferences, not one-off content. If a later session contradicts an entry, revise or delete it.

### Learned preferences
- Proposals are independent of existing project repos: they live in `~/GitHubProjects/proposals/<slug>/` (git, remote `ncrispino/proposals`). Code reuse from other repos is a separate decision, logged in the decision log.
- Save the user's original brief verbatim as `source-notes.md` in the proposal folder, so nothing is lost while rewriting.
- The user approves research findings one by one on an HTML review page before anything is adopted, not by picking in chat.
- For safety/behavior studies, always give the agent under test an honest way out (report that it could not finish), make sure it knows the rule itself, and start with low pressure; add pressure later as its own factor.
- Start with the smallest number of agents (two), and add agents with legitimate, completable tasks later.
- Template defaults (guidance text, example tables and numbers) must never show in the doc; they appear only when the user asks via Guide.
- Visual quality matters: the user rejected the first, web-app-like design as ugly and hard to read. Check every page with screenshots in light and dark before showing it.
- The user prefers a wide, large page: 1000px page, 19px body text, collapsible outline. A narrow column throws them off.
- The summary uses plain labels (The problem, Hypothesis, First experiment, We succeed if, We stop if), each on its own line above full-width text. The user found "Bet" / "Kill if" labels and a two-column layout hard to read.
- Plain language even in the summary: no unexplained terms like "matched control", "workaround rate" or "frontier models". Say what is compared and what counts as the behavior, with a concrete example.

### Gotchas
- `var(--x)` inside SVG presentation attributes doesn't resolve; use CSS classes.
- contenteditable swallows link clicks; the editor follows links itself (see Editor reference).
- contenteditable merges leave `style=""` and bare `<span>`s; the editor strips them on save.
- Chrome's `execCommand("delete")` across block boundaries damages neighbours (a following `<h2>` becomes a `<p>`, hidden `.hint` blocks get swallowed). Vim line ops therefore edit the DOM directly and use the editor's own snapshot undo.
- Don't lay out label/value rows with CSS grid: it turns every inline tag (`<i>`, `<a>`) into its own column. Review items use a hanging label; the summary puts each label on its own line.
- A background `serve.py` started from Claude Code is killed at its timeout (30 min by default). Start it with the maximum timeout, and offer the user the command to run in their own terminal for long sessions.
- `serve.py` falls back to the next free port; another app held 8765 on this machine, so always report the printed URL.
- Figures are drawn 800 wide and bleed 48px into each page margin; keep SVG text at 12.5px+ so labels stay readable.
