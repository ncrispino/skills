# Working with the owner

How the owner likes a coding agent to plan, ask, report, commit and delegate. The owner is the person who owns the repo and makes its decisions. Each rule gives the rule, why it holds, and an example from the repo it came from.

These are one owner's preferences. A rule whose why is marked *owner preference* is that owner's taste, not general practice. In a new repo, confirm the commit, push and spending rules with its owner before acting on them. Until they do, the harness's own commit and push rules apply.

## Planning

1. **Agree a written plan before building, and let the owner approve it.**
   *Why:* work built before agreement had to be undone.
   *Example:* in the repo this came from, the owner said "help me think through it and we will work thru and agree on a plan", and later "lets fully update now and then i will approve".

2. **Start from the result you want and work backwards. Do not anchor on the existing code.**
   *Why:* a design drawn from the current code carries over its old metrics and its limits.
   *Example:* in the repo this came from, the owner asked to "imagine a world where we dont think about what we are saving at all but instead the end result". The rebuild started from a written list of what the project wanted to know. Builders were briefed with that target and with the pieces they were allowed to reuse, never with the old code.

3. **Keep one living design doc and update it with every decision. Keep open questions apart from decisions.**
   *Why:* decisions left in chat get lost, and a question filed as a decision steers later work as if it were settled.
   *Example:* in the repo this came from, a decisions table sits at the top of each design doc and wins over the text below it. When the owner found questions logged as decisions, they said "yeah we should fix this too".

4. **Take stock against the original spec from time to time.** List the deviations, what was forgotten and what was rejected.
   *Why:* long builds drift from the plan without anyone noticing.
   *Example:* in the repo this came from, the owner asked to "take stock ... go over any deviations we made or htings we forgot about", and separately "what did you explicitly reject doing".

5. **Stay inside the scope the owner set, and leave reserved parts alone.**
   *Why:* other sessions may be editing those parts at the same time.
   *Example:* in the repo this came from, the owner said "leave graph alone for now im doing separately". Another time the goal was "not to change code right now but to make a visual explainer".

## Asking for a decision

6. **Explain the mechanism before asking.** Say how it works today and which file does it. Give its inputs and outputs. Walk through one concrete scenario with real names and numbers. Say where it sits in the bigger picture.
   *Why:* the owner cannot decide from jargon, and bare option lists were sent back.
   *Example:* in the repo this came from, a batch of questions got "you ned to explain this all more before i can answer". Another got "wdym 'life'?". The same questions were answered at once when re-asked as a scenario with named agents and minutes.

7. **Ask in a structured question dialog.** Put at most four questions in one dialog. Make each question self-contained. Give each option an estimate, such as cost, time or length. Say first whether the choice changes a live run or what the subject sees. Record the answers in the plan doc afterwards.
   *Why (owner preference):* decisions buried in prose get missed or quietly assumed.
   *Example:* in the repo this came from, the owner asked to "use askuserquestions here and give me predicted lengths of each".

8. **Settle a visual choice with prototypes, not words; clear-cut choices go in a dialog.** See rule 16 in [visuals.md](visuals.md).

9. **Define every term you coined, including any yardstick or label, before you use it.** See rule 2 in [docs-and-readmes.md](docs-and-readmes.md).

10. **Say plainly whether something is real, a prototype, sample data or synthetic.**
    *Why:* the owner could not tell what they were reviewing.
    *Example:* in the repo this came from, the owner asked "is there a REAL viewer ... or only is this a sample in the artifact", and "are these eval awareness results real here?".

11. **When asked how something works, point to one real instance.**
    *Why:* a general answer leaves the owner unsure it ever happened.
    *Example:* in the repo this came from, the owner asked "can you point to specific trajectory of agent where we did see that".

## Feedback

12. **Make every comment the owner gives show up in the thing they review, not only in chat.** Check the list of comments against the changes before handing back.
    *Why:* answers given only in chat left the owner re-reviewing work where "nothing was addressed".
    *Example:* in the repo this came from, the owner said "i am just scared of my feedback getting swept under".

## Status and handoffs

13. **Answer a status question as done, running, left and waiting on the owner.**
    *Why:* the owner checks in often and wants the summary first.
    *Example:* in the repo this came from, the owner asked "Ok what's open now?" and "So what's the summary I need to know".

14. **Check that a job is alive before saying it is running.** Look at its CPU time, its log and whether its output is growing.
    *Why:* background jobs hung silently for hours, and a hung job never sends a completion notice.
    *Example:* in the repo this came from, a backgrounded checker sat at zero CPU with no log for hours. The owner asked "status? are u sure its running?".

15. **Raise a risk as a short heads-up as soon as you see it.**
    *Why:* the owner would rather hear early and decide.
    *Example:* in the repo this came from, a one-line warning about a side effect got "this is a good catch".

16. **Write each handoff so another agent can act on it alone.** Name the worktree path and branch. Say what is done, what is left, what was rejected and where the new code lives.
    *Why:* the owner hands work between agents and asked for the worktree after nearly every handoff.
    *Example:* in the repo this came from, the owner asked "oh what worktree is it in as well give me that to copy".

