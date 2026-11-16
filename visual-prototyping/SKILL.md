---
name: visual-prototyping
description: "Design any visual HTML (a viewer, dashboard, report page, results page, tool UI, figure-heavy explainer) by building switchable prototypes on realistic sample data and narrowing with the owner, instead of designing in words or shipping one guess. Use whenever the user says 'give me prototypes', 'a handful of options', 'this looks mid / bare / crowded / hard to read', 'redesign this page', 'how should we show X', asks to rework a section of an existing page, or is about to change a real UI whose look is not settled, even if they do not say 'prototype'. Also use to run a colour-blindness pass or a fresh-eyes review on a page. Skip for a one-line style fix the user fully specified."
---

# Visual prototyping

The owner cannot judge a design from a description, and one finished design is a guess. So: build a **working page on sample data**, put **several real alternatives behind a switch**, let the owner click through them, **lock each choice and delete the losers**, and only then touch production code. This skill is that loop and the habits that make it fast.

## The loop

0. **Start from today's page.** Screenshot it in the state the owner complained about (find a data example that actually shows the problem), and save the shots with a short note of what is wrong in the owner's words. Then **list everything the current page lets a reader do** (select, compare, diff, expand, link out) and treat it as a keep-list: a variant that drops one must say so. Restyles that silently lose a feature are the most common wasted round.
1. **Scope one question at a time.** "The whole page" first (a few layouts), then, once a layout is chosen, one region per round: the top block, the timeline, the controls, the legend, a detail view. Small rounds get clear answers; a round that varies five things gets "I like bits of each". One question per switch; at most two independent switches live in a round, and then check at least one combination of them.
2. **Build variants behind a switch.** Each open question gets a small "Prototype: <thing> 1 2 3 4" switch on the page itself, next to the region it changes, plus a URL parameter (`?top=2`). Variant 1 is always today's version so the owner can compare.
3. **Verify by looking.** Never publish a page you have not rendered, and never claim something works from the code alone. For each variant open at least: at rest, one opened/active state, and phone width, alternating themes. Shoot interactive states at a laptop viewport (about 1440x900) as well as full-page: tall shots hide that a readout sits below the fold or that the clicked thing jumped.
4. **Publish and describe.** One stable link, republished each round. In the message: one line per variant saying what it is and its trade-off, your pick with the reason, and a plain "not verified" list.
5. **Lock and prune.** When the owner picks, make it the only version: remove the switch, the URL parameter, the stored preference and the losing variants' code. Leftover options rot and confuse the next round.
6. **Repeat** on the next region. Carry a short list of still-open choices at the end of every message so nothing is forgotten.
7. **Port last.** Production code changes only after the choices are made. Before porting, write down what the design needs from the data that the real data does not have yet (see "Data needs").

## Setting up the prototype

- **A separate folder, not the real app.** Self-contained HTML built by a tiny script from a source page, small modules and sample JSON. No framework unless the real app forces one. State up front that nothing in the production source changes yet.
- **Realistic sample data.** Synthetic, but shaped like the real record and with the awkward cases in it: long names, empty states, a failure, an unknown, a tie, many items at the same moment, a row with nothing to show. If a variant is being designed against data that has no interesting case (every version "no change"), extend the sample minimally and say so.
- **Variants as modules with a registry.** One file pair per variant (`top2.js` / `top2.css`) registering into `window.Tops['2'] = { name, render(root, api) }`. A missing or throwing variant falls back to variant 1 with a one-line notice. This lets parallel agents add variants without editing the same file.
- **A small shared API** (`renderFigure`, `openCard`, `events()`, a focus/hover bus) documented in one `API.md`, so variants reuse building blocks instead of redrawing them.
- **A build self-check.** The build opens the page once headless and fails on a console error, an empty cell, sideways scroll, or a variant that fell back. Give screenshot URLs a probe flag that reports overflow, so a stale or broken shot is caught without opening it.
- **Stored preferences bite.** A URL parameter always beats a remembered choice; wrap storage in try/catch; when a default changes or a variant is locked, rename the storage key. If the owner "cannot see" a variant, suspect remembered state first. Check a new parameter name is not already taken.
- **Every state reachable by URL.** `?now=`, `?open=`, `?theme=`, `?play=1`, a preset for each hover/selected/expanded state. Screenshots and review depend on it; so does the owner sending you "look at this state".
- **Screenshot scripts in the folder**: one shot by name and query, one for the standard set per section, one at phone width. Headless Chrome is enough. Keep these tools in the folder, not in a temp directory that a restart wipes.
- **Commit the sources in round one**, not when the owner has to ask (not the screenshots; they are large and regenerable). If the working folder is git-ignored, copy the sources to a tracked path on a new branch in a separate temporary worktree, so the owner's checkout is untouched. Scan sample data for secrets first. Commit after each round; push when the owner asks.
- **Sample data hygiene.** One shared sample for all variants. Edge cases that would empty the main story (everything failed, everything unknown) live in sibling sample files reachable by URL. Label invented content as a sample on the page.
- **Headless Chrome gotchas.** The window will not go below about 500px, so phone width needs an iframe or device emulation. A screenshot shows the top of the page whatever the scroll. Virtual time does not finish smooth scrolling or animation; use real time over the DevTools protocol. Preset states do not exercise `:hover`. Agents building in parallel overwrite the same built file and the same shot names: shoot from a private copy and name shots per variant. A driver must kill its browser when it throws.

