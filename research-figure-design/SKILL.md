---
name: research-figure-design
description: Design publication-quality SVG figures for academic papers, grant proposals, slide decks, talks, and posters. Use whenever the user wants a Figure 1, overview figure, schematic, method diagram, system architecture, experimental design figure, or any clean vector graphic for a research artifact. Also use when the user shares a reference figure and says "make something like this", asks for iteration on a draft figure, or needs to convey a research idea visually rather than in prose. This skill produces SVG source plus PDF and high-resolution PNG exports.
---

# Research Figure Design

Design crisp, publication-quality SVG figures for research artifacts of any kind — papers, proposals, talks, posters, blog posts. Works across subfields; nothing about the workflow assumes a specific domain.

The skill has four pieces:

1. A **workflow** that goes: get a reference and the story → sketch 3–5 candidates in an HTML viewer → iterate on the chosen one with a render-and-look loop → export.
2. **Design principles** (one concept per panel, show-don't-tell, color semantics, tight bounds, cross-panel alignment).
3. **A library of building-block patterns** (hub-and-spokes, ✗/✓ comparisons, chain-of-icons, donut gauges, per-category bars, stacked-card icon, etc.).
4. A **self-improvement loop** — at the end of every session, propose 1–3 short principles to add to this SKILL.md based on what the user chose and what they pushed back on. The skill should drift toward this user's aesthetic over time.

## The non-negotiable habit: render and look

Render the SVG to a PNG and look at it before showing the user. Always. Most figure problems — overflow, misaligned labels, chips poking out of panels, glyphs that render strangely, overlapping shapes — are invisible in raw SVG and immediate in the rendered image. The cost is one bash call.

```bash
python scripts/render_svg.py figure.svg
```

That writes `figure.png` (~2000px wide) next to the input. Open it with the file tool, scan it, then iterate. Do this every time you change the SVG — not just at the end. When the figure is final, the same script produces a vector PDF and a hi-res PNG (see "Export").

## Workflow

### Phase 1 — Reference and story

Two things to extract from the user before drawing anything. Skipping either is the most common reason a figure goes sideways.

**Get a reference.** Ask: "Is there a paper figure or existing diagram whose look-and-feel you want to match?" If yes, study it: panel structure, background tints, line styles, branching conventions, icon vocabulary, arrow styles. You're going to inherit its visual language. If the user has no reference, look for one in the relevant subfield (a well-known paper, a textbook figure) and confirm it.

**Get the story in three bullets.** A research figure is an argument, not decoration. Pin down: *what* (the object of study or method), *how* (what we do with it), *what we expect to show* (the outcome). For an overview figure these often map directly to three panels.

Until you can write those three bullets in plain language, don't draw.

### Phase 2 — Sketch 3–5 candidates in an HTML viewer

This is the most important deliverable of the early session. Don't commit to one design before the user sees options. Build a single HTML file with 3–5 low-fidelity SVG sketches, each annotated with what it emphasizes. Examples of candidates to include:

- **Pipeline** — left-to-right panels with arrows between them, each panel one phase.
- **Quadrant / 2-axis chart** — for "position our work relative to prior work."
- **Stack / layered** — for "the same idea operating at multiple scales (foundation → agent, single-cell → tissue, etc.)."
- **Hub / radial** — for "combine N inputs into a single object."
- **Running example with two outcomes** — single concrete scenario with red (problem) and green (solution) branches.
- **Lettered panels (a/b/c/d/e)** — paper-figure style for "here are several conditions/scenarios."
- **Method-dominant** — big central method panel flanked by smaller setup / result panels.
- **Two-axis grid** — for "conditions × methods" comparisons.

Each sketch should be small and quick — under 30 lines of SVG. Put them in the same HTML file with short captions describing what each emphasizes. Then present the HTML and let the user choose a direction.

The HTML template at `references/viewer_template.html` is a good starting point: title bar at top, sticky navigation chips, one card per candidate with badge + heading + figure-wrap. Each card holds an SVG.

This step is non-optional even when the user seems to want one specific thing. Almost every time, seeing the alternatives reveals that the user's first instinct wasn't quite what they wanted.

### Phase 3 — Iterate on the chosen design

Once the user picks a direction, build out the chosen sketch with real content. The loop:

1. Apply user feedback / next chunk of content to the SVG.
2. Render to PNG with `scripts/render_svg.py`.
3. Read the PNG yourself.
4. Note overflow, misalignment, weird glyphs, overlap, or aesthetic issues.
5. Fix those silently (don't show the user an obviously-broken render).
6. Show the user the result; tell them what changed and what you noticed.
7. Repeat.

When the user gives multiple fixes in one message, batch them — apply all of them, render once, show one updated PNG. Not five.

When you're unsure between two paths ("should this example be code review or citation? should the bar chart show reduction or remaining?"), don't guess. Offer 2–3 short options as text, let the user pick, then build.

### Phase 4 — Export

When the figure is final, produce three exports together:

```bash
python scripts/render_svg.py figure.svg --all
```

This writes:

1. `figure.pdf` — vector, best for LaTeX / Word inclusion. Drop in as `\includegraphics{figure.pdf}` and stays crisp at any scale. **Recommend this as the default for paper / proposal submissions.**
2. `figure_hires.png` — ~4000px wide, ~300 dpi at letter-width, for venues that don't accept vector.
3. `figure.png` — display-quality 2000px PNG for previews / Slack / quick sharing.

Present all three with a one-line note on which to use for which purpose.

## Design principles

**One concept per panel.** When a panel starts trying to do three things, split it or simplify. If the user asks to cram more in, ask which is most important and let the rest drop to a smaller area or appendix.

**Show, don't tell.** Words almost always lose to visual elements:

- Icons in place of nouns. A "transformer / neural network layer" can be a stack of horizontal bars; a "feature dictionary" can be a small grid of cells; a "cluster of neurons" can be a connected dot graph; an "agent trajectory" can be a user-bubble → gear → file → bubble linked with arrows; a "bundle of N existing things" can be four overlapping rectangles with `×N` on top.
- Charts instead of bullet lists. Per-category outcomes → horizontal bars. Headline numbers → donut gauges. "We tested across N variants" → N dots clustered with `N/N`.
- Color-coded chips encode a taxonomy. Each color carries meaning across the whole figure.
- Vectors / arrows radiating into a central object encode "combine into one thing."

**Color semantics.** Pick a palette and apply it consistently across the entire figure. The defaults below work well for technical subjects; adjust for your subfield's conventions (e.g., biology often uses tissue-specific palettes).

| color | hex (stroke / fill) | meaning |
|---|---|---|
| red / pink | `#c2455a` / `#fde7ec` | problem state, baseline, "before", negative outcome |
| green | `#2e8b57` / `#e3f3ea` | solution state, our result, "after", positive outcome |
| purple | `#6e4ea3` / `#ece4f6` | the method / object / thing the project contributes |
| blue | `#3a6ea5` / `#e8f1fb` | data, foundational concepts, inputs |
| amber | `#7a5410` / `#fbf0d7` | warnings, environmental pressure, external systems |
| slate | `#5b6b87` | neutral labels, dividers, secondary text |

**Tight bounds.** Every element fits inside its panel with ~10–14 px of margin. SVG transforms stack (panel translate → section translate → group translate), so it's easy to miscount and drop an element off the edge. After every layout change, render and inspect the borders. If you're tempted to push something past a panel edge, change the design — shorten a label, drop a subtitle, shrink a chip.

**Cross-panel alignment.** Related elements across panels should sit at the same y (or x) coordinate. If the source-icon labels in panel 2 are at y=393, the corresponding gauge labels in panel 3 should also be at y=393. Costs nothing visually; makes the figure feel intentional. When the user says "align X with Y," compute exact coordinates — `panel_translate + section_translate + group_translate + element_y` — instead of eyeballing.

**Use the user's actual vocabulary.** Don't invent generic terms. If they have specific method names, dataset names, or technical category definitions, use them verbatim. The figure should look like a person who is part of that subfield drew it.

## Building-block patterns

A library of patterns that come up repeatedly. Reach for these first.

- **Pipeline of N panels** — equal-width rectangles, arrow between each pair, one concept per panel.
- **Hub-and-spokes** — central circle with the unified object; chips on spokes for the inputs; colored arrows pointing inward. Two arrow styles (solid vs. dashed, full-color vs. red) can distinguish "combined into" vs. "orthogonalized against / contrasted with."
- **Definition card stack** — vertical bar in the category color on the left of a white rectangle, name in bold, definition in slate, italic example to the right. Repeat for a taxonomy.
- **Before/after with ✗ / ✓** — two stacked rectangles, light pink for ✗ + light green for ✓, bold red ✗ / green ✓ symbol at left, italic example text to the right. Header above describes the setting in italic.
- **Chain-of-icons** for sequences (agent trajectories, pipelines, workflows) — bubble → gear → file → terminal → bubble, connected by light arrows.
- **Stacked-card icon** for "N existing things." Four overlapping rounded rectangles with `×N` centered on top.
- **Donut gauges** for headline percentages — outer light track, inner colored arc, big bold % in the center, small label below.
- **Per-category bars with baseline tick** — pink track + green "ours" bar + thin vertical slate tick marking the best baseline. Subtitle: *(longer = better →)*.
- **2×2 quadrant** with axis labels at ends, prior work as gray dots, our work as a star in the target quadrant.

`references/example_proposal_figure1.svg` is a concrete worked example that uses many of these patterns together. Read it when in doubt about how a pattern looks in practice.

## Common pitfalls

These come up over and over; check for them on every render.

- **Combining-mark glyphs render strangely.** Letters with combining marks (e.g., `v⃗`, `x̄`) often render badly in cairosvg and many font stacks. Use plain words ("honesty vector", "mean x") or draw the mark as a separate SVG path.
- **Drawn-over rectangles disappear.** If a darker rectangle is drawn after a lighter one at the same `x, y, width, height`, only the darker shows. To show both, draw them side-by-side at non-overlapping `x` ranges, or use a vertical tick mark instead of overlapping bars.
- **Long subtitles eat horizontal room.** Long descriptive text next to a `+` symbol or a sibling chip can quietly push elements into each other. Shorten the subtitle, split into two lines, or move elements; iterate.
- **Gauge labels under donuts drop off the panel.** Donut radius + stroke + label-gap can quietly exceed 50 px; verify the bottom-most label is inside the panel before declaring done.
- **Bar charts that look like growth when they should show reduction.** If "longer green = more reduction = better," make that explicit (subtitle `*"longer = better →"*`, or flip to a "shorter = better" presentation).
- **Empty space on one side of a panel.** Usually means elements are clustered to one side; spread them evenly, or use the space for a small complementary visual.
- **Chips overflowing the panel because of hub geometry.** When chips ring a central hub, their outer edges sit at `hub_center ± (chip_offset + chip_width)`. It's easy to set those values larger than the panel half-width. Compute carefully.

## Iteration etiquette

The user will give specific, surgical feedback ("move the + a bit more left, and the new box too" / "drop the v⃗ glyph" / "align this with that"). Apply the change, render to PNG, look at the result, and report what you actually *see* in the rendered output — not just what you typed into the SVG. If the change introduced a new problem, fix it before showing.

Batch multiple fixes from one message into one updated render.

When uncertain between two design paths, offer 2–3 short options as text rather than guessing. The user will pick faster than they will critique your wrong choice.

## Self-improvement: this skill should drift toward the user

This skill is meant to get better at matching this particular user's taste over time. At the end of a substantive session — meaningful feedback exchanged, a final figure produced — propose 1–3 short principles to add to this SKILL.md based on what the user chose and what they pushed back on. The point is not to record everything; the point is to capture *latent preferences* the user has revealed.

Things worth encoding:

- A reusable pattern preference. "User prefers minus-in-circle markers over crossed-out arrows for orthogonalize relationships."
- A taste anti-pattern. "User dislikes dense charts with numeric labels at the end of every bar; prefers visualizations to speak for themselves."
- A vocabulary choice. "User dislikes the `v⃗` glyph (combining mark); use plain words instead."
- A workflow preference. "User wants 3–5 layout candidates in an HTML viewer before committing to one design."
- A specific palette tweak or color preference.

Things not worth encoding:

- One-off content choices specific to a single figure ("the example was about auth code").
- Things any reasonable designer would already do.
- Vague aesthetic adjectives without a corresponding rule.

How to do it. After the session reaches a stable end-state, write a short proposal to the user:

> Based on this session, here are 2 principles I'd like to add to this skill so future figures lean closer to what you want:
>
> 1. *short principle, ≤ 1 sentence*
> 2. *short principle, ≤ 1 sentence*
>
> OK to add these?

If the user approves, edit `SKILL.md` to add them under the "User preferences (learned)" section below. Keep entries short — one bullet each. If you ever notice an entry is contradicted by later feedback, remove or revise it; don't accumulate stale rules.

### User preferences (learned)

*(This section is intentionally empty at install time. Entries get added over time based on the user's actual choices. Each entry should be a single short bullet.)*

## References

- `references/example_proposal_figure1.svg` — a worked example: 3-panel proposal Figure 1 covering a benchmark, a method, and results. Useful concrete reference for the 3-panel layout, the hub diagram, ✗/✓ comparison pairs, per-category bars with baseline tick, and donut gauges. Open it when you want to see how a given pattern looks in practice. **This is one example, not a template** — many figures will use a different overall structure entirely.
- `references/viewer_template.html` — minimal HTML template for the Phase-2 multi-candidate viewer. Drop your candidate SVGs in as cards.
- `scripts/render_svg.py` — renders the SVG to PNG (default), PNG-hires, PDF, or all three.
