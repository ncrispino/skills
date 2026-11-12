# Code structure

General coding practices: seams, declarations, layout, pipeline shape and proving a change. Each rule gives the rule, why it holds, and an example from the repo it came from.

Two words used below. A **seam** is a place where behaviour varies by implementation, such as which agent harness runs. An **adapter** is the code that turns one external tool's format into the shape the rest of the code reads.

## Seams and tools

1. **Put one interface at each seam, with one adapter per external tool. Never branch on a tool's name.**
   *Why:* name checks get copied and the copies drift.
   *Example:* in the repo this came from, an inventory found "goal mode is Codex-only" in two places with opposite tests, and two routing rules that sent one model to two providers. The fix was a data spec per harness (`HarnessSpec`) and one protocol per role. The owner chose it because the alternative "leaves the 15 harness branches in mechanism code".

2. **Give every implementation the same capabilities. Declare each one as native or emulated, and emulate what a tool lacks.**
   *Why:* code written around the first tool overfits to it and must be redone for the next.
   *Example:* in the repo this came from, the owner said "we should have goal for every harness ... we shouldnt overfit to codex". Each harness now uses its own goal mode where it has one, and an emulated one where it does not.

3. **Parse external formats once, at the adapter boundary. Downstream code reads one normalized shape.**
   *Why:* parsing spread through renderers and analysis breaks with every format change.
   *Example:* in the repo this came from, usage numbers were normalized in four separate places, and one caller's usage was never normalized at all. Now one adapter turns each harness's output into one shared event stream.

4. **Read a third-party tool's native output through its official features, and do not trim or re-cut it yourself.** For not overriding its defaults and where to put guards, see rule 12 in [research-integrity.md](research-integrity.md).
   *Why:* custom cuts change what is being measured and make results hard to compare.
   *Example:* in the repo this came from, the owner said "we should NOT be doing any sepcial cutting ourselves; we need to use the transcripts direclty".

5. **Prefer an established tool or standard over a home-made mechanism, and check that the pattern is widely used.**
   *Why:* a home-made monitor missed events, while a standard comes with known coverage and something to cite.
   *Example:* in the repo this came from, the owner said "no more bespoke system monitoring, we instead use real monitoring and do it well", and asked whether the chosen stack was "an accepted pattern".

## Declarations and config

6. **Declare each thing once, next to its code, and build every list from those declarations. Keep no hand-made central lists.**
   *Why:* a central list grows with every addition, and a missed entry fails silently.
   *Example:* in the repo this came from, one check was spread over seven places in four or five files, and a missed entry made a grading tab "show nothing". Now a `@check(...)` decorator declares each check on its function and takes its parameters from the signature. Discovery runs once, lazily, sorted by name, and a name declared twice is an error.

7. **Make adding an item mean adding one file, never editing shared files.**
   *Why:* shared files that grow per item tangle unrelated items together.
   *Example:* in the repo this came from, each model provider is one config file ("A new provider is one new file").

8. **Give every fact one home.** Keep text the subject sees in config, not code. Keep constants such as prices in code, not in config.
   *Why:* copies disagree.
   *Example:* in the repo this came from, an inventory found the provider list written by hand in five files, in different orders. Prices live in one pricing module.

9. **Give each config file one job.**
   *Why:* mixing jobs let one thing change without anyone noticing.
   *Example:* in the repo this came from, the owner asked to "split 'agents:' out into its own config bc they are not something that define the task". A run is now one task file plus one agents file.

10. **Declare each default once. Never repeat it in every config.**
    *Why:* a repeated default drifts and hides where a value came from.
    *Example:* in the repo this came from, the owner said a common setting "should be the default everywhere", and the copies in each task were removed.

11. **Make dangerous states impossible to configure.**
    *Why:* a rule that a config can break will be broken eventually.
    *Example:* in the repo this came from, how a secret is delivered follows from the role and harness, and no option exists that means "key inside the agent's container".

12. **Make a missing input a named error, never a quiet fallback.**
    *Why:* a fallback produces a run that looks valid but is not the one asked for.
    *Example:* in the repo this came from, `--model` without its provider is "refused by name", and "nothing is routed by a model-name prefix".

13. **Pin exact versions of models, providers and tools in code.**
    *Why:* unpinned provider routing made results impossible to replicate.
    *Example:* in the repo this came from, the owner asked "cant we just set up the presets through code so ANYBODY can use?".

14. **Keep the bottom layer on the standard library only, and do no work at import time.**
    *Why:* otherwise you get import cycles and imports whose order matters.
    *Example:* in the repo this came from, the registry module imports only the standard library, so config code "may import this module at any time and ask it at call time".