## What makes a good set of variants

- **Genuinely different ideas**, each with a one-line thesis ("structured brief", "figure-led", "compact with tabs"), not three paddings of one idea.
- **Three or four**, plus today's. Two is a coin flip; six is homework.
- **Each complete enough to judge**: real content, both themes, hover and selected states, phone width. A variant that only works at one size is not a candidate.
- **Offer a combination round.** Owners often like parts of two variants. Build a new variant that merges them rather than asking them to choose.
- **Test the organising idea against the data's shape before building**: many-to-many (an item that belongs to several actors), several items in one cell, and zero. An idea that breaks on one of these is not a candidate.
- **Keep the rest of the page still** while one region varies, so the comparison is about that region.
- When the owner says something is "mid" or "bare" without specifics, do not ask what they mean; name the likely causes yourself (empty space, no first thing to read, repeated information, too many type sizes, parts that do not connect) and build variants that each attack them differently.

## Reading a page for problems

Run through these before proposing variants, and name what you find:

- **Progressive disclosure is the default**: at rest, one mark or word per cell, a short answer, and detail on request. Turn a vague complaint ("too much text", "ugly", "not crisp") into measurable at-rest rules for the round (a word budget for the page, three text sizes, a fixed set of marks) and have the build measure them.
- **First thing to read**: is there one? Does the page state its answer before its evidence?
- **Repetition**: the same fact shown per column, per row, per card. State common facts once.
- **Equal space for unequal things**: unchanged items as big as changed ones; quiet states as loud as important ones.
- **Explanation missing**: marks and controls without the sentence that says what is going on. The prose that explains is usually the main readout, not decoration.
- **Distance**: a legend far from its marks, a control far from what it changes, a caption below the fold.
- **Boxes and words**: every border, pill and keycap is a thing to read. Remove before adding.
- **Type roles**: more than three or four sizes/weights in one region reads as noise.
- **Alignment**: columns that end at different heights, a region that breaks the page's left edge.
- **One word per concept** across the whole page (not "Tried" here and "Attempted" there), and one time/value per thing wherever it appears.
- **Stubs read as broken**: a placeholder thumbnail, an empty tab, a half-page "Select something" void. Design the empty and unselected states.
- **Affordance**: a control should show that it is clickable and what it holds before the click.
- **Small text**: nothing under 12px; the words that carry the answer at body size.
- **Undefined terms**: any internal word a newcomer would not know needs a hover definition and a glossary entry; a renamed label keeps the old term visible as a hint.

## Colour, shape and accessibility

- **Colours are tokens**, defined for light and dark, with a theme toggle. Design both themes; do not invert.
- **A fixed vocabulary**: one meaning per colour across the whole page (for example category = hue, strength = fill). Do not spend a meaningful colour on something else because it looks nice; use neutral ink with weight or a glyph instead.
- **Never rely on hue alone.** Give each category a shape as well (circle, diamond, triangle), each level a fill (filled, hollow, "?"), and write the name wherever a coloured dot would otherwise stand alone.
- **Colour-blindness pass**: add a `?cvd=protan|deutan|tritan|achroma` switch (an SVG `feColorMatrix` on the root) and look at the key screens under each, in both themes. A small script that prints colour differences for the important pairs before and after a palette change keeps this honest. Report which pairs still depend on shape or text.
- **Equal weight for equal things**: marks of different shapes need equal area, not equal width; check paired labels for size, weight and contrast in both themes.
- **Quiet states stay quiet**: "unclear" or "not found" must rank below the real findings in emphasis; a filled badge with a "?" is louder than a dot.
- **Motion**: anything that plays needs pause, keyboard control and a reduced-motion path; changing text should cross-fade at a fixed height, not jump the layout.

## Interaction habits that held up

