# RentIt Frontend Prototype

A frontend-only prototype of the RentIt pitch, built with HTML, CSS, and JavaScript.

## Structure

- `index.html` — main landing page and marketplace UI
- `styles.css` — responsive white, blue, and brown themed design
- `script.js` — simulated item browsing, filters, rental quotes, identity verification, handover checklist, and checkout flow

## What it demonstrates

- Marketplace browsing for local items
- Category filtering, sorting, and visible result counts
- Rental quote generation with duration, RentIt fee, deposit, and total due
- Simulated identity verification UI (selfie + NIN/BVN)
- Community trust score and level progress
- Handover checklist before checkout
- Terms of Service acceptance before payment
- Guarantor link generation mockup

## Run locally

Open `index.html` in a browser.

For a local development server, use any static file server such as:

```bash
cd Practice/RentIt
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
