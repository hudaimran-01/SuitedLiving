# InsideOut

InsideOut is the HackPrinceton web app for accessible apartment search. The name is provisional.

A person chooses wheelchair, low vision, hard of hearing, stairs and hills, or a mix. The sample listings are then ordered and reported for the home and for sample daily trips around it. Findings stay split into observed features, possible barriers, and unknowns. Neighborhood notes are labeled samples, not a live map.

The four Princeton homes are fictional. The investigation notes are written for the demo.

## Run

From this directory:

```bash
npm install
npm test
npm run dev
```

Open the app and choose **Try the Princeton example**. That search is a 1-bedroom up to $2,400 for a wheelchair user who asked, in their own words, for a grocery store they can get to. Linden Court is the strongest interior, and the life section answers only that grocery trip. Switch the chips to **Stairs and hills** and the same walk is treated as manageable. A request the sample notes cannot check, such as a cafe, stays unanswered.
