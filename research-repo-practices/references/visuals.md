# Figures and visuals

How to draw diagrams, figures, charts, explainer videos and design prototypes. For the colour and type rules of a viewer, see [viewer-and-ui.md](viewer-and-ui.md). Each rule gives the rule, why it holds, and an example from the repo it came from.

## What a figure is for

1. **Lead with a figure, then a table, then text. Keep the words on a figure few.**
   *Why:* the owner grasps structure faster from a picture, and a figure full of text is just a paragraph in a box.
   *Example:* in the repo this came from, the owner asked to "make easily understandable in a visual then write full explanation in table and text", and for "a figure (without too much text)".

2. **Draw the general mechanism, as the participants met it. Never draw one example of success.**
   *Why:* an illustrated success reads as if it happened, and a figure tuned to one case does not generalize.
   *Example:* in the repo this came from, a task figure showed one route to the goal. The owner said "thats just an example of it working when in practice, we dont really see that".

3. **Draw the system as built, and mark proposals as proposals.**
   *Why:* a figure of an unbuilt design gets read as the architecture.
   *Example:* in the repo this came from, one doc says "The figures show the system as built, redrawn on 3 Nov 2026; the sketches' text around them is the proposal, kept as written."

4. **Invent no data. Take every number and label on screen from the data.** Give whoever draws the figure the exact strings. Diff every number of two or more digits against the source before showing it.
   *Why:* a worker with a thin brief invents plausible numbers, and no build check catches them.
   *Example:* in the repo this came from, a figure showed "15 episodes · 318 threads · 2,041 acts", which no run had produced.

5. **Strip jargon from diagrams.** Use the words a newcomer would use.
   *Why:* a diagram is often the first thing a newcomer reads.
   *Example:* in the repo this came from, the owner asked to "simplify the diagram ... theres a lot of jargon".

## Diagrams in docs

6. **Use Mermaid for flows.** Label each node with a plain verb phrase, then `<br/>` and the file or command. Label each edge with what passes along it. Keep it near a dozen nodes, near the top of the doc.
   *Why:* a label that pairs a verb with a file ties the picture to the code, and a path checker can read it.
   *Example:* in the repo this came from, the README's flow has nodes such as "Run on EC2<br/>mas cloud-run ... --launch", and the docs index has edges such as "overrides where they disagree".

7. **Use a hand-written SVG for a dense, authoritative figure.** Give it a `<title>` and a `<desc>` that tells the whole figure in prose. Define its colours as CSS variables, with a dark block that falls back to the host page's tokens. Give it its own background. Put module paths in its text. Mark something only some runs have with a dashed outline.
   *Why:* the figure must work as an image, inside a page, in both themes and for a screen reader.
   *Example:* in the repo this came from, `src/monitoring/monitoring-map.svg` follows this pattern.

8. **Keep one content source and generate the reading page from it.** Commit the generated HTML so it opens without a build. Rebuild it after every edit to the source.
   *Why:* two copies edited by hand drift apart.
   *Example:* in the repo this came from, a small build script turns one Markdown doc into a readable HTML page with its figures.

9. **Redraw a figure in the same commit that makes it wrong.**
   *Why:* figures go stale before text does.
   *Example:* see rule 21 in [docs-and-readmes.md](docs-and-readmes.md).

## Charts

10. **Keep a chart readable at any length, density and width.** Labels never overlap. Extra labels fold into "+N more". Axis ticks come from one rounding rule shared by every chart.
    *Why:* a chart that works on one run turns to clutter on a longer or busier one.
    *Example:* in the repo this came from, one shared module picks round time steps whose labels stay at least 10 px apart.

11. **In a chart, give each line pattern one meaning as well as each colour, with one legend for each,** for example colour for a link's kind and pattern for how certain it is. See rule 13 in [viewer-and-ui.md](viewer-and-ui.md).

12. **Render a figure and look at it, in both themes, before showing it.** See rule 31 in [viewer-and-ui.md](viewer-and-ui.md).

## Explainers and videos

13. **Explain a complex design or system with a narrated walkthrough built on one running example.** Length does not matter. Captions must line up with the audio.
    *Why (owner preference):* the owner reviews best by watching and commenting in place.
    *Example:* in the repo this came from, a common background-process command served as the running example. The owner said "i dont actually care about timing", and when asked to explain a folder layout, wanted to "walk me thru every dir and file ... with a video".

14. **Show, don't tell.** Use animation and drawings instead of text boxes. Put a label in a corner instead of narrating it. Do not introduce what the screen already shows.
    *Why:* narration of the obvious crowds out the content.
    *Example:* in the repo this came from, the owner said "we don't have to explicitly introduce everything like 'this is a timeline' ... show, dont tell".

15. **Make each explainer stand on its own, title it by its subject, and keep the shared intro separate from the specifics.**
    *Why:* viewers can skip what they already know, and a vague title tells them nothing.
    *Example:* in the repo this came from, the owner said a title "should actually describe the task", and later videos assumed "the task intro video is already watched".

## Design prototypes

16. **Decide a look with real HTML prototypes on real data, several side by side.** Freeze the current version as a labelled Original beside the options. Design for the general case, not one example.
    *Why:* a look cannot be settled in words.
    *Example:* in the repo this came from, a design plan that described the look in prose got "you gave me mostly words. why even have a video then???". A later review froze the Original from a commit and showed Options A, B and C on the same data. The owner asked "what if no sudo tar?" to test a design against a case it was not built from.

17. **Default prototypes to dark, with a visible light switch.**
    *Why (owner preference):* the owner settled on this for prototypes. A shipped viewer instead follows the machine's theme (see [viewer-and-ui.md](viewer-and-ui.md)).
    *Example:* in the repo this came from, the owner switched a prototype's default several times in one day and settled on dark with a switch.

18. **Build the prototype on synthetic data if real data does not exist yet, but judge and ship on real data, and say which is which.**
    *Why:* synthetic cases let you see every state early, but only real data shows what readers will face.
    *Example:* in the repo this came from, the owner first said "create synthetic ones first" and later "make sure you use real one" for trajectory views.

19. **Hold the bar high.**
    *Why (owner preference):* the owner judges the result as a finished product.
    *Example:* in the repo this came from, the owner asked for work "like a top tier engineering or deisngn firm would release".