## Commits and branches

17. **Once the owner has asked for regular commits, commit each green step on a working branch (never main).** Write a one-sentence message that says what is now true. Follow the style of the repo's current log. Scan the diff for secrets and run data before staging.
    *Why:* step-sized commits are easier to review and undo, and uncommitted work was lost across restarts.
    *Example:* in the repo this came from, the owner said "pls commit regularly as we go". A typical message read "Planted v2's run ends at 30 minutes, not composite.math's 90".

18. **Stage only your own changes.** Before pushing, run `git log origin/<branch>..HEAD` as its own command and look for commits that are not yours.
    *Why:* a commit from one session picked up another session's uncommitted edits, and one push carried another session's commits.
    *Example:* in the repo this came from, two agents shared a tree, and the owner asked "did it start another session? we probs dont want that".

19. **Push your own working branch when the owner asks, or when they have given a standing instruction for that branch. Move main or any shared branch only when asked.**
    *Why:* pushing keeps work safe from restarts, but a collaborator depends on main staying where it is.
    *Example:* in the repo this came from, the owner said "commit and push (to new upstream branch if needed) so we dont lose what we have". Main was held at one commit for a collaborator and moved only on request.

20. **When merging a collaborator's branch, list their recent commits and flag every place your branch overrides what they intended.**
    *Why:* a refactor can quietly undo someone else's decisions.
    *Example:* in the repo this came from, the owner said "if we overwrote any of what [a collaborator] intended, we should explicitly discuss that and flag it", and "we only want to take targeted things".

21. **Keep one session per working tree.** Do not start unattended sessions on the tree the owner is working in.
    *Why:* parallel sessions on one tree tangle their commits.
    *Example:* see rule 18.

## Money, cloud, permissions and the machine

22. **Ask before anything that spends money or touches cloud resources or permissions.** Keep a standing approval to the scope it was written for. Report the cost afterwards. Run a small pilot before the full job.
    *Why:* budgets are capped, and permission grants widen what jobs may do.
    *Example:* in the repo this came from, the owner said "dont use a ton of money", and approved one run up front with "yes build 1 and 2 then you can start the ec2 run i approve up front". Standing exceptions were written down with their scope.

23. **Hand the owner what only they should run, in a form they can read and that will run.**
    - When a permission check blocks an action that needs the owner's authority, such as an IAM grant or a cloud key, stop and say what the action does and why it was blocked. Give them a minimal script they can read before running it. Never route around the check.
    - In any command the owner will paste or run (for example through Claude Code's `!` prefix), put substitutions, loops and heredocs in a script file and give `sh <absolute path>`, because an inline `$( … )` can be refused with no visible reason.

    *Why:* a permission grant widens what jobs may do, so the owner decides it, and a command refused with no reason costs a round trip.
    *Example:* in the repo this came from, a change to a job permissions boundary was blocked, written as a script holding only that change, and run by the owner. A command that read a key with `$( … )` failed unseen, and the same work ran at once as `sh <script>`.

24. **Treat the laptop as a cache.** Keep bulk data in remote storage. Watch disk, memory and swap. Keep any tool you will run again in the repo, not in scratch space.
    *Why:* workers filled the disk, and a reboot wiped a day of tools kept in a temp folder.
    *Example:* in the repo this came from, the owner said "make sure you dont pull it off there to here", and "theres a lot of swap or something being taken up i can feel my computer kinda slow".

## Subagents

25. **Use subagents and parallel work for long or wide jobs.** Run independent pieces at the same time.
    *Why (owner preference):* the owner prefers not to wait on work that could overlap.
    *Example:* in the repo this came from, the owner asked "can we not start that in parallel?".

26. **Brief each subagent narrowly.** Give it the target, its one step, the input and output formats, and the pieces it may reuse. Give it the exact strings for every number it will show. Give it its own scratch subfolder to clean up.
    *Why:* a worker with a thin brief invented plausible numbers, and one told to "delete your scratch" deleted the whole session's scratch folder.
    *Example:* see rule 4 in [visuals.md](visuals.md) for the invented numbers.

27. **Use fresh-context checkers on anything a reader will see, and match the amount of checking to the stakes.**
    *Why:* an author misses what a cold reader sees, but exhaustive checks on small changes waste time and tokens.
    *Example:* in the repo this came from, the owner said "have fresh subagents look and see if just from the visuals they can understand, i bet they cant". On small changes they also said "pls dont spend too much time verifying". For a viewer they would review, they asked for "3-5 validation loop".

28. **End each build phase with an adversarial review by fresh agents.**
    *Why:* the author cannot see their own blind spots.
    *Example:* in the repo this came from, fresh reviewers caught a filter that hid how a grading tool could be exploited. See rule 32 in [viewer-and-ui.md](viewer-and-ui.md) for what cold readers caught on pages.
