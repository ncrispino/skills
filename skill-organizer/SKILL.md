---
name: skill-organizer
description: Analyze, clean up, combine, and catalog all installed skills, and produce a compact SKILL_REGISTRY.md routing guide. Use when the skill library has grown large or messy, when near-duplicate or overlapping skills have accumulated, when the user says "organize/clean up my skills", "merge these skills", "are any of my skills redundant?", or after creating several new skills. Merges overlapping skills into richer parent skills, prunes dead ones, and keeps the library inside the size where skill selection still works well.
---

# Skill Organizer

Read all installed skills, find overlaps and confusable pairs, merge or prune where it helps, and produce a compact `SKILL_REGISTRY.md` that acts as a routing guide. This is the "clean" and "combine" stage of the lifecycle: [[workflow-to-skill-spotter]] decides what to capture → [[skill-creator]] builds it → this skill keeps the growing set coherent and selectable.

## Why this exists

As a rule of thumb, a model reliably selects from on the order of 50–100 skills; as the library grows past that, picking the right skill gets unreliable and near-duplicates start competing for the same trigger. Skills accumulate — from the spotter firing, from manual creation, from imports — so the library needs periodic pruning and merging to stay routable. This skill keeps it small, sharp, and easy to select over. Fewer rich skills beat many shallow overlapping ones.

## Where skills live

Check every location that contributes skills, since duplicates often hide across them:

- **This repo** — each top-level directory with a `SKILL.md` (e.g. `skill-creator/`, `research-figure-design/`).
- **User skills** — `~/.claude/skills/` (note: some entries there may be symlinks back into this repo or other projects; resolve them before treating two entries as distinct).
- **Any `SKILL_REGISTRY.md`** already present — that's the artifact you'll regenerate.

Read each skill's SKILL.md (at least frontmatter + body structure) to understand scope, quality, and overlap. Don't categorize by keyword or string similarity — use your actual understanding of what each skill does.

## Workflow

### 1. Inventory

List the skill directories across the locations above and read each SKILL.md. Note name, description, scope, quality of instructions, and what bundled resources (`scripts/`, `references/`, `assets/`) each carries.

### 2. Identify overlapping or confusable skills

Look for:
- Skills that do the same thing under slightly different names.
- Skills whose scopes substantially overlap, or where one is a subset of another.
- Skills that would be better as one broader skill with several sections.
- Near-duplicates spawned by different sessions capturing the same workflow twice.
- **Dead skills** — ones that never trigger, were superseded, or describe a one-off that should never have been a skill. Pruning is as valuable as merging.

### 3. Merge into richer parent skills

For each group of related skills, create one **parent skill** with sections per sub-capability:

1. Pick a broader, general name (e.g. `web-app-dev` over separate `react-frontend`, `node-backend`, `web-testing`).
2. Write one SKILL.md with clearly labeled sections, each self-contained enough that the model can read just that section for a focused task.
3. Move bundled resources (scripts, templates, references) from the merged skills into subdirectories of the parent.
4. Remove the redundant directories.

When merging, keep the version with better instructions, more complete resources, and the more descriptive/general name.

**Preserve learned knowledge across merges.** Most skills carry a self-improvement section holding state accumulated through use — a "Learned preferences" bullet list (skills from [[skill-creator]]) or a `## Learnings` block with *What Worked Well / What Didn't Work / Tips for Future Use* (evolving skills from [[evolving-skill-creator]]). Both are hard-won continual-learning state under different names; never drop either in a merge. Fold the merged skills' learned entries into the parent's section, de-duplicating and pruning anything stale, and keep the parent's self-improvement section intact.

### 4. Generate SKILL_REGISTRY.md

Write `SKILL_REGISTRY.md` as a compact routing guide (at the repo root, or alongside the skills it catalogs):

```markdown
# Skill Registry

## <Category> (<count>)

- **skill-name**: What it does in one sentence.
  Use when: <trigger condition — when should the agent read this skill?>
  Sections: <comma-separated sub-capabilities within the skill>

- **skill-name**: What it does in one sentence.
  Use when: <trigger condition>

## Recently Added
- **new-skill**: Frontmatter description — not yet categorized
```

The registry should:
- Group skills by purpose/domain, not alphabetically.
- For each skill give: what it does, when to read it, and (if it has them) its sections.
- Treat the **"Use when"** line as critical — it's what tells the agent to load the full SKILL.md.
- Stay under ~50 entries — a conservative target that keeps the set comfortably inside the zone where selection stays reliable; merge aggressively if it's creeping up.
- Include a "Recently Added" section for skills created since the last pass.
- **Not** duplicate full skill content — just enough for routing.

### 5. Report

Summarize: how many skills were found, which were merged (old names → new name), which were pruned and why, which were kept as-is, and the final registry structure. Surface anything risky (a merge that lost nuance, a skill you suspect is dead but didn't remove) so the user can veto before it's permanent.

## Constraints

- Don't use keyword matching, Jaccard similarity, or heuristic categorization — reason about what each skill does.
- Be aggressive about merging and pruning: fewer high-quality skills beats many overlapping ones.
- Preserve all bundled resources and all self-improvement / learned-preference state during merges.
- The registry is a routing guide, not documentation — keep it concise.
- Don't delete or merge skills that are symlinks into other projects without flagging it to the user first — you may be editing a source of truth shared elsewhere.

## Self-improvement: this organizer should drift toward the user

This skill should learn how *this user* likes their library kept. If a session reveals a durable preference — a category scheme they favor, a merge they reversed, a tolerance for more (or fewer) skills, a naming convention — propose 1–3 short additions:

> Based on this session, I'd adjust how I organize your skills:
> 1. <≤ 1 sentence>
>
> OK to add?

On approval, add bullets under "Learned preferences" below or adjust the workflow/constraints. Keep it lean; prune entries that later prove wrong.

### Learned preferences
*(Empty at install. Grows as the organizer is used with this user.)*
