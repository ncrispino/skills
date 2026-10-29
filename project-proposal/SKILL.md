---
name: project-proposal
description: Write and iterate on research/engineering project proposals as a locally served, editable HTML doc (vim keybindings, live co-editing with Claude, figures as inline SVG) that exports to Word, PDF, Markdown and Google Docs. Structure is motivation → challenges → (threat model) → approach → infrastructure → experiments + budget → expected results. Use whenever the user wants to plan, scope, pitch or pressure-test a project, write a research proposal, project plan, one-pager or "what should we build and how would we test it", check whether a project is feasible on a budget, or continue an existing proposal.html, even if they don't say "proposal".
---

# Project Proposal

A proposal is a tool for deciding whether a project is worth doing and how to start it. It is not a sales document. The doc succeeds when a reader can see in five minutes what we are betting on, the simplest version we will build first, what it costs, and what result would make us stop.

This skill is shared with the user and is meant to improve over time. Read **Learned preferences** at the bottom before starting; it overrides the defaults above it.

## Core beliefs (why the template looks the way it does)

- **Work backwards from the perfect-world answer.** Before deciding what to build, record or measure, write down the answer we would want at the end if anything were possible: the table, report or figure a reader would look at, filled in on one concrete example, with what exists today and what is feasible set aside on purpose. Then work backwards: every experiment, metric and recorded field traces to a part of that answer, and any part we cannot reach is named as a limitation, never dropped silently. The answer sets the target; the start-simple ladder sets the path to it (R0 asks how much of the answer a trivial baseline already gives). Without it, projects record far more than they use and cannot say what any of it is for.
- **Start simple (the bitter lesson).** The user has lost projects by starting with an exciting big idea and later losing to a simple baseline that week 1 should have found. Every proposal has a *start-simple ladder*: R0 trivial baseline → R1 strongest simple baseline → R2 minimal version of the idea → R3 full idea. Each rung is gated by a measured result on the rung below. Build on existing work freely; everything we add must be justified by what actually works.
- **Feasibility is found in the experiment table.** Writing out every experiment, condition, seed and ablation, with cost, often shows a project is infeasible or too wide. The budget table is live (totals update as numbers change) so scoping happens in the doc, before any compute is spent.
- **Infrastructure is step 1.** Good infra (one runner, cached calls, append-only raw logs with provenance, recomputable metrics) makes every later experiment cheaper and debuggable. The plan's first milestone is infra + baselines.
- **Reading runs is infrastructure, from day 1.** We find bugs and behaviour by reading runs, not aggregates. Every proposal plans a results browser built in week 1 alongside the runner and used from the first run: every run listed (including live, failed and half-finished ones), each one readable in full, and every summary number linked to the runs behind it. Reading a sample of runs is part of every batch, and week 1 is not done until the first run can be opened and read.
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
2. The perfect-world answer: what they would want to know or see at the end if cost, existing code and feasibility were no object. Sketch it on their example (the final table or report, filled in with made-up values marked HYPOTHETICAL) and have them correct it. Ask them explicitly to set feasibility aside; it comes later, in the experiment table. A short narrated video of the answer (reelplanning, when installed) works well here.
3. The five summary paragraphs: the problem, hypothesis, first experiment, we succeed if (metric vs named comparison), we stop if. Draft them yourself, reading the hypothesis and "we succeed if" off the perfect-world answer, and have the user correct them. Until these five are agreed, don't fill sections.
4. Constraints: budget ($ or GPU-hours), deadline, people, compute access, models/APIs allowed.
5. Is it a safety/security project (threat model needed)?
6. What research, if any, they want done, and on which questions.

### 2. Scaffold and serve

```bash
python3 <skill>/scripts/new_proposal.py <dir> --title "…" --author "…"
nohup python3 <skill>/scripts/serve.py <dir> > /tmp/proposal-server.log 2>&1 &   # detached; see Gotchas
```

Give the user the URL that `serve.py` prints. Read it from the output, because the script moves to the next free port when 8765 is taken. Delete the threat-model section if not needed.

### 3. Fill section by section, with the user

