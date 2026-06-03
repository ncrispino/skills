---
name: skill-creator
description: Create a new skill from scratch, or modify and improve an existing skill. Use when the user says "make this a skill", "turn this workflow into a skill", "create a skill for X", "improve/fix the Y skill", or when the spotter has flagged a skill-worthy workflow to capture. Every skill produced or touched gets a self-improvement section so it keeps getting better as it's used. Reach for evolving-skill-creator instead when you're capturing a scripty, recurring workflow as a living plan at the start of a task. For rigorous eval/benchmark/description-optimization tooling, this defers to the canonical Anthropic skill-creator; for organizing/merging a crowded library, hand to skill-organizer.
---

# Skill Creator

Create new skills and iteratively improve existing ones. This builds on the canonical Anthropic `skill-creator` (see "Going deeper" below) and adds one thing that's easy to forget but central to a learning system: **every skill should carry the seed of its own improvement.** A skill that never changes after creation is a snapshot; a skill that nudges itself each time it's used is what makes a library compound.

Where this fits in the lifecycle: [[workflow-to-skill-spotter]] decides *whether* to make a skill → this skill *makes or improves* a polished one (its sibling [[evolving-skill-creator]] instead captures a scripty, recurring workflow as a living plan up front, before the work) → [[skill-organizer]] *dedupes and catalogs* the library.

## The loop

Creating a skill is a loop, and your job is to figure out where the user is in it and jump in:

1. Decide what the skill should do and roughly how.
2. Write a draft SKILL.md.
3. Try it on a couple of realistic prompts (with the skill vs. without).
4. Look at the results with the user, qualitatively and — where the output is objectively checkable — quantitatively.
5. Rewrite based on what you saw. Repeat until it's good.

Be flexible about rigor. If the user says "just vibe with me, I don't need benchmarks," skip the eval machinery and iterate by feel. If they want hard numbers, use the canonical tooling. Match the user's coding fluency in how you talk — explain "assertion" or "JSON" only if they need it.

## 1. Capture intent

Start from what the user actually wants the skill to do. **If a workflow was just performed in this conversation** — the common case when [[workflow-to-skill-spotter]] hands off — mine the history first instead of re-interviewing: the tools used, the order of steps, the corrections the user made, the input/output formats you observed, and any helper scripts written. Draft from that, then confirm gaps with the user.

Pin down four things:

1. **What** should this skill let the model do?
2. **When** should it trigger — what phrasings and contexts? (This becomes the description.)
3. **What's the output** — format, files, structure?
4. **Does it need tests?** Objectively verifiable outputs (file transforms, data extraction, fixed-step workflows) benefit from test cases. Subjective outputs (writing voice, visual design) usually don't — judge them by eye. Suggest the right default, let the user decide.

Generalize as you go. The spotter flags an *instance* ("migrate the users table"); your job is to capture the *type* ("batch-migrate a DB table with audit logging"). A skill that only works for the exact inputs you just saw is worthless — it'll never match a future task.

## 2. Write the SKILL.md

### Anatomy

```
skill-name/
├── SKILL.md (required)          # YAML frontmatter (name, description) + markdown body
└── (optional bundled resources)
    ├── scripts/     - executable code for deterministic/repetitive steps
    ├── references/  - docs loaded only when needed
    └── assets/      - files used in output (templates, fonts, icons)
```

### Progressive disclosure

Skills load in three levels — respect them so context stays cheap:

1. **Metadata** (name + description): always in context (~100 words). This is the trigger.
2. **SKILL.md body**: loaded when the skill fires (aim under ~500 lines).
3. **Bundled resources**: loaded/executed only on demand (unlimited).

If the body pushes past ~500 lines, add a layer of hierarchy — move details into `references/` and point to them clearly ("read `references/aws.md` when deploying to AWS"). For multi-domain skills, organize by variant so the model reads only the relevant file.

### The description is the trigger — make it pushy

The description is the *only* thing the model sees when deciding whether to use the skill, so it must say both **what it does** and **specific contexts for when to use it** — all the "when to use" info lives here, not in the body. Models tend to *under*-trigger skills, so lean pushy. Instead of "Build a dashboard for internal data," write "Build a dashboard for internal data. Use this whenever the user mentions dashboards, metrics, data visualization, or wants to display company data — even if they don't say 'dashboard.'" After the skill is solid, the canonical tooling can optimize this further (see "Going deeper").

### Writing style: explain the why

This matters more than any other writing rule. Today's models have strong theory of mind — given the *reason* behind an instruction, they'll generalize it correctly to situations you didn't foresee. Given a bare `ALWAYS` / `NEVER`, they follow it rigidly and break on the edge cases. So every rule should carry its reason: what failure it prevents, what value it delivers. If you catch yourself writing all-caps MUSTs or rigid templates, that's a yellow flag — reframe as reasoning the model can understand.

