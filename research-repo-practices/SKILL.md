---
name: research-repo-practices
description: "House rules for a research codebase built with coding agents: docs and code maps, code seams and self-registering declarations, viewers and figures, measurement and grading integrity, and how to plan, ask and report to the owner. Use when starting or working in a research repo (one that runs experiments, grades runs, uses model readers or shows results pages): writing its docs, adding a harness, task or check, building a viewer or figure, designing a grader or reader, or wording a finding, even if this skill is not named."
---

# Research repo practices

These rules come from one research codebase built with coding agents. It ran agents on shared machines, recorded them, graded the runs, had model readers answer questions about them, and showed them in a local viewer. The rules are written to carry over to other research repos. Each one carries a short example from the repo it came from.

Words used across these files:

- **Owner**: the person who owns the repo, sets its goals and makes its decisions. The agent works for them.
- **Subject**: what the research studies, such as an agent under test.
- **Record**: what the system saved about one run.
- **Reader**: a model that reads a record and answers set questions about it.
- **Harness**: the program that runs a model as an agent, such as a coding CLI.

## When to use

Use it in a research repo only: one that runs experiments, grades runs, uses model readers or shows results. In an ordinary product codebase the integrity rules and owner preferences do not apply.

- Starting a research codebase, or working in one whose conventions are not written down.
- Writing, reviewing or reorganising a README, docs index, code map, design doc or limitations page.
- Adding anything that "goes in a list": a harness, provider, task, check or config (one interface per harness or tool instead of if/else on names, self-registering declarations instead of central lists, parsing at the adapter boundary).
- Building or polishing a viewer, dashboard, report page, figure or explainer (answer first, claims one click from source, colour tokens, light/dark, cold-reader checks).
- Designing a grader, a model reader, a gold set or a metric, or writing up a result ("not found", never "did not happen"; observed vs derived; distrust perfect scores; blind validation).
- Planning with the research owner, asking them a decision, reporting status, committing, or briefing subagents (plan first, explain before asking, question dialogs, subagent briefs).

## The ten rules that matter most

1. **Plan from the end result, and explain before you ask.** Agree a written plan built backwards from the result wanted, and explain any decision with one concrete example before asking it.
2. **Docs are part of the change.** The README, code map, figures and limitations change in the same commit as the code, and a test checks every path they cite.
3. **Define every term where it appears, and give each thing one name.** Readers guess at undefined words, and a guess becomes a wrong conclusion.
4. **Put one interface at each seam.** Tools differ behind one interface with equal capabilities, native or emulated, and nothing branches on a tool's name.
5. **Declare each thing once, next to its code.** Units register themselves, lists are built from the declarations, and adding an item means adding one file.
6. **Parse at the boundary, and let code decide what code can check.** Downstream code reads one normalized shape, and a model is used only for judgment.
7. **Claim only what the record supports.** Keep observed, derived and possible apart, and word an absence as "not found", never "did not happen".
8. **Measuring must not change the subject.** Run tools as they normally run, shift no timing, and write nothing the subject can read.
9. **Treat a perfect or surprising score as a bug until explained.** Grade on data the run never generated, and validate blind against held-out answers.
10. **A page leads with its answer and keeps every claim one click from its source.** It drops no data, uses colour tokens with one meaning each and a light/dark switch, and is checked rendered and by cold readers.

## Reference map

Open only the file the task needs.

| File | Open it when |
|---|---|
| [references/working-with-the-owner.md](references/working-with-the-owner.md) | planning, asking a decision, reporting status or a handoff, committing or pushing, spending money, or briefing a subagent |
| [references/docs-and-readmes.md](references/docs-and-readmes.md) | writing or reviewing a README, docs index, code map, design doc, limitations page or command block |
| [references/visuals.md](references/visuals.md) | drawing a diagram, figure, chart, explainer video or design prototype |
| [references/code-structure.md](references/code-structure.md) | adding a harness, provider, task, check or config; refactoring; choosing file layout; proving a change moved nothing else |
| [references/viewer-and-ui.md](references/viewer-and-ui.md) | building, changing or checking a viewer, dashboard or report page |
| [references/research-integrity.md](references/research-integrity.md) | designing measurement, graders, readers or golds; wording a finding, a count or an absence |

When a rule touches two topics, the file named for the topic holds its rule, why and example. The other file has a one-line pointer ("See rule N in X.md").

## Bringing this into a new repo

- These rules come from one owner. A rule marked *owner preference* is that owner's taste, not general practice. In a new repo, confirm the commit, push and spending rules with its owner before acting on them. Until they do, the harness's own commit and push rules apply.
- Write the repo's own short version into its agent instructions file (CLAUDE.md or AGENTS.md). Keep only the rules that apply, in the repo's own names. Do not paste this whole skill.
- A preference the repo's owner states later wins over these rules. Where the notes behind this skill disagreed, the latest stated preference was kept.
- Related skills: [[html-artifacts]] for a one-off HTML document, [[research-figure-design]] for paper figures, [[project-proposal]] for a living design doc.

## Self-improvement: this skill should drift toward the owner

This skill should get sharper with each repo it is used in. At the end of a substantive session, check whether the owner corrected a doc, a page, a code layout, a claim's wording or the way a question was asked. Check too whether a rule here turned out wrong, or a new gotcha came with a fix.

If so, propose one to three short additions:

> Based on this session, I'd add these to research-repo-practices:
> 1. <one sentence: the rule, and the file it belongs in>
>
> OK to add?

On approval, put each one in the reference file for its topic, written as rule, why and a short example. Add a one-line headline here only if it outranks one of the ten. When a newer preference contradicts an entry, replace the entry, so the skill holds only the current preference. Before replacing an entry, grep the references for its twin or its pointers, and change those too. Leave out anything true of one project only.

### Learned preferences

*(Empty at creation. Grows as the skill is used.)*
