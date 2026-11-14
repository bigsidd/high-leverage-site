# High Leverage Research: the site

An AI investment committee, shown as a two-floor office. Three models argue every stock; I sign the calls that survive. Paper money only.

**Live:** https://bigsidd.github.io/site-high-leverage/

**Status:** design preview. The committee is designed but not running. Everything on the site plays a labeled sample week on made-up tickers (XMPL, SMPL). Nothing here is investment advice, and no real money is involved anywhere.

## What you're looking at

- **The office.** Upstairs: the glass committee room, my office and a library of the rules each seat works under. Downstairs: the logo wall, the double-height record wall, the desk pod and the server room where the scripts run.
  - The three figures with blue face plates are the voting model seats: M1 the analyst who writes the memo, M2 the risk officer who can veto it, M3 the committee that decides.
  - The grey, outlined figures are the bench: five roles that run as scripts and hold no vote until each clears its bar (two clean runs, its own tests and a written decision record).
  - I'm the only person on the floor. The portfolio manager is a person, not a model.
- **The replay.** Once the committee runs, every animation replays a published event from the public log, and nothing moves without a record behind it. The only stamp is my signature, which comes before any call is published.
- **The record.** Every call, signature, veto and loss on one dated rail. Losses stay up at the same size as wins. No edge is claimed until 100 closed calls and six months, whichever comes later.

## How this repo fits

| Repo | Role |
|---|---|
| `site-high-leverage` (this one) | The window: the website |
| `ledger-high-leverage` (later) | The record: append-only calls, scores and the event feed |
| `desk-high-leverage` (later) | The engine: scripts, prompts and evals |

The site will read the ledger. A redesign here can never touch the record.

## Built with

- Static HTML, CSS and plain JavaScript. No framework, no build step, no trackers, no third-party requests.
- Original isometric SVG art, drawn in code from floor coordinates (`assets/floor.js`).
- GSAP 3.13.0 for the replay, vendored in `assets/vendor/` and served from this site. GSAP is free to use under its Standard "no charge" license.
- Fonts are self-hosted from Google Fonts' open-licensed families (SIL Open Font License 1.1): Newsreader, Public Sans and IBM Plex Mono.
- Accessibility:
  - contrast computed at 5.67:1 or better;
  - touch targets of 44 px or more;
  - focus order that follows reading order;
  - a reduced-motion mode that swaps the animation for a stepped list.

## The clip

`clip/` renders the homepage replay to video from the same scene code: `assets/floor.js` draws the office and `assets/home.js` builds the one GSAP timeline the page plays. In a clip, `home.js` adds a cut on top of that timeline: a cold open on the signature, the week replayed in segments at 1.25–1.6× speed with short captions, and an end card. About 25 s. Three outputs:

- `a-week-at-the-desk-4x5.mp4`: 1080×1350, the LinkedIn feed master.
- `a-week-at-the-desk-16x9.mp4`: 1920×1080, for the site and wide players.
- `a-week-at-the-desk-phone.mp4`: 1080×1920, the phone poster video.

They are rendered with [HyperFrames](https://github.com/heygen-com/hyperframes), HeyGen's open-source HTML-to-video renderer:

- **License:** Apache-2.0 (checked on the npm package, `hyperframes`).
- **Version:** pinned to 0.8.218, published 2026-10-30. Releases ship several times a day, so the pin is a release that had been out for two weeks when it was chosen.
- **Install:** `clip/render.sh` installs it into a temporary folder with install scripts skipped, renders, and deletes the folder. It needs Node 22 or newer and ffmpeg. Set `HYPERFRAMES_BROWSER_PATH` to a local Chrome or chrome-headless-shell, or it downloads its own.
- **Telemetry:** the CLI reports usage to PostHog by default. The script turns it off (`DO_NOT_TRACK=1`, `HYPERFRAMES_NO_TELEMETRY=1`).

```bash
site/clip/render.sh
```

The videos land in `site/clip/out/`, which git ignores.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Built by Sidd, [siddharthshah.me](https://siddharthshah.me).
