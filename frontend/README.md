# InsideOut

InsideOut is the HackPrinceton web app for accessible home search. The name is provisional.

A person chooses wheelchair, low vision, hard of hearing, stairs and hills, or a mix. The sample listings are then ordered and reported for the home and for sample daily trips around it. Findings stay split into observed features, possible barriers, and unknowns. Neighborhood notes are labeled samples, not a live map.

Homes come from the backend builder. `backend/scripts/build_cache.py` reads the CoStar kit and writes `src/listings.json`, including agent notes and photo descriptions. The page also reads `/api/listings` when the API is running.

## Run

From this directory:

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). If the command says InsideOut is already running, use that address.

Open Homes. With the filters empty, all four sample homes for sale are listed, two in Houston and two in Los Angeles. Choose **Sample search** for a 1-bedroom up to $1,200,000, a wheelchair user, and a grocery store they can get to. Linden Court is the strongest interior, and the life section answers only that grocery trip. Switch the access chip to **Stairs and hills** and the same walk is treated as manageable. A request the sample notes cannot check, such as a cafe or a bus stop, stays unanswered.