- **Detail on request, near the thing**: a floating card anchored to what was clicked beats navigating away, a permanently open panel, or rows that open below the row. Use it everywhere detail opens, not in some places. Clamp it to the viewport and the content edge, keep its head and foot fixed while the body scrolls, return focus on close, and check it separates from the page in the dark theme.
- **Linked highlighting**: hovering a row lights its mark and the reverse; hovering a text label lights its part of a figure. This is what makes a page feel connected.
- **A walk-through for anything chronological**: chapters to jump between, a draggable playhead, a Play that keeps going until told to stop, and the explaining sentence for the current chapter as the readout.
- **One compact control line**; key hints in hover text or one muted line, not a keycap in every button.
- **The page must not jump**: fixed panel heights, scroll at most once to bring a readout into view, no layout shift on close.
- **A key/legend as a caption** next to the graphic, sharing a line where it can, with a "Key" card for the full explanation.

## Working with agents on a round

### Pick the scale

| Round | Use | Why |
| --- | --- | --- |
| A tweak to a locked design (resize a button, move a legend, lock a pick and prune) | Do it yourself, or one subagent | One writer, no coordination needed |
| A few variants of one small region, or a follow-up round on work an agent already knows | **One subagent, continued across rounds** (send it the next round as a message rather than spawning a new one) | It keeps the code map in its context; briefing a fresh agent each round costs more than it saves |
| Several variants of a large region, a whole-page layout round, or two independent regions at once | **A multi-agent workflow** (below) | Variants are independent, so they build in parallel; a critic who has not seen the reasoning catches what the builders cannot |

Only run a multi-agent workflow when the owner has opted into that scale (they asked for a workflow or for agents, or have said so for this project). Otherwise say what it would do and roughly what it costs, and ask.

A long-lived subagent can be cut off by a server error or run its context long. If it fails, resume it with "check the folder's state, then finish the round as briefed"; if it starts losing the thread, start a fresh one and point it at `API.md` and the last round's final message.

### The workflow shape

Five phases. The first and the last three are single agents; only the variant phase fans out.

1. **Core** (one agent). Sets up or extends what every variant shares: the registry and switch for this round's question, the shared building blocks, new URL presets, screenshot sections, and `API.md`. It also does the round's page-wide chores (locking earlier picks, a palette change). It returns the contract variants must follow. Nothing fans out until this is done, or variants will each invent their own.
2. **Variants** (one agent per variant, in parallel). Each owns exactly its own file pair and may not edit shared files; if it needs something from the core it says so in its result instead of patching it. Each gets its thesis in one line, the owner's words quoted, and the states to screenshot.
3. **Integrate** (one agent). Wires every variant into the build and switch, resolves what variants asked of the core, runs the build's self-check and the full screenshot set, and fixes anything that does not load.
4. **Critique** (one fresh agent, structured output). Sees the built page and screenshots, not the builders' notes. Drives the page with real input. Returns a score, a ranking of the variants with reasons, defects with severity, and what it did not check. Tell it who the reader is and what the owner complained about.
5. **Fix** (one agent). Fixes critical and high defects, lists what it left and why, and re-shoots what it changed.

Then you open the key screenshots yourself, publish, and report.

Rules that the first runs taught:
- **A failed prerequisite stops the fan-out.** If the core or shared-data step fails or is refused, halt and fix it (write the sample data yourself if need be); variants that each improvise a stand-in have to be merged later.
- **The owner outranks the critic.** Put the owner's standing asks in every brief as a "do not undo" list. The critic's ranking is advice for your recommendation, never a filter on what the owner gets to see; owners regularly pick what the critic ranked last.
- **Cap critique-and-fix at two passes.** The score plateaus and is not the owner's verdict. When reporting, say whether a score was given before or after the fixes, and say if a time box was overrun.

A skeleton for the Workflow tool (plain JavaScript; adapt the prompts):

```js
export const meta = {
  name: 'prototype-round',
  description: 'One visual-prototyping round: shared core, parallel variants, integrate, fresh critique, fix',
  phases: [{ title: 'Core' }, { title: 'Variants' }, { title: 'Integrate' }, { title: 'Critique' }, { title: 'Fix' }],
}
const DIR = args.dir            // the prototype folder
const RULES = args.rules        // what is forbidden, house rules, how to build and shoot
const VARIANTS = args.variants  // [{ key: 'top2', thesis: '...' }, ...]

phase('Core')
const core = await agent(`${RULES}\nIn ${DIR}: ${args.coreBrief}\nReturn the contract variants must follow and the files they may create.`, { label: 'core' })

phase('Variants')
const built = await parallel(VARIANTS.map(v => () =>
  agent(`${RULES}\nContract from the core step:\n${core}\nBuild ONLY ${v.key}.js/.css in ${DIR}. Thesis: ${v.thesis}\nOwner's words: ${args.ownerWords}\nDo not edit shared files; list anything you need from them.`,
    { label: v.key, phase: 'Variants' })))

