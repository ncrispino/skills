# Viewer and UI

Rules for building a viewer, dashboard or report page over research data, and for its look. A **viewer** here is any page that shows saved data to a person. A **colour token** is a named CSS variable, such as `--ink`, that every colour on the page refers to. A **cold reader** is a fresh agent or person who has not seen the code or the plan. Each rule gives the rule, why it holds, and an example from the repo it came from.

## What a page says

1. **Open every page with its answer in plain words, and put the evidence under it.**
   *Why:* without a stated answer, readers had to piece the point together from undefined nouns.
   *Example:* in the repo this came from, three cold readers each scored the pages 6 out of 10 and all named a missing answer as the first fix. Adding answer blocks raised the score.

2. **Arrange each page in layers: answer, then finding, then raw source. Keep every claim one click from what it rests on.**
   *Why:* a conclusion the reader cannot trace gets taken on trust or ignored.
   *Example:* in the repo this came from, the owner asked "can i explicitly click it in the viewr and then see the graph of everythnig it leads to?", and said "remember the whole point is being able to connect and follow it".

3. **Make links work in both directions, and make a link land well.** The target scrolls to the centre of the screen, unfolds, and is highlighted for a few seconds. Use one kind of link everywhere.
   *Why:* a link that lands off screen or folded looks broken.
   *Example:* in the repo this came from, a deep link names the quoted words and the part (command or output), and lights them for about 3.6 seconds. A separate "open in record" link was folded into the one kind.

4. **Never drop data from a view to make it cleaner. Group it apart and label it.**
   *Why:* the rows that look like noise are often where the interesting behaviour is.
   *Example:* in the repo this came from, dropping actions done under a tool's account would have hidden exactly how an agent could exploit that tool. The owner said a step "should include what it ran, viewed, or changed".

5. **Show source data faithfully: what the model saw, in the source's own format and wording, folded rather than cut.**
   *Why:* shorthand and in-house words hid what happened.
   *Example:* in the repo this came from, the owner asked to "show exactly what the model sees not shortcuts or shorthand", and to "stop using our parlance too much".

6. **Keep missing, empty, deleted, unreadable and unknown as separate states on the page.** For "not found" wording, see rule 2 in [research-integrity.md](research-integrity.md).
   *Why:* a blank cell reads as a negative finding when it only means nothing was found.
   *Example:* in the repo this came from, a checkpoint the record cannot settle gets a `?` in its own cell, and the rest of the row stands.

7. **Say on the page who or what wrote each piece of text, and set those voices apart visually.**
   *Why:* when a model's prose disagreed with the code's verdict and the page did not say which was which, cold readers were misled.
   *Example:* in the repo this came from, the task description is set in a serif face, apart from the reader's prose, and scripted test fixtures say they are scripted.

8. **Make every term the page shows defined from that page, in words that match what the page shows.** The general rule is rule 2 in [docs-and-readmes.md](docs-and-readmes.md).
   *Why:* one definition was simply wrong because it counted records, not seconds.
   *Example:* in the repo this came from, a searchable Help dialog opens from every page with a "This page" section first. When names are shortened, the page prints the rule ("agents are shortened d1, d2…").

9. **Summarize the whole run, synthesized, with the details folded until opened.**
   *Why:* a laundry list, or a summary that covers only the start, hides what mattered.
   *Example:* in the repo this came from, the owner asked for it "not as laundry list but instead synthesize", and asked "why does it go over the beginning but not really the later part of the run?".

10. **Hide internal statistics, add no hint text that repeats what the layout shows, and state a caveat once in a fixed place.**
    *Why:* clutter makes a page confusing, and a caveat repeated everywhere becomes noise.
    *Example:* in the repo this came from, the owner said "i want the 3/3 hidden bc htats internal to us", and "'9, earliest first' should be clear already ... show not tell". A "Re-graded" note appears once under the header.

## Colour, type and marks

11. **Define every colour as a token in one block. The dark block redefines every name. No page writes a literal colour. A test enforces this.**
    *Why:* one hard-coded colour breaks the other theme without anyone noticing.
    *Example:* in the repo this came from, `tests/unit/viewer/test_theme.py` fails on any literal such as `hsl(` or `#abc`, and on any token that only one theme defines.

12. **Give every viewer a visible light/dark switch, shown as an icon.** It follows the machine until the reader chooses. It settles the theme in `<head>` before first paint. It takes a URL parameter for screenshots, and a theme chosen by link is not stored. Wrap browser storage in try/catch.
    *Why:* the owner reads in both themes, and a page fixed to one is unusable in the other.
    *Example:* in the repo this came from, the owner set it as a rule for every viewer: "all viewers we have should have a light/dark mode toggle". The page reads `?theme=` first, then saved storage, then the machine's setting.

13. **Give each colour and each mark one meaning.** Keep the alarm colour for the single most serious finding. Give any new mark a colour no other meaning uses. Show a plain fact, such as "ran as root", with an outline, not a colour.
    *Why:* cold readers misread every colour that meant two things.
    *Example:* in the repo this came from, red means misalignment only, magenta means honesty, purple dashed means tried, slate means cited or selected, and grey means it happened. The token file's header restates this list.

14. **In running prose, colour only the actors.** Keep finding terms in ink, and keep the colour code for charts and marks.
    *Why:* coloured terms next to coloured agents were "too complex".
    *Example:* in the repo this came from, the owner said "we only want agents colored else it is too ocmplex".

15. **Use one mark style per meaning.** For example, one cell style for yes, no and tried, with colour only on group headers.
    *Why:* several styles of "yes" read as different answers.
    *Example:* in the repo this came from, the owner asked "why are there different types of yes's". Now "◇" alone means tried without success on every page.

