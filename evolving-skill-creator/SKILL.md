---
name: evolving-skill-creator
description: Create an evolving skill — a living workflow plan that you write up front, execute, and then refine with what you learned. Use at the START of a substantive, multi-step task that involves writing your own helper scripts and will plausibly recur (data pipelines, scrapers, generators, multi-tool workflows). The plan documents the steps, the tools you'll build, and the dependencies before you start; after execution you fold in learnings so the next run is faster. Distinct from skill-creator (which produces a polished, evaluated skill) — reach for this when you want to capture a workflow as you do it.
---

# Evolving Skill Creator

Create **evolving skills**: workflow plans you write *before* doing the work, follow while doing it, and refine *after* with what actually happened. Where [[skill-creator]] produces a polished, evaluated, reusable skill (and is where you'd promote a matured evolving skill), this is the lighter-weight, plan-as-you-go form — ideal when you're about to do something multi-step and scripty and want the doing itself to leave behind a reusable artifact. It's continual learning captured in the moment rather than reconstructed afterward; [[workflow-to-skill-spotter]] is the after-the-fact counterpart.

## What makes a skill "evolving"

An evolving skill is a workflow plan that:
1. Documents the specific steps to accomplish a goal.
2. Lists the helper scripts you'll create as reusable tools — written down *before* you write them.
3. Captures learnings after execution, so it gets better each time it's used.

The up-front plan is what distinguishes it: naming the tools before building them forces you to design them for reuse rather than for this one instance.

## Directory structure

```
evolving-skill-name/
├── SKILL.md              # the workflow plan (this file)
└── scripts/              # Python tools you build during execution
    ├── scrape_data.py
    └── generate_output.py
```

## SKILL.md format

YAML frontmatter with `name` and `description` is required — those fields are how the skill is discovered in future sessions. Beyond that, an evolving skill uses these sections:

```markdown
---
name: descriptive-skill-name
description: What this workflow does and when to use it.
---
# Task Name

## Overview
The problem this workflow solves.

## Workflow
Specific, numbered, actionable steps — include the commands/tools to run, not vague gestures.
1. ...
2. ...

## Tools to Create
Scripts you'll write, documented BEFORE writing them:

### scripts/example_tool.py
- **Purpose**: what it does
- **Inputs**: args, files
- **Outputs**: what it produces
- **Dependencies**: required packages

## Tools to Use
Existing tools you'll lean on — MCP servers, custom tools, CLIs.

## Skills
- other-skill: how it helps

## Packages
- package_name (pip install package_name)

## Expected Outputs
Files this workflow produces — formats and locations.

## Learnings
(Filled in after execution — see below.)
```

## The "Tools to Create" discipline

This is the key differentiator. When the workflow involves writing scripts, document them upfront with purpose / inputs / outputs / dependencies. Designing the interface before the implementation is what makes the script reusable in a *similar future task* rather than welded to this one. After execution, the working scripts live in `scripts/` and the next run uses them directly instead of rewriting them.

## Naming

Name by the **type of task**, not the instance — that's what makes it match a future session:
- Good: `artist-website-builder`, `data-scraper-to-static-site`, `pdf-report-generator`
- Bad: `bob-dylan-project`, `session-12345`, `my-task`

## Workflow

1. **Create the directory**: `evolving-skill-name/` with a `scripts/` subdir.
2. **Write SKILL.md** with frontmatter and a plan: Overview, Workflow, Tools to Create (interfaces first), Tools to Use, Packages, Expected Outputs.
3. **Execute** the plan, building the scripts as documented.
4. **Verify like a user** — actually run the outputs, click the buttons, hit the edge cases. Don't trust observation alone.
5. **Refine with learnings** (below).

## Self-improvement: refine with learnings

This is where an evolving skill earns its name — it's the same continual-learning loop every skill in this repo carries (see the self-improvement mandate in [[skill-creator]]). After completing the work, update the SKILL.md:

- **Refine the Workflow** to match what actually worked, not what you guessed up front.
- **Move working scripts** into `scripts/` so they're reusable as-is.
- **Add a Learnings section** capturing durable knowledge:

```markdown
## Learnings

### What Worked Well
- ...

### What Didn't Work
- ...

### Tips for Future Use
- ...
```

Encode what a future run should inherit — gotchas and their fixes, faster paths, dead ends to avoid — not one-off content choices. Prune entries that later prove wrong; a plan that hoards stale advice gets worse, not better.

When an evolving skill has matured — it's run cleanly a few times and the workflow has stabilized — consider promoting it to a polished, evaluated skill via [[skill-creator]], and run [[skill-organizer]] if it overlaps with anything existing.

## Example

```yaml
---
name: artist-website-builder
description: Build static biographical websites for artists by scraping public sources and generating themed HTML.
---
# Artist Website Builder

## Overview
Create artist websites by gathering biographical data and generating themed static HTML.

## Workflow
1. Research the artist — name variations, active years.
2. Scrape data with scripts/fetch_artist_data.py.
3. Review and clean the extracted data.
4. Generate the site with scripts/build_site.py using the "minimalist-dark" theme.
5. Review in a browser; check mobile responsiveness.
6. Iterate on styling.

## Tools to Create
### scripts/fetch_artist_data.py
- **Purpose**: crawl Wikipedia, extract biographical data
- **Inputs**: artist_name (str)
- **Outputs**: artist_data.json
- **Dependencies**: crawl4ai

### scripts/build_site.py
- **Purpose**: generate static HTML from artist data
- **Inputs**: artist_data.json, theme_name
- **Outputs**: website in output/
- **Dependencies**: jinja2

## Packages
- crawl4ai
- jinja2

## Expected Outputs
- output/index.html, output/discography.html, output/assets/

## Learnings

### What Worked Well
- Wikipedia infoboxes have consistent structure.
- crawl4ai async mode is ~3x faster than sync.

### What Didn't Work
- AllMusic needs JS rendering — use the Discogs API instead.

### Tips for Future Use
- Check robots.txt before scraping; cache results — re-running is slow.
```