A few more habits:
- **Imperative voice.** "Render the SVG and inspect it before showing the user," not "the SVG should be rendered."
- **Generalize, don't overfit.** Instructions general enough to cover the class of task; examples to illustrate, never to pin behavior to one case.
- **Keep it lean.** Drop anything not pulling its weight. Write a draft, reread it with fresh eyes, cut.
- **No surprises.** A skill's contents must match what its description implies; never build skills for malware, unauthorized access, exfiltration, or deception.

## 3. Add a self-improvement section to every skill

**Every skill you create or substantially edit gets a self-improvement section, tailored to that skill.** Treat this as a default you skip only with a specific reason — it's the addition that makes the library a *learning* system rather than a static one. The principle: a skill should drift toward this user and this domain each time it's used, so the next run starts from everything the last run learned.

Stamp this section near the end of the SKILL.md, then adapt it:

```markdown
## Self-improvement: this skill should drift toward the user

This skill is meant to get sharper each time it's used. At the end of a substantive
session using it, take one beat: did anything reveal a durable preference, a repeated
correction, a gotcha and its fix, or a better approach that future runs should inherit?

If yes, propose 1–3 short additions to the user:

> Based on this session, I'd add these to the skill so it works better next time:
> 1. <≤ 1 sentence>
>
> OK to add?

On approval, edit this SKILL.md — add bullets under "Learned preferences" below, tighten
an instruction, or bundle a script that got written ad hoc. Keep it lean: encode latent
preferences and reusable patterns, not one-off content choices or things any competent
practitioner already does. If a later session contradicts an entry, revise or delete it —
don't accumulate stale rules.

### Learned preferences
*(Empty at creation. Grows as the skill is used.)*
```

**Tailor it — don't paste it verbatim.** The wording should fit the skill's domain so it actually fires:
- For a **code/workflow** skill, point at the concrete artifacts: "if a session writes a helper script that resembles one written before, bundle it under `scripts/`"; "encode build/config gotchas and their fixes."
- For a **writing/design** skill, point at taste: "encode tone, structure, and vocabulary the user keeps steering toward; record anti-patterns they push back on" (see [[research-figure-design]] for a worked example of this kind of drift).
- For a **judgment/routing** skill (like [[workflow-to-skill-spotter]]), point at calibration: "tune thresholds when you over- or under-fire."
- Name the learned-knowledge section to match what's actually accumulating ("Learned preferences", "Gotchas", "Bundled patterns").

The bar for what to encode is the same everywhere: durable and reusable, not one-off; latent preference revealed by the session, not anything a competent run already does. Skills that hoard stale rules get worse, not better — pruning is part of the loop.

## 4. Test and iterate

For skills with checkable outputs, run a couple of realistic prompts both with and without the skill, look at the difference with the user, and rewrite based on what you see. Read the *transcripts*, not just the final outputs — if every test run independently wrote the same helper script or took the same detour, that's a signal to bundle the script or fix the instructions. Generalize from feedback rather than bolting on overfit patches; when a stubborn issue resists, try a different metaphor or framing instead of a heavier MUST.

Keep iterating until the user's happy, the feedback's all positive, or you've stopped making meaningful progress.

For subjective skills, skip formal evals and iterate by eye with the user — forcing assertions onto matters of taste produces noise.

## 5. Hand off to the organizer

After creating a skill — especially if it's adjacent to existing ones, or the library is getting large — run [[skill-organizer]] to check for overlap, merge near-duplicates, and refresh `SKILL_REGISTRY.md`. Creation adds; organization keeps the set selectable.

## Going deeper: the canonical skill-creator

For the rigorous parts — spawning with-skill vs. baseline runs in parallel, drafting assertions, grading, aggregating a benchmark, the HTML eval viewer, blind A/B comparison, automated **description optimization** (`run_loop.py`), and packaging a `.skill` file — defer to the canonical Anthropic skill-creator at:

```
~/.claude/plugins/marketplaces/anthropic-agent-skills/skills/skill-creator/SKILL.md
```

It ships the supporting scripts (`scripts/aggregate_benchmark.py`, `eval-viewer/generate_review.py`, `scripts/run_loop.py`) and reference schemas. Use it when the user wants hard numbers, an optimized trigger description, or a packaged artifact. This skill owns intent capture, lean SKILL.md authoring, the self-improvement mandate, and the lifecycle handoffs; that one owns the eval/benchmark/packaging machinery. They compose.

## Self-improvement: this skill should drift toward the user

This skill is meant to get sharper each time it's used. At the end of a substantive session using it, take one beat: did anything reveal a durable preference about how *this user* likes their skills built — naming conventions, how aggressive descriptions should be, how much eval rigor they want by default, recurring SKILL.md structures worth templating?

If yes, propose 1–3 short additions to the user:

> Based on this session, I'd add these so skill creation matches how you work:
> 1. <≤ 1 sentence>
>
> OK to add?

On approval, add bullets under "Learned preferences" below or adjust the guidance above. Keep it lean; prune entries that later prove wrong.

### Learned preferences
*(Empty at install. Grows as this skill is used.)*