phase('Integrate')
const integrated = await agent(`${RULES}\nWire these variants into the build and the switch, satisfy their requests, run the self-check and all screenshots, fix what fails:\n${built.filter(Boolean).join('\n---\n')}`, { label: 'integrate' })

phase('Critique')
const review = await agent(`You have not seen how this was built. Open the page in ${DIR} and its screenshots; drive it with real key presses and drags. Reader: ${args.reader}. Owner's complaint: ${args.ownerWords}. Rank the variants, list defects, say what you did not check.`,
  { label: 'critique', schema: { type: 'object', required: ['score', 'ranking', 'defects', 'not_checked'], properties: {
      score: { type: 'number' }, ranking: { type: 'string' }, not_checked: { type: 'string' },
      defects: { type: 'array', items: { type: 'object', required: ['severity', 'what'], properties: { severity: { type: 'string' }, what: { type: 'string' }, where: { type: 'string' } } } } } } })

phase('Fix')
const fixed = await agent(`${RULES}\nFix the critical and high defects, then the cheap ones. List what you left and why; re-shoot what you changed.\n${JSON.stringify(review)}`, { label: 'fix' })
return { core, integrated, review, fixed }
```

The variant phase is a barrier on purpose: integration needs all variants at once. Keep a round under about ten agents; if it needs more, it is two rounds.

### Habits for any agent on a round

- **Core first, then variants in parallel, then integrate, then a fresh critic, then fix.** The core step sets the registry and shared API; each variant agent owns its own files; the critic sees screenshots and the page, not your reasoning, and returns a score, a ranking and concrete defects.
- **Brief with the owner's words quoted**, the files to read first, what is locked, what is forbidden (production source, version control), and the exact states to screenshot.
- **Demand a "not verified" list** from every agent and pass it on; then open the key screenshots yourself before reporting. An agent's "fixed" is a claim until you have seen the shot.
- **Drive real input** (key presses, drags, timed playback) through the DevTools protocol for anything interactive; synthetic events and static presets miss scroll, focus and fold problems.
- **Watch the disk**: hundreds of screenshots and headless browser profiles add up. Check free space before a shot run, take the few shots a round needs, delete a removed variant's shots when locking, delete old review folders, and make sure a failed run leaves no browser behind.

## Reporting a round to the owner

- Lead with what is live and where (same link, new version; commit if pushed). Say where each new switch sits on the page.
- One bullet per variant: what it is, then its cost. Mark your pick and say why in a clause.
- Say what you decided on your own where the request left room, so it can be overturned.
- "Not verified" as its own short list.
- End with the open choices, numbered.
- Plain words. No internal names the owner did not see on the page.

## Data needs

Prototypes invent fields freely (a title per item, a one-line summary per chapter, a per-agent state at a time). Keep a running list of every field a chosen design depends on that the real data lacks, and fold it into the data spec before porting. A design that cannot be fed is not chosen yet.

## When to stop prototyping

- Every switch on the page is gone, or the owner says a remaining one can wait.
- The key screens have been seen at desktop and phone width, both themes, and under the colour-blindness switch.
- The data needs are written down.
Then port, and after porting update any docs or skills that describe the old page.

## Self-improvement: this skill should drift toward the user

At the end of a substantive session using this skill, take one beat: did the owner repeat a preference (a layout habit, a colour rule, a wording rule, how many options they want, how they like rounds reported), or did a gotcha cost time?

If yes, propose 1–3 short additions:

> Based on this session, I'd add these to the visual-prototyping skill:
> 1. <≤ 1 sentence>
>
> OK to add?

On approval, add bullets under "Learned preferences" below, or adjust the guidance above. Keep it lean and prune what later proves wrong.

### Learned preferences

- Prefers cutting boxes and words in place over a wholesale redesign; keep a format that works and fix its parts.
- Wants a figure that explains the subject near the top of a page, with text that links to it, rather than a table restating the same facts.
- Chosen patterns so far: lanes per actor with a shared time axis; chapters plus a scrubber with continuous Play; a media-player-style control line; a compact marks-only key under the graphic with a "Key" card.
- Status words such as "Passed" get bold neutral ink and a glyph, not a category colour.
- No underlines on labels at rest; show them on hover.
- Small text is a repeated complaint: raise sizes before the owner asks.
- In prose, colour a name sparingly and keep summary paragraphs short and wide.
- In a hover, the definition comes first, before any sub-list.
- When asked "what did you mean", name likely causes and build, but add one line inviting a correction.