## Size and layout

15. **Keep the core small enough for the owner to read end to end.** Cut code that produces no result. Ship one default rather than two options.
    *Why:* the owner must understand the code to trust the experiment.
    *Example:* in the repo this came from, more than a hundred monitoring files got "is all this code necessary? ... I must know how the code works". On a choice of modes the owner said "just set one default ... not both".

16. **Organise by idea, not by line count.** Split a file when it gains a second job. Merge tiny files that share one idea.
    *Why:* many tiny files hide the flow as much as one huge file does.
    *Example:* in the repo this came from, line budgets were dropped, and the owner asked whether two small config files were "really necessary as their own files".

17. **Open each module with a docstring that says what it does, in what order, and which decision it follows. Cut comments that add nothing.**
    *Why:* the owner reads the code by hand.
    *Example:* in the repo this came from, the owner asked for "removing a lot of the extra comments" and for options to reorganise.

18. **Put any rule that decides what data is kept or dropped in one small named place, with its reason.**
    *Why:* a filter decides what evidence exists.
    *Example:* in the repo this came from, the owner said of a kernel-event filter "we should make this kind of filtering really clear and really easy to read".

19. **Build new work from the target design, reusing only pieces named as reusable.**
    *Why:* old code pulls new work back toward the old approach.
    *Example:* in the repo this came from, the owner said "we just want based on the plan, not on old things".

20. **Drop compatibility code for old data formats nobody needs yet.** Analysis must still re-run over existing records; see rule 17 in [research-integrity.md](research-integrity.md).
    *Why:* a second reader for an old layout costs clarity and gives nothing back.
    *Example:* in the repo this came from, the owner said "old runs dont matter for now we should only assume we have new runs".

## Pipeline shape

21. **Keep capturing data separate from reading it.** Analysis runs after the run, never affects it, and caches by a hash of its inputs.
    *Why:* mixing them hides what was saved versus how it was judged.
    *Example:* in the repo this came from, the owner asked "the graph shouldnt affect the run or what we save at all, right? kinda just like the viewer?".

22. **Let code decide what code can check, and use a model only for judgment.** For how a model reader hands over facts, see rule 23 in [research-integrity.md](research-integrity.md).
    *Why:* a model doing a test's job costs more and is trusted less.
    *Example:* in the repo this came from, code groups events by shared file or port, and "the llm decides the episode".

23. **Have an LLM worker write its answer to a file and run an executable checker on it, in the same session, until it passes. Keep each check report.**
    *Why:* a separate validation call gives the worker no chance to fix its own answer.
    *Example:* in the repo this came from, the owner said "we should have the reader write the json answer as a file, not retrun in chat ... an executable we can run that checks the json".

24. **Enforce safety with structure, not with allow-lists of commands.** Use a container, a read-only mount and no key inside.
    *Why:* a "read-only" command list still let `find -exec` and `sed` write files.
    *Example:* in the repo this came from, the owner said "oh pls just containerize it? make the read only systems based".

25. **Make inspection a built-in feature.** Offer a command to enter a live run, print a file tree at launch, and show the full config the same way in the CLI and the UI.
    *Why:* the owner checks the system by looking at it.
    *Example:* in the repo this came from, the owner asked "can we kinda make this more of a first clas option?", and "when i alunch i want it to print a tree of the files".

26. **Know what every identity and cache key hashes, and change one only on purpose, in a step that says so.**
    *Why:* moving a file can quietly invalidate caches or change grading identities.
    *Example:* in the repo this came from, a design doc lists each identity, what it hashes, and how it is kept or bumped.

27. **Check that a join by id resolves on real data, and assert the hit rate in a test.**
    *Why:* a broken join fails silently.
    *Example:* in the repo this came from, 14 of 14 links pointed at events that were never kept.

28. **Redact secrets in every field that leaves the system, not just the obvious one, and keep a test that asserts it.**
    *Why:* a key leaked through a command table after the transcript itself had been redacted.
    *Example:* in the repo this came from, this was found in the first offline viewer.

## Proving a change

29. **Write the invariants down as a table before the design, each pinned by a named test.** An invariant is a rule that must stay true.
    *Why:* a refactor cannot keep rules nobody wrote down.
    *Example:* in the repo this came from, the harness refactor listed I1–I24, each with where it was stated and the test that pins it.

30. **Before a refactor, snapshot everything downstream sees, offline. Require "all identical" after each step, or an exact list of the changes you meant to make.**
    *Why:* tests check the behaviour you thought of, and a full dump catches the behaviour you did not.
    *Example:* in the repo this came from, baseline scripts dump what agents see and are told, the graph and the pages, with no containers and no model.

