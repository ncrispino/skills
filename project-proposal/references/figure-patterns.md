# Figure patterns

Reusable SVG shapes for proposals. All use the classes in `_assets/proposal.css` so they theme and export correctly. The template itself already contains five working patterns; copy from there first:

| pattern | template figure id | use for |
|---|---|---|
| 3-panel problem → approach → result | `fig-overview` | Figure 1 |
| adversary → boundary → asset | `fig-threat` | threat model |
| staircase of rungs with gates | `fig-ladder` | start-simple ladder |
| left-to-right pipeline + provenance bar | `fig-infra` | infrastructure |
| bar ordering with HYPOTHETICAL tag | `fig-expected` | expected results |

Every figure needs an arrow marker in `<defs>`; give each marker a unique id per figure (`ah`, `ah2`, …) because ids are page-global.

## Conditions × ablations grid

Shows the experiment matrix at a glance; cell color = status or expected outcome. Useful when the budget table is large.

```html
<figure id="fig-grid">
<svg viewBox="0 0 800 200" role="img" aria-label="Experiment grid">
  <text class="t-s" x="160" y="24">seed 1</text><text class="t-s" x="260" y="24">seed 2</text><text class="t-s" x="360" y="24">seed 3</text>
  <text class="t" x="10" y="58">R1 baseline</text>
  <rect class="b-red" x="150" y="40" width="80" height="28" rx="4" data-tip="R1, seed 1"/>
  <!-- repeat per cell; b-paper dash = not yet run, b-green = done, b-amber = failed -->
</svg>
<figcaption><b>Figure N.</b> Experiment matrix.</figcaption>
</figure>
```

## Timeline with gates

Horizontal weeks, bars for work, diamonds for decision gates.

```html
<svg viewBox="0 0 800 120">
  <path class="ln" d="M20,90 L780,90"/>
  <text class="t-s" x="20" y="110">wk1</text><text class="t-s" x="210" y="110">wk2</text>
  <rect class="b-blue" x="20" y="30" width="180" height="22" rx="4"/><text class="t-s" x="28" y="46">infra + R0/R1</text>
  <path class="b-amber" d="M205,80 l8,-8 l8,8 l-8,8 z" data-tip="Gate: R1 headroom exists"/>
</svg>
```

## Add new patterns here

When a figure shape gets reused across two proposals, paste a trimmed version here with one line on when to use it.
