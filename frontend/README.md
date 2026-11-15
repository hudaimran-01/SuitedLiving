# SuitedLiving

SuitedLiving is the HackPrinceton web app for accessible home search.

A person chooses wheelchair, low vision, hard of hearing, stairs and hills, or a mix. The homes for sale are then ordered and reported for the building and for the sidewalk walk they asked about. Findings stay split into observed features, possible barriers, and what to confirm.

Homes come from the backend builder. `backend/scripts/build_cache.py` reads the CoStar kit and writes `src/listings.json`, including agent notes and photo descriptions. The page also reads `/api/listings` when the API is running, and uses the built file when it is not.

## Run

From this directory:

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). If the command says SuitedLiving is already running, use that address.

Open Homes. With the filters empty, six homes for sale are listed, five in Houston and one in Los Angeles. Choose **Wheelchair search** for a wheelchair user and a grocery store they can get to. Apartments with an interior photo score are listed under the homes and follow that score.