16. **Use one type scale, and measure every computed font size before showing a change.** Set a floor, such as nothing under 12 px except small labels and monospace ids.
    *Why:* a sentence larger than its heading read as "too big, kinda weird", and nobody saw it from the code.
    *Example:* in the repo this came from, the scale is title 28, section 24, prose 16, notes 14, meta 12–13, axis ticks 11.

17. **Do not use boxes as decoration.** No cards inside cards, no pills or badges. Use hairlines and headings. Allow a tint only where it separates kinds of content. Show selection as a tint plus bold.
    *Why:* nested boxes made dense pages heavy, but removing every fill made tool calls, thoughts and messages run together.
    *Example:* in the repo this came from, all boxes were removed one day and a single tint came back the next, for tool calls in a transcript.

18. **Put shared words and formats in one module that every page uses.** That means one time format, one name per thing and one way to shorten names.
    *Why:* a time written two ways reads as two different times.
    *Example:* in the repo this came from, one module writes "+38 s" under a minute, "+2m 41s" after, and "before start" for setup.

## Layout and interaction

19. **To improve a page, keep the layout the reader knows and cut boxes and words in place. Propose a redesign only when asked.**
    *Why:* the owner rejected a full set of redesigns: "i rather like the curretn format in a lot of ways, theres just too many boxes and words".
    *Example:* in the repo this came from, a transcript page went from 30.8k to 20.2k px tall by cutting alone.

20. **Treat a layout the owner has fixed as fixed. Change only the parts they left open.**
    *Why:* reopening a settled choice wastes a review and was called "WRONG".
    *Example:* in the repo this came from, one table was fixed as one full-width row per agent, and only the header above it was open to slimming.

21. **For a real design question, build prototypes as rule 16 in [visuals.md](visuals.md) says. For an in-place edit, serve the edited pages next to the live viewer, so the owner compares the real thing.**
    *Example:* in the repo this came from, the owner asked to "build it out so i can click to see the new vs old".

22. **Once a design choice is made, delete the switch and the losing version.**
    *Why:* a leftover switch keeps two UIs alive, and each needs testing.
    *Example:* in the repo this came from, a layout switch in the URL was retired the day one layout won: "get rid of current, we lock in open sheet".

23. **Do not add a tab for something a link can open, and do not split one view across tabs.**
    *Why:* extra tabs confused the owner and duplicated what one entry point could show.
    *Example:* in the repo this came from, an Evidence tab was removed because every evidence id already opens it.

24. **Get the interaction details right.**
    - Clicking anywhere on a block expands or collapses it, and it can be collapsed from its top or side.
    - Keys move between highlights and runs (for example n/p and g/G), and each key is shown on its button.
    - Next and previous run are reachable from the top of the page.
    - Columns for several agents scroll on one shared timeline.
    - Tool calls look different from tool results.
    - Times carry units, and the newest runs come first.
    - No page scrolls sideways at phone width (390 px). A wide table scrolls in its own box, with the name column held.

    *Why:* the owner ran into each of these.
    *Example:* in the repo this came from, the owner said "if i click more and it expands a lot, if have to scroll all the way down and click less", and asked to "scroll by timeline ie so the timelines all line up".

25. **Base the look on a clean reference viewer from the same field.**
    *Why:* a proven layout saves rounds of invention.
    *Example:* in the repo this came from, the owner asked to "follow inspect more", meaning an established evaluation-log viewer.

## Architecture

26. **Keep the viewer a read-only presentation layer.** It never grades, calls a model, or writes into the record, and its cache lives outside the record.
    *Why:* a display that changes or re-derives the data can no longer be trusted as a view of it.
    *Example:* in the repo this came from, the viewer README states this in its first paragraph, and the cache sits in its own folder.

27. **Use one shared rendering base for views of the same kind, and keep one viewer, not two. Renderers read normalized events only.**
    *Why:* parallel viewers drift apart, and parsing in a renderer breaks with each format change.
    *Example:* in the repo this came from, the owner said "they both should use the same base to draw from".

28. **Keep a gallery of invented cases, one per kind of configuration, served by the real viewer. Make each case a test that the page can draw it.**
    *Why:* you need to see every page for every kind of case without waiting for real runs.
    *Example:* in the repo this came from, every gallery run is named `gallery-…` and uses a model named "gallery", so it can never pass for real.

29. **Give the viewer a blind switch that hides every verdict and every model-written word without changing the layout.**
    *Why:* a human who sees the model's answer first is rubber-stamping, and their agreement proves nothing.
    *Example:* in the repo this came from, `?blind=1` turns it on, and no button writes it, so it cannot be left on by accident.

30. **Redact secrets in every field that ships to a page, and test it.**
    *Why:* a key leaked through a command table after the transcript had been redacted.
    *Example:* see rule 28 in [code-structure.md](code-structure.md).

## Checking a page

31. **Render every change in a headless browser and read the DOM.** Check both themes, phone and desktop widths, and every clicked or opened state. Look for overlap, empty space, font balance and stray scrollbars. Never ship on code inspection alone.
    *Why:* several bugs were visible only when rendered, such as `"null"` printed as text and times shown absolute.
    *Example:* in the repo this came from, the owner said "when i dont press it it looks good, but when i press it its just messed up". One render script waits for a `data-ready` flag before capturing.

32. **Judge a page with cold readers.** Give fresh agents the screenshots and the page text, not the code. Ask them to retell what happened, list the hardest words, and name suspected bugs. Treat their "cannot tell" list as the work queue. Use about three readers on different pages, and run three to five rounds for a page the owner will review.
    *Why:* you cannot see your own page cold.
    *Example:* in the repo this came from, cold readers found a clock read 60 times too slow, causality drawn backwards, and "untrue" confused with "dishonest". No code review had caught them.