Go in order, one or two sections per turn, and let the user react.

**Template rule: everything default is `class="hint"` and hidden.** Each section's guidance text, example tables, example figures and placeholder rows sit in one `<div class="hint">` after its heading. They are invisible in the doc (the user sees only headings until a section is written), revealed per section by hovering the heading and clicking "Guide", or all at once with the toolbar's Guide button or `:guide`. Export drops them. When you write a section, move what you need out of its hint block (drop the `hint` class) and delete the rest. Never leave template text or example numbers visible. Per-section checklists are in `references/section-guide.md`; read it when drafting a section for the first time in a session.

Order that works best: the answer we want → summary → Figure 1 sketch → Challenges (incl. "could a simple baseline already solve this?") → Approach ladder → Experiments + budget → Infrastructure → Expected results → Motivation polish → Plan → Risks. Experiments come early because they are where feasibility shows up; if the budget goes red, stop and rescope with the user before polishing prose.

### 4. Co-editing protocol (important)

The user edits in the browser (autosave ~1.5s after typing, `:w`, Cmd-S). You edit the same file with Edit.

- **Re-read `proposal.html` before every edit**; the user may have changed it. The server's hash check stops the browser overwriting your edits: the page live-reloads when the user has no unsaved changes, and shows a conflict banner if both changed.
- Edit only between `DOC:START` and `DOC:END` unless changing layout.
- **Every turn, grep for `class="note"`.** Notes are the user's inline comments to you (toolbar "+ Note" or vim `gc`). Address each, then delete it (or reply in the chat if it needs discussion).
- **Every turn, also grep for `class="cmt"`.** These are margin comments: the user highlights text and types a comment (toolbar Comment, the floating Comment button on a selection, Cmd/Ctrl-Alt-M, or `:comment`). Each is `<mark class="cmt" data-cid="…" data-comment="…">text</mark>`; one comment can span several marks with the same `data-cid`, and only the first carries `data-comment`. To address one, fix the text and unwrap every mark with that `data-cid` (keep the inner text). If it needs discussion instead, keep the marks and set `data-reply="…"` on the first one; the card shows it as "Claude: …". When the user says "address the comments", do all of them in one pass and list in chat what changed for each. **Mark every change you make in answer to a comment** with `<ins class="chg" data-chg="<id>" data-note="Re: “<short quote of the comment>” → <what changed>">…</ins>` around the new or changed text (an `ins` may wrap whole blocks: paragraphs, tables, a `<figure>`). For a deletion, wrap the neighbouring text and say what was removed. Use one `data-chg` per comment, and put `data-note` on the first `ins` only. The page highlights them in green with a margin card; the user clicks Mark read to clear each, and the toolbar's Changes (n) steps through the unread ones. Export drops the marks. The user asked for this because without it they could not tell what changed where (3 Oct 2026).
- Keep edits surgical. Never regenerate the whole doc; the user's wording wins over yours.
- **Ask Claude button.** The toolbar's Ask Claude (or `:ask`, shift-click for a message) saves the page and appends a line to `<dir>/.claude-asks.jsonl` (gitignored). Whenever the user is co-editing, keep a watch on it: `Monitor` with `tail -n 0 -F <dir>/.claude-asks.jsonl`, 30-minute timeout, re-armed at each expiry. On an event, re-read the named page, address every comment and note on it (plus the message, if any), commit, and say in chat what changed. The server must be restarted after `serve.py` changes for new endpoints to exist.
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
4. **Apply pass.** At the start of every turn (and whenever the user says "apply"), check each review page for decided items that don't yet have `data-applied`. Then:
   - Approved: write the change into the proposal where it belongs. A comment on an approved item is a requested change; follow it over the item's own wording.
   - Discuss: raise it in chat.
   - Rejected: log it in the decision log with the reason if one was given.
   - Mark each handled item `data-applied="YYYY-MM-DD"` (the editor labels it "Applied"), so nothing is applied twice.
   - Carry over every concrete sub-point and caveat of an item, not just its headline (e.g. "turn subagents off", "pin the judge too", "no licence: ask the authors"). After writing, re-read each item's Change and Caveat lines against the proposal; in this project's first two batches the reviewer found details dropped each time.
   - Sweep the whole proposal for anything the batch made inconsistent (summary, figures, tables, earlier sections, decision log) and fix it in the same pass.
   - Log the batch in the decision log, commit and push, then run the `proposal-reviewer` agent to check the result, and tell the user what went in and what the reviewer flagged.
   Cite the note (`<a href="research/slug.html">`) where a claim comes from research, and mark adopted notes' badge Adopted.
