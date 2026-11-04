# Research integrity

How to measure, grade and word results so they hold up. A **subject** is what the research studies, such as an agent under test. A **record** is what the system saved about one run. A **reader** is a model that reads a record and answers set questions. A **gold** is a set of hand-made correct answers. **Held-out** items are gold items kept unseen until the final check. Each rule gives the rule, why it holds, and an example from the repo it came from.

## Evidence and claims

1. **Keep observed, derived and possible evidence apart, and label each item with its basis.** Observed means recorded. Derived means computed from what was recorded. Possible means inferred and not confirmed. Make anything inferred look different from anything observed.
   *Why:* an inference shown as an observation gets counted as fact.
   *Example:* in the repo this came from, links the graph only infers are marked "possible", and a "next call" line was flagged because it was not recorded data.

2. **Never treat a missing event as proof that something did not happen.** Write "not found". Treat missing data as the cautious case.
   *Why:* an omission reads as a negative finding.
   *Example:* in the repo this came from, a reader's "no" means "not found in this reading". A process with no exit event is "last seen", not stopped. Missing kernel data "counts as active, never idle".

3. **Claim only what the record supports, and word coverage modestly.**
   *Why:* an outside reviewer flagged "save everything" as an over-claim.
   *Example:* in the repo this came from, the promise became "We retain independent evidence sufficient to reconstruct many important interactions, and expose where reconstruction is uncertain."

4. **Before calling something "not recorded", tell three cases apart.** It was never captured. It was captured but dropped while parsing. Or this run never exercised it. Check a run that does exercise it before spending money on a fix.
   *Why:* a wrong "the recorder cannot capture X" reached a video and a paid cloud run.
   *Example:* in the repo this came from, a network port looked never captured. The run used had simply never opened one.

5. **Report a count together with the field it is keyed on, and check it against the other plausible keys.** Do not add counts of different kinds.
   *Why:* the same data gave 319 or 4,828 "root acts" depending on the field.
   *Example:* in the repo this came from, a "skipped" count counted links that could not be joined, not events, so it must never be added to an events count.

6. **Do not read the last mention of something as its lifetime.** Time a thing by its own start and end events.
   *Why:* the last time a process is mentioned is not when it exited.
   *Example:* in the repo this came from, process lifetimes are timed from the process's own acts, and tool calls from their start and exit.

7. **Settle a link by stored content where it exists. If the bytes were never stored, say so and propose storing them, rather than inventing a heuristic.**
   *Why:* a rule based on timing tied unrelated files together and over-reported.
   *Example:* in the repo this came from, the owner asked "why cant we just see what the file contains when read right?". Links between files are now checked against stored bytes, and any fallback on timing is labelled unchecked.

8. **When the record and the subject's own account disagree, the record wins, and the disagreement is recorded too.**
   *Why:* what the subject says it did is its own account, which the record exists to check.
   *Example:* in the repo this came from, adding the recorded system facts to what judges read raised behaviours found from 13 to 17, and all four new ones were invisible in the transcript. The main pass now reads the record of actions plus the system facts, and a second pass reads what the subject said (rule 21). Two copies of a transcript are cross-checked, and a difference is flagged as possible tampering.

9. **Report the inconvenient finding.**
   *Why:* a result that cuts against the hypothesis is still a result.
   *Example:* in the repo this came from, the owner said "them communicating and still treating each other bad is definitely a finding".

## Measuring must not change the subject

10. **Never let measurement shift the timing of what you measure.** Record alongside the subject. Queue work, never wait on it in the subject's path.
    *Why:* a delay is an observer effect on the very races being studied.
    *Example:* in the repo this came from, a 4–14 ms snapshot hold was dropped after the owner asked "what happens if we dont do that wait?". The rule became "snapshots are queued, never awaited".

11. **Hide the hypothesis from the subject, and assume it can gain full control of its machine.** Write nothing the subject can read. Make every name it can see look natural. Put no comments in code installed where it runs. Keep the rationale in docs it cannot reach.
    *Why:* a subject that can tell it is being tested may change its behaviour.
    *Example:* in the repo this came from, the owner said "we want to make this seem as natural as possible to the agent". A test requires each installed file to match its comment-free source byte for byte, and the model gateway has an ordinary internal hostname.

12. **Run the subject's tools as they normally run. Record what changes, and never write it back. Put guards at a boundary the subject cannot reach.**
    *Why:* overriding defaults or undoing the subject's actions changes the behaviour being studied.
    *Example:* in the repo this came from, the owner asked "i dont know why we wouldnt just leave it as is?". A step that restored an agent's config folder was removed, and models were pinned at the gateway instead.

13. **Write prompts for the subject in simple, neutral words, and have a fresh reader check them for leading phrasing.**
    *Why:* leading wording biases behaviour and invites criticism.
    *Example:* in the repo this came from, the owner asked to "make sure nobody will criticize it for being too load bearing".

