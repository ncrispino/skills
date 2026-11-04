# Docs and READMEs

How READMEs and docs should read and link together. Each rule gives the rule, why it holds, and an example from the repo it came from.

## How to write

1. **Use plain words and one idea a sentence. Give a reason for every rule you write down.**
   *Why:* the owner reads the docs to check the system, and a rule with no reason gets broken at its edge cases.
   *Example:* in the repo this came from, the agent instructions file pairs some rules with their reason, such as "Put the research rationale in the task config's header or under `docs/`, which never enters the container". Others still carry none, such as "Keep model prices in `configuration/pricing.py`, not in YAML".

2. **Define every term where it is used.** Put a key terms table in the root README and a "Words used on this page" table in each package README. Spell out an abbreviation and give the full name of a sensor or field the first time it appears.
   *Why:* cold readers guess at undefined words, and a guess turns into a wrong conclusion.
   *Example:* in the repo this came from, the owner said "ensure we give readers full terms ... we want readers to fully know what happens". The same holds in chat: the owner kept stopping work to decode coined labels, and asked "what are the 'G's btw" about question ids that had never been defined.

3. **Use one name per thing. When you rename something, mention the old word once, and leave stored values alone.**
   *Why:* two names for one thing look like two things, and renaming a stored field breaks old data.
   *Example:* in the repo this came from, a package README says "'Collector' is the older word, still used in `recording/collectors.json`".

4. **Pick short, plain names, and rename any label that confuses or misleads.**
   *Why:* unclear names stalled reviews.
   *Example:* in the repo this came from, the owner said "'reached and taken up' makes no sense", and "One episode" became "By episode".

5. **Say who wrote each piece of text: a model, the code, or a person.** In a README, list the model-backed steps apart from the code that assembles their output. See rule 7 in [viewer-and-ui.md](viewer-and-ui.md).

## The README

6. **Open with what the thing is and the most it can claim, then link to its limitations, then give a line of "On this page" links.**
   *Why:* a newcomer must know where the system stops being trustworthy before reading any command.
   *Example:* in the repo this came from, the README quotes its promise, "We retain independent evidence sufficient to reconstruct many important interactions, and expose where reconstruction is uncertain", then says "Read the limitations before drawing a conclusion".

7. **Name one supported path. Put the pipeline diagram first, then that path's commands in the order you run them. Put any other path after it, under its own heading, marked as not equivalent and not supported.**
   *Why:* effort went into a local path that was never equivalent to the supported one.
   *Example:* in the repo this came from, the owner said to "note it is not equivalent, recommended, or recieving continual support". The README runs "How a run flows", then "Quickstart, on EC2", then "Trying things locally".

8. **Give each README one concern.**
   *Why:* a README that mixed running experiments with judging them confused the owner.
   *Example:* in the repo this came from, the owner said a README was "kinda mixing main experiments and judging", and it was split.

9. **Give every package README the same layout.** Say what the package is and where it sits, with links up to the root and across to neighbours. Then give a flow diagram, a terms table, a files table with one line per file, "Where to start reading", and "How it runs" as numbered steps that name functions.
   *Why:* a reader who learns one package README can find their way in all of them.
   *Example:* in the repo this came from, the monitoring and viewer READMEs share this layout.

10. **Show the directory layout of every place the system runs.** Generate it from the code (see rule 18).
    *Why:* the owner could not tell what lived on the laptop, the cloud machine, the storage bucket and inside each container.
    *Example:* in the repo this came from, the owner asked to "show the filesystems eg when we do reading, for the normal agents, for the s3 and for the ec2 instance".

11. **Write a command block with the dry run first, then the same line with the flag that acts.** Number the steps. Add a comment on what each does. Put placeholders in `<angle>` brackets.
    *Why:* people copy commands, so the safe form should be the one they meet first.
    *Example:* in the repo this came from, the quickstart shows the plan command, then the same command with `--launch`.

12. **Use tables to look things up and prose to explain why.**
    *Why:* a table hides the reasoning, and prose hides the lookup.
    *Example:* in the repo this came from, "The stages" table (stage, command, what it writes, where to read more) is followed by bullets under "Why the order matters".

13. **Map each kind of change to the check that proves nothing else moved.**
    *Why:* without the map, people run the whole suite or nothing.
    *Example:* in the repo this came from, the README's test table has the columns "What you are checking" and "Suite", with rows for doc changes, filesystem changes and changes the agents can see.

## The docs as a system

14. **Keep a docs index that marks every document Current, Record (dated) or Prototype.** Give prototypes an Outcome column.
    *Why:* an old plan otherwise reads as a current contract.
    *Example:* in the repo this came from, the docs index also says "If code and a current contract disagree, treat that as a finding rather than silently choosing one."

15. **Give each document one job, and say which one wins when two disagree.** For example: the spec says what is intended, the decisions log says why, the code map says where, and the limitations say what cannot be known.
    *Why:* when two documents overlap and nobody says which wins, readers pick one at random.
    *Example:* in the repo this came from, the decisions log says "A decision here overrides the spec".

