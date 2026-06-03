---
name: html-artifacts
description: "Produce a self-contained HTML artifact instead of long Markdown for specs, plans, PR reviews, design comparisons, explainers, reports, status pages, or one-off interactive editors. Use whenever the deliverable is a reference document the user will read, share, tweak, or come back to — multiple sections, mixed content (tables, diagrams, code, data), side-by-side comparisons, or live parameter tuning — even if they don't explicitly say 'HTML'. Skip for inline chat answers, direct code edits, or short replies."
---

# HTML Artifacts

When the user asks for a spec, plan, report, review, explainer, comparison, or custom editor — reach for a self-contained HTML file, not a long Markdown document. Commit to the format; don't ping-pong the user with "Markdown or HTML?"

## Why HTML over long Markdown

Markdown was designed for content humans edit by hand. Reference artifacts are different — the user reads them, shares the link, and asks Claude to revise them later. For that workflow, HTML wins on:

- **Information density.** Tables, SVG diagrams, color-coded callouts, tabs, and embedded code blocks fit naturally. The Markdown alternatives — ASCII diagrams, unicode color swatches, deeply nested lists — degrade fast past ~100 lines.
- **Visual navigation.** Tabs, anchored sections, collapsibles, and a sticky table of contents make a long document scannable. A 400-line Markdown file is a wall.
- **Shareability.** An `.html` file opens in any browser and renders identically. No README rendering quirks, no copy-paste-into-Notion.
- **Two-way interaction.** Sliders, toggles, draggable cards, and copy-to-clipboard buttons let the user *tune* the artifact and feed the result back — much tighter than "edit this Markdown and paste it in."

The extra HTML tokens are negligible against a million-token context window; the readability gain is not.

## When to skip

- Short answers or chat-style replies that fit in <50 lines.
- Direct source edits — the artifact is the code itself.
- The user explicitly wants Markdown (READMEs, GitHub comments, paste-into-their-own-tool).
- Outputs another tool will parse (CI logs, JSON for a script).

## The shape of a good artifact

Picture a focused reference document, not a marketing site. Header with title and any quick metadata → sidebar TOC or tab bar for navigation → sections of mixed content (prose, code, SVG, tables, callouts) → generous whitespace → small consistent color palette used with intent.

The failure mode to avoid: pattern-matching "make me an HTML page" to "product landing page with hero, CTAs, three feature cards, and a footer." That shape is wrong for a spec, review, or explainer. Think *rendered document, richer* — not website.

## Common shapes

These are starting points, not an exhaustive menu. The underlying principle — rich self-contained layout + targeted interactivity — composes into anything else the user actually asks for. The components listed are what the model should produce, not boxes to tick; drop anything that doesn't fit the specific request.

### Spec or plan

For "help me think through how to build X." Components: mockups (SVG or styled divs), a data-flow diagram, key code snippets the user would actually touch, a risks/open-questions panel, a subtask checklist. If the user is comparing approaches, lay them out side-by-side in a grid with each labelled by the tradeoff it's making.

### Code review or PR walkthrough

For "review this PR" or "explain this diff." Render hunks with margin annotations. Group by file, then by concern. Color-code findings by severity. Top-of-page verdict summary; bottom-of-page list of things to confirm with the author.

### Explainer or research synthesis

For "how does X work?", "summarize this incident," "what's the state of Y?" Diagram of the core mechanism (SVG, not ASCII), 3–4 annotated code snippets, a glossary or gotchas section, links back to source files with line numbers. Goal: the user reads once and has a working mental model.

### Custom one-off editor

For "let me reprioritize / tune / triage these N items." Purpose-built UI: draggable cards across columns, form editors with dependency warnings, side-by-side input/output panes that update live. Always include an export control (copy as Markdown / JSON / diff) so the user's edits flow back to Claude.

## Rules that must hold

Violating any of these breaks the artifact:

- **Self-contained.** Inline CSS and JS. No build step, no npm. A single CDN script (Tailwind via CDN, Mermaid, D3) is fine when it earns its weight; default to vanilla. The user just opens the file.
- **Real content, not placeholders.** Generate the actual diagrams, the actual code snippets, the actual data from the user's request. "Lorem ipsum" or "TODO: add diagram" defeats the entire point — the artifact has to be useful on first read.
- **Working interactivity.** If the artifact has a slider, drag handler, or export button, wire it up and check the JS doesn't throw. Broken interactivity is worse than no interactivity — it makes the artifact feel like a mockup.
- **Dark mode.** Always offer both light and dark themes, either with a toggle or (preferably) auto-detecting the user's system preference (if after a certain time, say 7:30pm in their timezone, default to dark). Bonus points for respecting OS-level reduced-motion settings.
- **Easily readable and long only when needed.** Ensure humans can easily read the content without getting bored or overwhelmed. Use whitespace, headings, and layout to break up the content. Don't stretch it into a long document if the request doesn't call for it. What is said in 400 lines can often be said in 100 lines with better formatting and layout, especially when the content is mixed (code + diagrams + tables + prose).

## Defaults worth reaching for

Not load-bearing — skip when they'd add complexity without value:

- Flex/grid layouts (incidentally mobile-responsive — useful when the user might read on their phone).
- Anchored navigation (sticky TOC, smooth-scroll, or tab bar) once there are more than three sections.
- A small color palette used with intent — severity, status, category — applied consistently.
- `@media print` rules for specs and reviews that the user might export to PDF.
- Linked relative paths and line numbers when summarizing source code, so the user can jump back.

## Saving and iterating

Save the artifact somewhere the user can find it again: alongside related project files (a `docs/` folder, an `artifacts/` folder, wherever the project organizes documentation) with a descriptive, optionally dated name; or under `/tmp/` for throwaways. Tell the user the path and how to open it on their OS.

When the user asks for revisions, **edit the HTML file in place** — don't regenerate from scratch. Multiple focused artifacts (exploration doc, implementation plan, mockups, post-mortem) beats one ballooning monolith; let each stay compact and single-purpose.