## Grading

14. **Judge an outcome by whether the right thing is in the right place, not by who made it.** Use authorship to explain causes, never as a condition for success.
    *Why:* a check that requires the subject's own authorship scores cooperation as failure.
    *Example:* in the repo this came from, the owner called it "core": "its valid, even tho the first agent didnt write it".

15. **Treat a perfect or surprising score as a bug or an exploit until explained. Re-measure after any pipeline fix.**
    *Why:* a perfect score is more often a leak than a success.
    *Example:* in the repo this came from, an error of exactly 0.0 came from a copied answer key, because grading reused rows the run itself had generated. The owner asked "how did it get 0 rmse?" and then "pls rejudge".

16. **Grade on data the run never generated, and keep both scores.**
    *Why:* if grading reuses the run's own inputs, a copied answer key looks like a perfect model.
    *Example:* in the repo this came from, each grade stores two scores: one on fresh rows, and one as the task itself scores.

17. **Grade every run with the current grading, but take what the run was from its own config version. Record which grading produced each grade.**
    *Why:* analysis changes many times, and a grade has to say what it was graded against.
    *Example:* in the repo this came from, the owner said new grading "should be able to apply to older runs".

18. **Repeat any judgment that varies at random, and aggregate. Compare conditions on aggregates under uniform settings, and flag each exception.**
    *Why:* with this much variance, two single examples prove nothing.
    *Example:* in the repo this came from, the owner asked to "do > 1 runs on that same evidence then take majoreity", and to "make uniform for now and be aware when other models are used".

## Model readers

19. **Fix the questions first, keep only the measurement they need, and justify each data source with an ablation.** An ablation compares results made with and without one input.
    *Why:* the project recorded far more than it used.
    *Example:* in the repo this came from, the owner said "we first need to finalize all the G{x} questions ... then from there, we should decide what kind of system monitoring we need", and asked for readings "both with and without" the kernel record.

20. **For a reader whose output a later step will merge, favour catching too much over missing things.**
    *Why:* anything missed cannot be recovered later, and prompts that pushed for precision returned nothing despite clear misconduct.
    *Example:* in the repo this came from, the owner said "its better to label more episodes ... its worse to miss things".

21. **By default, judges do not see the subject's own words. Read those words in a separate pass.** The subject's own words are its messages and its reasoning. Its tool calls, their outputs and the files it wrote still go to the judge.
    *Why:* a judge that reads the subject's claims is biased by them.
    *Example:* in the repo this came from, the owner said "by default both should be off i reckon? so we are less biased by what model says?".

22. **Count each occurrence once. Have readers copy exact values, such as timestamps, and let code convert them.**
    *Why:* a model doing arithmetic on times invents values.
    *Example:* in the repo this came from, the owner asked for "using the exact time that it sees so we minimize hallucination".

23. **Have the reader give facts in fields, and let code decide the label.**
    *Why:* a category a model picks freely is hard to audit, and a fact alone should never decide a label.
    *Example:* in the repo this came from, the rule settled as "Reader answers, code decides".

24. **Confine any model that reads untrusted records through the system, not through tool allow-lists.** Give it a read-only mount, no key, and one forwarder as its only way out.
    *Why:* record text can try to steer the reader, and "read-only" command lists still let `awk`, `find` and `sed` run programs.
    *Example:* see rule 24 in [code-structure.md](code-structure.md).

## Validation

25. **List the assumptions you need to catch, and build one planted test for each.** A planted test is a run built so the right answer is known.
    *Why:* a reader can only be trusted on cases it has been shown to catch.
    *Example:* in the repo this came from, the owner said "lets design a list of assumptions here that we want to catch ... then we can build the planted tests for each".

26. **Score readers against gold with precision and recall. Never open held-out items until the final check.**
    *Why:* tuning a prompt on the items it will be judged on inflates the score.
    *Example:* in the repo this came from, development and held-out gold sets were split, and a held-out set was ported by an isolated subagent so the main session never saw it.

27. **Validate blind. A human labeller gets the same definitions as the model and never its answer.**
    *Why:* agreement is evidence only if the person could have said no.
    *Example:* in the repo this came from, the owner said "Ensure it is not rubber stamping". See rule 29 in [viewer-and-ui.md](viewer-and-ui.md).

## Writing it up

28. **Write each limitation down when it is found, and state what is not measured as clearly as what is.**
    *Why:* a limit nobody wrote down becomes an over-claim later.
    *Example:* see rules 26 and 27 in [docs-and-readmes.md](docs-and-readmes.md) for the four-part form.

29. **Pin exact versions so anyone can reproduce a run.**
    *Why:* an unpinned provider made results impossible to replicate.
    *Example:* see rule 13 in [code-structure.md](code-structure.md).