31. **For a speed-up, run the old and new paths on real data and require byte-identical output.**
    *Why:* a plausible rewrite can silently change the record.
    *Example:* in the repo this came from, a fix to a quadratic scan had to reproduce the same output file byte for byte.

32. **Test each slice with focused tests, and let plumbing tests use a scripted stand-in model.** In a strict mode for the real environment, a skipped test counts as a failure.
    *Why:* real model runs cost money and add noise, and a skip in the real environment hides a missing piece.
    *Example:* in the repo this came from, the ground-truth suite uses a scripted model and spends no model tokens, and cloud verification runs it strict.

33. **Build in phases of one green commit per step.**
    *Why:* small steps are easy to review and to undo.
    *Example:* in the repo this came from, each design doc ends with a build-order table, one row per commit.

## Defining what a user writes

The examples below come from a second repo: a package that runs optimization experiments in which an agent proposes changes and code measures them.

34. **Define a core concept by the fewest parts that do not overlap, and derive everything else.** Treat the parts like a basis: each is needed, and none can be worked out from the others.
    *Why:* overlapping fields let two of them disagree, and every extra field is another term the reader must learn.
    *Example:* a task had eleven fields, including `rules`, `prompt`, `metrics` and `review_facts`. The owner asked for "succinct number that are fully independent in the sense it's like a basis". It became four parts (`objective`, `evaluator`, `seed`, `instructions`) and three optional ones. A separate table of agent start limits was dropped because it follows from the candidate limit.

35. **Keep the problem in code and everything about a run in one settings file.** No budget, limit or agent choice is hard-coded in a launch script.
    *Why:* a reader should find "what is being optimized" in one place and "who runs it and for how long" in another, and should be able to change the second without reading Python.
    *Example:* five example scripts each hard-coded their limits and took different flags. Each task became a `task.py`, and every run a `run.toml` with four tables: limits, researcher, reviewer and task options.

36. **Give every example the same entry point, and make each example directory complete.** One launcher runs any of them, and a directory holds its definition, settings and starting files, so copying it is how a new one starts.
    *Why:* per-example launch scripts drift apart, and an example that reaches into a sibling directory cannot be copied.
    *Example:* one example read its test task from `../../environment/task`. It got its own copy, a `starters/` directory of generic scripts was deleted, and `check`, `record` and `run` commands replaced the scripts.

37. **Ship the common cases as things to build on, so a new instance is a few lines.**
    *Why:* most new work is a variation on a known kind, and a user who must assemble the low-level pieces each time will assemble them differently each time.
    *Example:* two base tasks cover "edit a benchmark task's files, solver fixed" and "edit the solver's program, tasks fixed". An example that had been sixty lines became one call naming its task directory.

38. **Resolve paths against the file that names them, with conventional defaults.** A definition file never works out its own location.
    *Why:* `HERE = Path(__file__).parent` in every file is noise, and a default layout means most files name no paths.
    *Example:* the owner asked "do we need HERE". Paths became relative to the task file, with `seed/` and `instructions.md` beside it as defaults, and the smallest task now names neither.

39. **Turn a protective step on by default, and make turning it off explicit.** Refuse a configuration that says nothing about it.
    *Why:* an opt-in check is one that most runs skip without anyone deciding to.
    *Example:* an independent review of each candidate had to be configured to run. The owner said "we should have to turn off not on". It now runs unless the settings say `reviewer = false`, and settings that mention neither are refused.

40. **Generate from the definition any fact that prose would otherwise restate, and render user-written text through one fixed layout that rejects unknown sections.**
    *Why:* a hand-written "lower is better" can contradict the declared direction and nothing notices, and free-form sections let each task invent its own shape.
    *Example:* instructions have two authored sections, Objective and Constraints. The package adds a "What is measured" list (metric, direction, starting files, repeats) from the task itself, and a stray `## Advice` heading fails before anything runs.

41. **Never give one word two jobs.** A field must not share its name with a command, and a name should say what the thing returns or varies.
    *Why:* a reader who meets the word cannot tell which meaning is meant.
    *Example:* a task's `check` function collided with the `check` command. It became `validity`, which is also the type it returns. Two evaluator classes that differed only by an unexplained word were renamed for what each one varies.

42. **Split a reusable mechanism into its own repository once it stands alone.** Start it with one commit made from a git export, pin it by commit in the application, and repoint every link that left the package.
    *Why:* a copy inside the application and a copy outside it drift, and a floating dependency changes results without a commit that says so.
    *Example:* the package moved out with a fresh first commit. The application's dependency became a git URL at an exact commit, its lockfile followed, and seven links to result reports became URLs.
