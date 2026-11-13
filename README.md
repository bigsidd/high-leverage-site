# High Leverage Research: the site

An AI equity-research desk built to tell you no, shown as a pixel-art office.

**Live:** https://bigsidd.github.io/high-leverage-site/

**Status:** design preview. The desk is designed but not running yet. Everything on the site plays a labeled sample week with placeholder tickers (XMPL, SMPL). Nothing here is investment advice, and no real money is involved anywhere.

## What you're looking at

- **The office.** Three seated characters are the three model seats: an analyst who writes, a risk officer who can veto, and a committee that decides.
  - The five open desks carry HIRING placards. Each role gets a seat only after it earns one: two clean runs, its own tests, and a written decision record.
  - The portfolio-manager desk is taped off. That role is banned from the public side.
  - The receptionist, the visitor, the lights and the sky are set dressing.
- **The replay.** Once the desk runs, every animation replays a published event from the public log. Nothing animates without a record behind it. The only stamp is the human approval that comes before a call is published.
- **The record.** A timeline of every call, stamp, veto and loss. Losses are pinned at the same size as wins. No edge is claimed until 100 closed calls and six months, whichever comes later.

## How this repo fits

| Repo | Role |
|---|---|
| `high-leverage-site` (this one) | The window: the website |
| `high-leverage-ledger` (later) | The record: append-only calls, scores and the event feed |
| `high-leverage-desk` (later) | The engine: scripts, prompts and evals |

The site will read the ledger. A redesign here can never touch the record.

## Built with

- Static HTML, CSS and plain JavaScript. No framework, no build step, no trackers, no third-party requests.
- Original pixel sprites.
- Fonts are self-hosted from Google Fonts' open-licensed families (SIL Open Font License 1.1): Newsreader, Public Sans, IBM Plex Mono and Silkscreen.
- Accessibility:
  - contrast computed at 5.67:1 or better;
  - touch targets of 44 px or more;
  - focus order that follows reading order;
  - a reduced-motion mode that swaps the animation for a stepped list.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Built by Sidd, [siddharthshah.me](https://siddharthshah.me).