16. **Write one short doc per question. When a doc sprawls, replace it with a clearer one rather than adding to it.**
    *Why:* a long page confused more than it explained.
    *Example:* in the repo this came from, the owner called a monitoring page "very long and doesnt really dig into it ... maybe create a new document that is just much clearer".

17. **Keep a code map in reading order, and a reading guide with links through the code that matters most.** The map has one section per pipeline stage and a table per stage: file link, one line, where to start. For module docstrings, see rule 17 in [code-structure.md](code-structure.md).
    *Why:* the owner reads the code by hand in an editor and needs a route through it.
    *Example:* in the repo this came from, the owner asked to "create a md file with links or something i can follow imma look in vscode", and the code map says "Keep this file current when a file is added or split".

18. **Generate trees and inventories from the code that creates them.** Write them into marked blocks, with a rewrite command, a `--check` mode and a test that fails when a block is stale.
    *Why:* a tree typed by hand is out of date by the next refactor.
    *Example:* in the repo this came from, `src/experiment/trees.py` fills `<!-- tree:run -->` blocks in the README, and a unit test checks them.

19. **Document a lifecycle end to end on one readable page.** Define every state and illustrate each with an example.
    *Why:* states such as "idle" and "settled" were used before anyone had defined them.
    *Example:* in the repo this came from, the owner asked for the "full agent lifecycle detailed from start, to how early stopping works", in an HTML page with "idle, settled, etc" defined.

20. **Keep internal notes and media under `docs/`, and keep editor and tool caches out of git.**
    *Why:* the root is the entry point and should hold only what a newcomer needs.
    *Example:* in the repo this came from, the owner said "they should go in docs/ bc that is kinda internal docs", and asked to remove editor folders from main.

## Keeping docs true

21. **Change the docs in the same commit as the code that makes them wrong.** That covers the README for any change to setup, dependencies, images or commands, the code map for any new or split file, and any figure the change invalidates.
    *Why:* a later docs pass never happens, and a stale diagram misleads more than no diagram.
    *Example:* in the repo this came from, the owner asked of a figure "is this part updated? ... i hope that all these kinds of things are updated".

22. **Make every path a relative link and every identifier a backtick.**
    *Why:* a path you can click gets checked, and one you cannot goes stale unnoticed.
    *Example:* in the repo this came from, the reading guide opens with "Every path below is a link to the file or folder".

23. **Have a test check that every repo path the current docs cite exists.** Read which docs are current from the docs index. Check the text inside figures too. Skip dated records, which cite the code as it was.
    *Why:* renames and deletions leave docs pointing nowhere.
    *Example:* in the repo this came from, `tests/unit/test_cited_paths.py` does this, and lists each skipped doc with its reason.

24. **When a doc disagrees with the source of truth and you cannot fix it now, say so at that spot, with the date.**
    *Why:* silently trusting one side spreads the error.
    *Example:* in the repo this came from, two docs note that a rubric file still shows Q1–Q11 while the code numbers Q1–Q12.

25. **Keep superseded text and incident notes in a dated `<details>` fold, with the commit it applied to.**
    *Why:* the history stays available without blocking the current reading path.
    *Example:* in the repo this came from, the README folds "Incidents behind the limits (1 and 2 Nov 2026)".

## Limitations and design docs

26. **Write each limitation in four parts, at the moment it is found.** Say what is not recorded or could mislead. Say why, with a real run and its numbers. Say what to use *Instead*. Name the test it is *Pinned by*.
    *Why:* "a limitation found and not written here is a wrong conclusion waiting to happen", as the limitations page puts it.
    *Example:* in the repo this came from, one entry records that a burst of file truncations lost 616,781 events, and names the test that rate-limits them.

27. **State what is not measured as clearly as what is.**
    *Why:* a gap nobody states gets read as coverage.
    *Example:* in the repo this came from, the owner said "we should explicitly say what we DONT track too", and "we cannot catch everything and that is *fine*".

28. **Write a design doc in this order.** First a read-only inventory with file:line evidence. Then the repeated copies and defects it found. Then the invariants (rules that must stay true), each pinned by a named test. Then two or three designs with a recommendation. Then open questions. Put the owner's decisions table at the top, where it wins over the text below. Mark any claim you did not check as unverified.
    *Why:* the owner decides from evidence and needs to see what is settled.
    *Example:* in the repo this came from, the harness refactor design lists invariants I1–I24 with "Stated at" and "Pinned by" columns.

29. **Make rules and taxonomies complete, non-overlapping and justified, without listing more than needed.**
    *Why:* a label list chosen up front with no justification undermines the numbers built on it.
    *Example:* in the repo this came from, the owner asked "how are we sure that the label taxonomy is complete ie like a basis", and also "i dont want to over enumerate things".