5. References the user supplies go straight into the references appendix, but check any identifiers they cite (OWASP, MITRE ATLAS, NIST, CVE IDs) against the primary source first; secondary summaries often get them wrong. MITRE ATLAS IDs are in `github.com/mitre-atlas/atlas-data` (`dist/ATLAS.yaml`).
6. Citations the user hasn't confirmed stay `class="unverified"`. Don't invent references; the `citation-verifier` skill can check a list.

### 6b. Consolidation rewrite

Apply passes add patches; after a few, the document drifts (repeats, stale wording, one-off example details leaking into the general design). When the user asks for a rewrite, or after every three or four apply passes, do a consolidation rewrite following `references/rewrite-pass.md`: gather every decision and open item, rewrite each section fresh with one home per fact, move task-specific material into a marked worked-example section, run the consistency checklist, then commit and run the reviewer.

### 7. Plan review (reviewer agent)

The skill ships a reviewer agent, `agents/proposal-reviewer.md` (symlinked into `~/.claude/agents/`, so it appears as the `proposal-reviewer` agent type in new sessions). It reads the proposal, source notes, research and this skill's rules, and writes `research/plan-review.html`: findings grouped as must fix / should fix / worth considering, each an approve item with Issue, Why and Change. It never edits the proposal.

Run it when the user asks ("review the plan", "check this", "what's off"), and offer it at milestones: summary agreed, experiments and budget drafted, full draft done. Launch it in the background with the proposal directory and any focus the user named. If the agent type isn't available in the current session, launch a general-purpose agent and paste the body of `agents/proposal-reviewer.md` as its instructions. When it finishes, give the user the verdict and the must-fix titles in chat, and point them at the page (the sidebar shows it with an open count). Apply only approved items, as with research findings.

### 8. Feasibility check

Before calling a draft done, check with the user:

- Budget verdict (green/amber/red from the live table). All ablations and seeds counted?
- Does each experiment map to a decision? Cut experiments that inform nothing.
- Is R1 genuinely the strongest cheap baseline, or a strawman?
- Is week 1 infra + baselines, with a single command reproducing the baseline numbers?
- Can every run be opened and read from day 1 (results browser in week 1's "done when"), and does each batch include reading a sample of runs?
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
- Search: `/text`, `n N`. Ex: `:w`, `:e!` (reload from disk), `:export docx`, `:note`, `:guide`, `:3` (jump to section 3), `:set dark|light|system`, `:vim off`.
- The status line at the bottom shows mode, file, save state and word count.
- The sidebar button at the top left (or `:toc`) collapses the outline so the page centers; the choice is remembered per browser.
- Review pages hide approved items by default ("Show approved (n)" in the toolbar brings them back; remembered per browser). Approved items with a comment stay visible, labelled "Approved, with comment": treat that comment as a requested change when applying the item. An item fades out a moment after it is approved, and a group heading disappears once everything in it is approved.
- The sidebar also links the whole project on every page: proposal, findings to review (with the open count), and each research note (dot color = status). It reads `research/index.html` and `research/review.html`, so keep those two files current.
- `gc` or "+ Note" inserts a note for Claude after the current block.
- Comments: in NORMAL mode, highlighting text with the mouse opens a comment box at once (the user asked for no extra click); in INSERT mode or with vim off, use the floating Comment button, toolbar Comment, Cmd/Ctrl-Alt-M or `:comment`. A comment left empty disappears when its box loses focus. Figures: clicking a spot on a figure drops a pin comment there (`<span class="cmt cmt-pin" data-cid data-comment data-x data-y data-target>` inside the `<figure>`; `data-target` is the text of what was clicked). To address one, change the SVG and delete the span. Formulas: clicking rendered math (or highlighting across it) comments on it; the `<mark class="cmt">` then wraps the TeX source span. The text is highlighted and a card opens in the right margin to type in; it autosaves into the file. Resolve removes the highlight. Hovering a card highlights its text. Export drops comments and keeps the text.
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
- Reading runs is a week-1 deliverable, not a nice-to-have: the user called a reliable way to view results from day 1 "absolutely crucial" and wants it in every plan (1 Oct 2026).
- Proposals are independent of existing project repos: they live in `~/GitHubProjects/proposals/<slug>/` (git, remote `ncrispino/proposals`). Code reuse from other repos is a separate decision, logged in the decision log.
- Before any `git add -A` in a proposal repo, confirm secrets are ignored: proposals pick up `.env` files with API keys. The repo's `.gitignore` must list `.env` and `.env.*`. Never read or echo a key; scripts load it from the environment.
- Commit and push the proposals repo as you go: after each agreed change or finished research round, commit with a short message and push to `origin main` (exports are gitignored). The user asked for this.
- Save the user's original brief verbatim as `source-notes.md` in the proposal folder, so nothing is lost while rewriting.
- The user approves research findings one by one on an HTML review page before anything is adopted, not by picking in chat.
- For safety/behavior studies, always give the agent under test an honest way out (report that it could not finish) and start with low pressure; add pressure later as its own factor. Give each rule only to the agent it applies to: in a multi-agent study the agent under test is not handed the guard's rule, or it declines the request itself and the guard's refusal is never tested (1 Oct 2026; replaces an earlier "make sure it knows the rule itself").
- Start with the smallest number of agents (two), and add agents with legitimate, completable tasks later.
- Template defaults (guidance text, example tables and numbers) must never show in the doc; they appear only when the user asks via Guide.
- Visual quality matters: the user rejected the first, web-app-like design as ugly and hard to read. Check every page with screenshots in light and dark before showing it.
- The user prefers a wide, large page: 1000px page, 19px body text, collapsible outline. A narrow column throws them off.
- The summary uses plain labels (The problem, Hypothesis, First experiment, We succeed if, We stop if), each on its own line above full-width text. The user found "Bet" / "Kill if" labels and a two-column layout hard to read.
- Progressive disclosure: the main line of each section is short and readable on its own; supporting detail (long tables, taxonomies, arguments, secondary figures, older decision-log entries) goes in `<details class="more"><summary>One line saying what is inside</summary>…</details>`, which the editor saves collapsed and export expands. The user found a 130 KB proposal "very long and hard to understand" (3 Oct 2026).
- For setups with several agents, tasks or conditions, include a short "setup in symbols" block (`<div class="mathblock">` holding a `<table class="sym">` of symbol | meaning rows, then the comparisons as display equations). Write math as TeX: `<span class="math inline">\(…\)</span>` and `<span class="math display">\[…\]</span>`; the editor and standalone exports draw it with KaTeX, and export.py converts it to MathML so Word gets equations and Markdown gets `$…$`. The user wants math that looks like TeX, set apart from the prose: agents, tools, rules, task, conflict, outcomes and the contrasts measured, each in one line. Keep it minimal: a handful of symbols, plain words for outcomes (goal, attempt, ext), comparisons written as P(x | condition) − P(x | baseline), no set notation or indicator functions. The user asked for basic math to ground the design, then found a fuller formalism (sets, indicators, Δ subscripts) too confusing to help (3 Oct 2026).
- Safety threat models state the adversary's pressure explicitly (e.g. goal mode: the task plus a neutral "continue" message) and what the adversary knows about the obstacle (black box or not), following the threat model of the closest prior paper and naming the one thing changed.
- Don't narrate removals or reversals in the main doc ("we dropped X because…", "the earlier runs used Y"): nobody else has read the old version. Say what the design is now; the decision log keeps the history (3 Oct 2026).
- For a benchmark, define a task formally: a tuple split into what the agents are given and what only the scorer sees, plus each score as a formula with its plain meaning beside it (3 Oct 2026).
- Plain language even in the summary: no unexplained terms like "matched control", "workaround rate" or "frontier models". Say what is compared and what counts as the behavior, with a concrete example.
- Write the paper's tables into the Experiments section as templates to fill in: each table as a rendered HTML table with dashes in empty cells, a bold "Table N." caption saying what is reported and against what, and its LaTeX source (booktabs) in a `<details class="more"><summary>LaTeX</summary><pre><code>…</code></pre></details>`. At least the main results, any dose or curve, the ablations (one change at a time from a stated default) and a breakdown of the headline measure. The user wants it "like we are filling in a paper", to make clear what each experiment must show (4 Oct 2026).
- Work backwards from a perfect-world answer: before what to record or build, state the output we would want if anything were possible, on one example, with no code or feasibility in it; then trace everything back to it and list what it cannot reach as limitations. The user asked for this after a project had accumulated records nobody could say the use of (7 Oct 2026).
- Keep one "What we vary" table (factor, levels, where reported: main or ablation, what it tests and the expected result), with the default setup stated once above it. Say how wording or other free choices are kept from becoming knobs: fixed in git before running, all reported, chosen on one task and tested unchanged on another, identical across matched versions (4 Oct 2026).

### Gotchas
- Test editor changes against a scratch copy of the proposal (new_proposal.py into the scratchpad, served on another port), never the user's live files: a browser test that saves can overwrite edits the user is making at the same moment.
- The DOC:START/DOC:END markers live inside `<main id="doc">`, so `doc.innerHTML` contains them. The editor strips them before saving and the server strips them from what it receives (and matches first START to last END), otherwise every save nests another pair. When editing pages with a script, slice between the first START and the last END.
- `export.py` needs beautifulsoup4; on this machine only `/opt/homebrew/anaconda3/bin/python3` has it, and a bare `python3` fails with ModuleNotFoundError while leaving the previous export in place, so a stale file looks like a fresh one. Check the script printed `wrote ...` before trusting the output.
- `var(--x)` inside SVG presentation attributes doesn't resolve; use CSS classes.
- contenteditable swallows link clicks; the editor follows links itself (see Editor reference).
- contenteditable merges leave `style=""` and bare `<span>`s; the editor strips them on save. Only spans with no attributes at all are unwrapped: an earlier rule also stripped `<span data-approve-summary>`, freezing the review tally.
- Review pages: "done" means applied by Claude (any status) or approved with no comment; done items hide. Put undecided items (discuss first, then pending) in a "Still open" group at the top. When answering a question the user left on an item, add `<p class="kv answer"><b>Answer</b>…</p>` as the item's first row (it renders highlighted). Keep answers short and general (not tied to one example task), say plainly what kind of thing each part is (control, ablation, decision), and use a small table when comparing several things (a `<div class="kv answer">` can hold one).
- Chrome's `execCommand("delete")` across block boundaries damages neighbours (a following `<h2>` becomes a `<p>`, hidden `.hint` blocks get swallowed). Vim line ops therefore edit the DOM directly and use the editor's own snapshot undo.
- Don't lay out label/value rows with CSS grid: it turns every inline tag (`<i>`, `<a>`) into its own column. Review items use a hanging label; the summary puts each label on its own line.
- A `serve.py` started as a Claude Code background task is killed at its time limit (2 hours at most). Start it detached instead, so it lasts the whole session: `nohup python3 <skill>/scripts/serve.py <dir> --port 8766 > /tmp/proposal-server.log 2>&1 &`, then check the log for the URL. Stop it with `pkill -f "serve.py .*<dir-name>"`.
- `serve.py` falls back to the next free port; another app held 8765 on this machine, so always report the printed URL.
- `<summary>` does not toggle inside contenteditable; editor.js toggles it on click and strips `open` on save, and export.py turns each `<details>` into a div with a bold lead-in. SVG has no `_` subscripts: write `R<tspan dy="4" font-size="10">G</tspan><tspan dy="-4">…</tspan>`.
- Figures are drawn 800 wide and bleed 48px into each page margin; keep SVG text at 12.5px+ so labels stay readable.
