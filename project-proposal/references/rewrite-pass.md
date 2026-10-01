# Consolidation rewrite

After several apply passes a proposal accumulates patches: paragraphs bolted on in the order decisions arrived, the same point made in two sections, old wording that a later decision contradicts. A consolidation rewrite turns it back into one coherent document. Do it when the user asks ("rewrite it", "make it consistent", "clean it up") and offer it after every three or four apply passes.

## 1. Gather everything first

Read, before writing anything:
- The current proposal, the decision log, and `source-notes.md`.
- Every review page: approved items with their comments and Answer boxes (the answer the user approved is the agreed version), rejected items, merged items.
- Open items on the review pages and the plan review. These are not decided; they must not silently become decisions.
- Inline notes (`class="note"`).

Make a short inventory (in your head or scratchpad, not in the doc): each decision in one line, where it belongs, and which open questions touch which section.

## 2. Rewrite section by section, not patch by patch

- Write each section fresh from the inventory, in the template order. Keep the user's own wording where they wrote it.
- **One home per fact.** Each decision is stated once, in the section it belongs to; other sections refer to it in a few words. Delete repeats.
- **Only justified content.** Every sentence is either a decision, the reason for one, a source-backed claim, or an open question. Cut transitions, recaps, and restated motivation.
- **General before specific.** The method sections describe the general design. A concrete task, its data and its names live in a clearly marked worked-example section (`<div class="example">`), introduced as one instance, not the rule. Experiment rows that run on the example say so.
- **Open questions are visible, not buried.** Where a section depends on an undecided item, state the current default in one clause and point to the open item; list all open items once in Risks and open questions.
- Delete template hint blocks for sections that are now written.
- Keep figures; update their text so labels match the rewritten sections.

## 3. Consistency checklist

Check each before saving:
- Names: levels, phases, conditions, agents, metrics and outcome labels are spelled the same everywhere (summary, figures, tables, text, decision log).
- Numbers: counts of levels, conditions, models, runs and the budget table agree with the experiment list and the plan.
- Summary: every line matches the body; the first-experiment line matches the worked example and the ladder.
- Figures: every label and caption matches the text.
- References: everything cited in the text is in References, and nothing there is uncited.
- Decision log: every decision in the body appears there; entries read in date order, one line each, decisions rather than edit history (fold "fixed X" entries into one line per pass).
- Example vs general: nothing task-specific in the general sections except as a labeled example.

## 4. After

Log one decision-log line for the rewrite, commit and push, run the `proposal-reviewer` agent to check it, then tell the user what changed structurally (moved, merged, cut) and what is still open.
