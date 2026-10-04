# Section guide

A checklist per section. Use it to draft and to review. A section is done when every item is answered or explicitly marked N/A.

## Summary (top block, five labeled paragraphs)
Labels are plain words, each on its own line above its text: The problem, Hypothesis, First experiment, We succeed if, We stop if. No jargon; a reader outside the subfield should follow every line.
- **The problem**: two to four sentences with a concrete example; says who is affected.
- **Hypothesis**: what we expect to be true, stated so an experiment can show it wrong.
- **First experiment**: the simplest setup that tests it, runnable in week 1–2.
- **We succeed if**: what is measured, compared with what, and by how much ("+5 points over few-shot prompting on X").
- **We stop if**: the measurable result that ends the project or changes its direction.
Test: someone reading only these five paragraphs could decide whether to fund week 1.

## Figure 1
- Shows problem → approach → expected result on one running example.
- Understandable without the text and without hovering.
- Uses the fixed color meanings (red problem/baseline, purple ours, green success).

## 1. Motivation
- Opens with a concrete example of the problem (input, what goes wrong), not a general claim.
- Says who would use the result and what they would do differently.
- ≤ 2 short paragraphs. Related work only if it explains why now.

## 2. Challenges
- Each challenge: why it's hard → what it implies for the design or which experiment addresses it.
- Challenges that map to nothing below are either missing experiments or not real challenges.
- "Could a simple baseline already solve this?" callout names the strongest cheap alternative. If we can't say why it falls short, testing it is E1/E2.

## 3. Threat model (safety/security only)
- Asset, adversary, capabilities (access, queries, adaptivity, what inputs they control), goal (measurable), trust boundary, out of scope with reasons.
- Diagram: adversary → attack surface → system (+ defense) → asset, trusted zone drawn.
- Adaptive attacker considered: would an attacker who knows the defense beat it? If so, is that in scope?
- Experiments section includes attacks matching the stated capabilities (not weaker ones).

## 4. Approach
- Start-simple ladder R0–R3 with a measurable gate between each rung.
- R1 is the strongest *simple* baseline we can find (often: better prompting, a larger model, more data, a linear probe, retrieval, an off-the-shelf tool). Not a strawman.
- R2 is the smallest change that tests the bet. If R2 needs weeks of engineering, it is not minimal.
- Says what we build on (existing code, models, datasets) and what is new.
- Method described conceptually; implementation details belong in Infrastructure.

## 5. Infrastructure (step 1)
- Data: source, version, splits; test set frozen before any tuning.
- Runner: one entry point for all conditions; config files, not code edits, to change conditions.
- Caching of expensive calls keyed by full input (model, prompt, params) so reruns and new metrics are free.
- Raw logs: every output saved append-only with provenance (run id, config hash, git sha, model + version/date, seed, timestamp, cost).
- Eval: metric code tested on a few hand-labeled examples; metrics recomputed from raw logs.
- Reading runs (results browser), built in week 1 and used from the first run. We find bugs by reading examples, not aggregates. Plan:
  - An index of every run, filterable by condition and outcome, that includes live, failed and half-finished runs (a crashed run is often the most informative one).
  - A per-run page with everything in one place: the raw transcript (side by side when several agents or models interact), tool calls and outputs, state changes or diffs, provenance and cost.
  - Every number in a summary or results table links to the runs behind it, so any rate can be checked by reading its examples.
  - One command opens it; it reads only the raw logs, so it works on old runs and never changes them.
  - Reading a sample of runs (and every surprising one) is a step of every batch, written into the plan.
- Compute and cost tracking: where runs happen, rate limits, concurrency, spend per run.
- Reuse first: name the existing harness/tool before proposing to write one.

## 6. Experiments
- Table: ID, question, conditions, metric, decision it informs. Order = run order.
- E1 validates the metric (R0 vs oracle/ceiling). E2 measures R1. E3 is R2 vs R1.
- Ablations listed explicitly with their count; each ablation answers a question someone would ask.
- Seeds / repeats chosen so the expected effect exceeds run-to-run noise; say how noise is estimated.
- Budget table covers every row above, including ablations and reruns. Verdict green/amber/red.
- If red: cut conditions, seeds, items, or rungs, in that order of preference, and record the cut in the decision log.
- "What we vary": the default setup in one sentence, then a table of factors (levels, main result or ablation, what it tests, expected result). Variables that carry a claim go in the main results; the rest are ablations, one change at a time from the default.
- Paper tables, to fill in: the tables the paper will report (main results, dose or curve, ablations, breakdown of the headline measure), each rendered with dashes and its booktabs LaTeX in a collapsed `<details>`. Each experiment row above should fill at least one cell.
- Free choices that could be tuned until an effect appears (prompt wording, thresholds): say how they are fixed in advance and reported in full.

## 7. Expected results
- Mock figure labeled HYPOTHETICAL showing the expected ordering and the gap that counts as success.
- "Supports the bet" and "Kill / pivot" callouts, each a specific result pattern.
- What we would do next under each outcome.

## 8. Plan
- Week 1 = infrastructure + R0/R1 numbers reproducible from one command, and every run from the first one can be opened and read in the results browser.
- Each row has a "done when" that is checkable.
- Decision points (gates) appear as dated rows.

## 9. Risks and open questions
- Each risk → mitigation or the experiment that retires it.
- Open questions the user must decide are listed here, not buried in prose.

## Appendices
- Research notes: link only; unverified by default.
- Decision log: dated one-liners of what we agreed and why.
