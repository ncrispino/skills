---
name: workflow-to-skill-spotter
description: Notice when a workflow you just did (or are about to repeat) should be captured as a reusable skill, and decide whether to create one, improve an existing one, or do nothing. This is the continual-learning trigger. Use it at the end of any substantive multi-step session, whenever you catch yourself re-deriving a sequence of steps, writing a helper script you've written before, applying a correction the user already taught you, or thinking "I'll probably do this again." Also use when the user says "should this be a skill?", "remember how to do this", "turn this into a skill", or "we keep doing X." It hands off to skill-creator (to make/improve a skill) and points to skill-organizer (to dedupe/merge).
---

# Workflow-to-Skill Spotter

The whole point of a skill library is continual learning: work you do once should make the next similar task faster and better. That only happens if someone notices "this was skill-worthy" and acts on it. Models don't do this by default — they finish the task and move on, and the learning evaporates. This skill is the habit that closes that loop.

It does three things: **detect** a skill-worthy workflow, **decide** what to do about it (capture it now as a living plan, make a polished skill, improve an existing one, or do nothing), and **hand off** to the right next step.

## When to run the check

Don't run this on every trivial exchange — that's noise. Run it when at least one trigger signal is present:

- **You finished a substantive, multi-step task** and it worked. (End-of-session is the highest-value moment.)
- **You re-derived something.** You figured out a sequence of steps, an API dance, a config incantation, or a debugging path that felt like it took real effort to reconstruct.
- **You wrote a helper script** — especially one resembling something you've written before (a `convert_x.py`, a scraper, a formatter). Repeated ad-hoc scripts are the single strongest signal.
- **The user corrected you** in a way that generalizes ("always pin the version", "we use tabs not spaces here", "check the staging branch first"). Corrections are durable knowledge that future sessions will otherwise relearn the hard way.
- **The user said it out loud** — "we keep doing this", "remember this", "make this a skill."
- **You hit a non-obvious gotcha** and found the fix. The fix is worth more than the task.

If none of these are present, stop — most work is genuinely one-off and shouldn't become a skill.

## The skill-worthiness test

A workflow deserves to become a skill when it clears these bars. Reason about each rather than scoring mechanically:

1. **Repeatable.** Will this — or something close enough that the same instructions apply — plausibly recur? A skill used once is overhead, not leverage.
2. **Generalizable.** Can you describe it as a *type of task* (e.g., "migrate a database table in batches") rather than this one instance ("migrate the 2026 users table")? If it only works for the specific inputs you just used, it's not a skill yet — abstract it or drop it. See [[skill-creator]] for how to generalize an instance into a skill.
3. **Non-trivial.** Does it carry knowledge the model wouldn't reliably reconstruct cold — a specific sequence, a tool's quirks, hard-won corrections, a bundled script? If any competent run would do it the same way without help, skip it; a skill that just restates the obvious wastes a slot.
4. **Proven.** Do you actually have a working approach? Capture what succeeded, not a guess. If the task half-worked, note that honestly in the skill rather than presenting a shaky path as settled.

**Anti-signals (don't make a skill):** a true one-off; a task fully covered by an existing skill; something so simple the description would be longer than just doing it; or a workflow still too uncertain to recommend to a future self.

Be calibrated, not greedy. Skill selection accuracy degrades past ~50–100 skills (see [[skill-organizer]]), so every skill should earn its place. When in doubt, lean toward *improving an existing skill* over creating a new near-duplicate.

## Check for an existing skill first

Before proposing a new skill, look at what's already installed (the repo's skill directories, `~/.claude/skills/`, and any `SKILL_REGISTRY.md`). Three outcomes:

- **A skill already covers this** → don't create anything. If you discovered a better approach, a new gotcha, or a correction, route it to that skill's improvement path instead — see [[skill-creator]] (improve mode). Feeding learnings back into existing skills is continual learning too, and it's usually higher-value than a new skill.
- **A near-duplicate exists** → prefer extending/merging over forking. Note it and point to [[skill-organizer]] for the merge.
- **Nothing covers it** → candidate for a new skill via [[skill-creator]].

## Propose to the user — briefly

When something clears the test, surface it in one tight proposal. Don't write the skill yet; get a yes first. Keep it to a few lines:

> We just <did X>. That looks skill-worthy: it's the kind of thing that'll come up again, and the working approach was non-obvious (e.g., <the gotcha / the script we wrote>). Want me to capture it as a skill `<proposed-kebab-name>`? I'd record <the key steps / the script / the corrections>.

Name it by *task type*, not instance: `pdf-report-generator`, not `q4-report`. Include what you'd capture so the user can correct scope before any work happens. If you found an existing skill to improve instead, say that instead of proposing a new one.

## Hand off

On approval, hand to [[skill-creator]] with the context already in hand — the steps taken, tools/scripts written, input/output formats observed, and corrections the user made. A spotter handoff is the ideal skill-creator starting point because the workflow is fresh and concrete; pass it through rather than making the user re-explain.

If instead you're at the *start* of a scripty, multi-step task you expect to recur — rather than looking back on a finished one — hand to [[evolving-skill-creator]] to capture it as a living workflow plan up front: it documents the steps and the helper scripts before you build them, then folds in learnings afterward. The spotter's "about to repeat" trigger is exactly this case.

After creation, if the library is getting crowded or the new skill is adjacent to existing ones, run [[skill-organizer]] to dedupe and refresh the registry.

## The continual-learning habit

The most reliable way to use this skill is as an end-of-session reflex: when a meaty task wraps up, spend one beat asking "did we just learn something a future session should inherit?" Most of the time the answer is no and you move on. When it's yes, that one beat is what turns a pile of one-off tasks into a library that compounds.

This skill itself follows the same rule — see below.

## Self-improvement: this spotter should get better at spotting

This skill is meant to sharpen its own judgment over time. If a session reveals that you missed an obvious skill candidate, flagged a false positive, or that this user has a consistent threshold ("don't bother me about skills under 20 lines", "always propose, I'll decide"), propose 1–3 short additions:

> Based on this session, I'd tune the spotter like this so it matches how you actually want it to behave:
> 1. <≤1 sentence>
>
> OK to add?

On approval, add bullets under "Learned preferences" below or adjust the trigger signals / test bars. Keep it lean — encode durable calibration, not one-off judgments. Remove entries that later turn out wrong.

### Learned preferences
*(Empty at install. Grows as the spotter is used with this user.)*
