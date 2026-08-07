# The x402 Suite

**Fifty open-source services that let AI agents buy real things.**

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![x402](https://img.shields.io/badge/protocol-x402-0052ff.svg)](https://x402.org)
[![Repos](https://img.shields.io/badge/repos-50-success.svg)](#the-catalog)

[x402](https://x402.org) revives HTTP's long-dormant `402 Payment Required` status code: a
server answers an unpaid request with a price, the client signs a gasless USDC transfer, retries
with an `X-PAYMENT` header, and gets the goods. No API keys, no accounts, no subscriptions, no
signup funnel — which is exactly what an autonomous agent needs, because an agent cannot fill in
your credit card form but it can sign a payment.

This suite takes that primitive and builds out the layer above it: **agentic commerce.** Booking a
table, holding a flight, buying a book, shipping a package, funding a bounty, splitting a bill.

---

## The one rule

> Every paid route MUST return the purchased artifact in the 200 response body (data, content, signed token, confirmation, or receipt-of-action). No pay-now-deliver-later routes. Async patterns become pay-per-poll (return snapshot+delta now) or return a signed claim instrument immediately.

Every paid route in all fifty repos obeys it. Payment and delivery happen in the same round trip:
you pay `POST /book` and the 200 response body *is* your reservation — id, confirmed time,
refund terms, and a calendar invite. Nothing is promised for later. Where a use case is inherently
asynchronous (watching a price, monitoring a queue), it is restructured as **pay-per-poll** — each
paid call returns a fresh snapshot plus the delta since your last one — or it returns a **signed
claim instrument** you hold immediately.

## How a paid call actually works

```
  GET /availability
    └─→ 402 Payment Required
        accepts: [ { network: base-sepolia, asset: USDC, payTo: 0x40252…402 },
                   { network: solana,       asset: USDC, payTo: Wwwu…T3WwW } ]

  the client picks a rail and signs   (EVM: EIP-3009 transferWithAuthorization, gasless
                                       Solana: an SPL USDC transfer)

  GET /availability   X-PAYMENT: <signed payload>
    └─→ server verifies + settles through that rail's facilitator
    └─→ 200 OK   { slots: [...] }   X-PAYMENT-RESPONSE: <settlement receipt>
```

**Two chains, two clients, one protocol.** Every paid route answers with *both* a Base and a
Solana payment option and settles whichever the caller signs — EVM through the x402.org
facilitator, Solana through PayAI's. Agents use [`x402-fetch`](https://www.npmjs.com/package/x402-fetch)
(every repo ships a runnable example). Humans get a wallet checkout via the drop-in
[`@three-ws/x402-payment-modal`](https://www.npmjs.com/package/@three-ws/x402-payment-modal),
wired into the demo page of every repo that has a human-facing side.

## Receiving addresses

| Rail | Network | Address |
|---|---|---|
| EVM | Base / Base Sepolia | `0x40252CFDF8B20Ed757D61ff157719F33Ec332402` |
| Solana | Solana | `WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW` |

These are the shipped defaults so every service runs the moment you clone it. Point them at your
own wallet with `PAY_TO_ADDRESS` and `SOLANA_PAY_TO_ADDRESS`.

> A note on `x402-express`: it takes a single `payTo` and therefore a single chain, so it cannot
> express a dual-rail offer. Each service hand-rolls a small `src/payments.ts` that builds both
> `PaymentRequirements` with x402 core and verifies either through `useFacilitator`.

## Every repo ships

| | |
|---|---|
| **Working code** | TypeScript, strict, ESM, Express. Runs on defaults with no config at all. |
| **Dual-rail payments** | Every paid route offers Base *and* Solana; the caller picks. |
| **`skill.md`** | The agent-facing capability file — endpoints, prices, schemas, payment instructions. |
| **`openapi.json`** | Served at `/openapi.json` — the canonical discovery contract [x402scan](https://x402scan.com) reads. Payable operations carry `x-payment-info`. |
| **`/.well-known/x402`** | Machine-readable resource manifest, for the x402 Bazaar and [agentic.market](https://agentic.market). |
| **Docs site** | GitHub Pages: landing page, tutorial, API reference, and an agent integration guide. |
| **Examples** | `x402-fetch` agent client, raw curl walkthrough, MCP tool recipe. |
| **Apache-2.0** | Use it, fork it, sell it. |

## Runs without a single paid API key

Keyless public APIs — Open-Meteo, NWS, RDAP, CoinGecko, SEC EDGAR, GDELT, arXiv, Crossref,
Semantic Scholar, OpenLibrary, Gutendex, Overpass, UK Carbon Intensity, public GTFS feeds — are
called **live**. Services on keyed APIs (Amadeus, Ticketmaster, Kroger, eBay, Lob, Shippo, TMDB)
use free developer tiers when you supply a key and otherwise return deterministic fixtures
explicitly labeled `source: "fixture"`. The supply-side servers own their inventory outright.
Payments themselves are real from the first minute: Base Sepolia testnet by default, mainnet with
two environment variables.

---

## The catalog

### Supply-side booking servers

Self-hosted servers a business runs itself, so the inventory is real by definition. An open-source Resy, Calendly, and storefront that AI agents can transact with directly.

| Repo | What it does | Docs |
|---|---|---|
| **[x402-tablebook](https://github.com/nirholas/x402-tablebook)** | Open-source Resy: a self-hosted restaurant reservation server that AI agents can book via x402 refundable holds | [docs](https://nirholas.github.io/x402-tablebook/) |
| **[x402-bookable](https://github.com/nirholas/x402-bookable)** | Self-hosted Calendly with x402: salons, doctors, consultants sell appointment slots directly to agents and humans | [docs](https://nirholas.github.io/x402-bookable/) |
| **[x402-classes](https://github.com/nirholas/x402-classes)** | Class and session booking server — fitness studios and workshop hosts sell seats per-class via x402 | [docs](https://nirholas.github.io/x402-classes/) |
| **[x402-rentals](https://github.com/nirholas/x402-rentals)** | Time-slot rental server for courts, rooms, and equipment — reserve and pay per block with x402 | [docs](https://nirholas.github.io/x402-rentals/) |
| **[x402-queue](https://github.com/nirholas/x402-queue)** | Live waitlist server — pay to join a queue, receive a signed position token, auto-refund if never served | [docs](https://nirholas.github.io/x402-queue/) |
| **[x402-storefront](https://github.com/nirholas/x402-storefront)** | Self-hosted store with x402 checkout — sell digital goods (delivered in-response) and physical goods (signed order confirmation) | [docs](https://nirholas.github.io/x402-storefront/) |

### Services on real, live APIs

Backed by genuine upstream data — keyless APIs are called live out of the box; keyed APIs use free developer tiers and fall back to labeled fixtures so every demo runs without a single paid key.

| Repo | What it does | Docs |
|---|---|---|
| **[x402-flight-search](https://github.com/nirholas/x402-flight-search)** | Pay-per-query flight search over the Amadeus API — offers, live pricing, and fare-drop checks for agents | [docs](https://nirholas.github.io/x402-flight-search/) |
| **[x402-hotel-search](https://github.com/nirholas/x402-hotel-search)** | Pay-per-query hotel search and offer pricing over Amadeus — agents shop rooms without accounts | [docs](https://nirholas.github.io/x402-hotel-search/) |
| **[x402-transit](https://github.com/nirholas/x402-transit)** | Transit trip planning and live delay snapshots from open GTFS/GTFS-RT feeds, priced per query | [docs](https://nirholas.github.io/x402-transit/) |
| **[x402-campsites](https://github.com/nirholas/x402-campsites)** | Campground search and availability from the official Recreation.gov RIDB API, per-lookup pricing | [docs](https://nirholas.github.io/x402-campsites/) |
| **[x402-activities](https://github.com/nirholas/x402-activities)** | Tours and activities search via Amadeus — agents find bookable experiences by location | [docs](https://nirholas.github.io/x402-activities/) |
| **[x402-places](https://github.com/nirholas/x402-places)** | POI concierge over OpenStreetMap Overpass with optional Yelp enrichment — restaurants, cafes, anything, per query | [docs](https://nirholas.github.io/x402-places/) |
| **[x402-events](https://github.com/nirholas/x402-events)** | Event search and on-sale checks over Ticketmaster Discovery — agents find real events and ticket windows | [docs](https://nirholas.github.io/x402-events/) |
| **[x402-movies](https://github.com/nirholas/x402-movies)** | Movie catalog concierge over TMDB — search, details, and recommendations per query | [docs](https://nirholas.github.io/x402-movies/) |
| **[x402-books](https://github.com/nirholas/x402-books)** | Agents buy clean, chaptered full-text public-domain books — OpenLibrary search, Gutenberg delivery, in-response | [docs](https://nirholas.github.io/x402-books/) |
| **[x402-research](https://github.com/nirholas/x402-research)** | Scholarly search over arXiv, Crossref, and Semantic Scholar — papers, citation graphs, formatted bibliographies | [docs](https://nirholas.github.io/x402-research/) |
| **[x402-news-wire](https://github.com/nirholas/x402-news-wire)** | Global news query service over GDELT — article sets, timelines, and delta pulses, per query | [docs](https://nirholas.github.io/x402-news-wire/) |
| **[x402-markets](https://github.com/nirholas/x402-markets)** | Crypto prices via CoinGecko and SEC filings via EDGAR — real market data per lookup | [docs](https://nirholas.github.io/x402-markets/) |
| **[x402-weather-guard](https://github.com/nirholas/x402-weather-guard)** | Go/no-go weather decisions for plans — forecasts and verdicts from Open-Meteo/NWS, keyless and live | [docs](https://nirholas.github.io/x402-weather-guard/) |
| **[x402-carbon](https://github.com/nirholas/x402-carbon)** | Grid carbon intensity now and best-window scheduling — keyless live data for green agents | [docs](https://nirholas.github.io/x402-carbon/) |
| **[x402-grocery](https://github.com/nirholas/x402-grocery)** | Real grocery product search and cart building over the Kroger API, priced per operation | [docs](https://nirholas.github.io/x402-grocery/) |
| **[x402-shop-scout](https://github.com/nirholas/x402-shop-scout)** | Live marketplace intelligence over eBay Browse — listings search and is-this-a-deal verdicts | [docs](https://nirholas.github.io/x402-shop-scout/) |
| **[x402-shipping](https://github.com/nirholas/x402-shipping)** | Rate shopping and label generation via Shippo/EasyPost test mode — agents ship things, label returned in-response | [docs](https://nirholas.github.io/x402-shipping/) |
| **[x402-print-mail](https://github.com/nirholas/x402-print-mail)** | Agents send physical letters and postcards via Lob's test environment — preview PDF returned in-response | [docs](https://nirholas.github.io/x402-print-mail/) |
| **[x402-notify](https://github.com/nirholas/x402-notify)** | Real message delivery per-message: Telegram bot messages and SMTP email with delivery receipts in-response | [docs](https://nirholas.github.io/x402-notify/) |
| **[x402-domains](https://github.com/nirholas/x402-domains)** | Authoritative domain availability and expiry intel via RDAP — keyless, live, per lookup | [docs](https://nirholas.github.io/x402-domains/) |
| **[x402-github-bounty](https://github.com/nirholas/x402-github-bounty)** | Fund GitHub issues with x402 — signed bounty certificates, merged-PR verification reports, settlement receipts | [docs](https://nirholas.github.io/x402-github-bounty/) |
| **[x402-podcasts](https://github.com/nirholas/x402-podcasts)** | Podcast search and episode intel over the Podcast Index API, per query | [docs](https://nirholas.github.io/x402-podcasts/) |

### Agentic commerce infrastructure

The plumbing every paid agent service needs: discovery, refundable holds, wallet policy, receipts, approvals, and an MCP bridge into Claude and GPT.

| Repo | What it does | Docs |
|---|---|---|
| **[x402-skill-md](https://github.com/nirholas/x402-skill-md)** | The skill.md toolkit: generate and validate agent-discoverable skill files (the agentres.dev pattern) from OpenAPI specs | [docs](https://nirholas.github.io/x402-skill-md/) |
| **[x402-skill-registry](https://github.com/nirholas/x402-skill-registry)** | Searchable registry of x402-paid agent skills — register with a signed listing, agents search per query | [docs](https://nirholas.github.io/x402-skill-registry/) |
| **[x402-refund-hold](https://github.com/nirholas/x402-refund-hold)** | The $0.01 refundable-hold pattern as drop-in Express middleware — charge a hold, auto-refund on failure, ledger included | [docs](https://nirholas.github.io/x402-refund-hold/) |
| **[x402-agent-wallet](https://github.com/nirholas/x402-agent-wallet)** | Wallet policy daemon for agents — budgets, per-merchant caps, approval thresholds, signed policy verdicts | [docs](https://nirholas.github.io/x402-agent-wallet/) |
| **[x402-receipts](https://github.com/nirholas/x402-receipts)** | Receipts and accounting for agent spending — enriched on-chain receipt lookups and ledger exports | [docs](https://nirholas.github.io/x402-receipts/) |
| **[x402-browser-bridge](https://github.com/nirholas/x402-browser-bridge)** | Framework that turns any website flow into an x402-paid API — declare a flow in YAML, Puppeteer executes, artifact returned in-response | [docs](https://nirholas.github.io/x402-browser-bridge/) |
| **[x402-otp-relay](https://github.com/nirholas/x402-otp-relay)** | The 'code sent to your email' step, solved for agents — paid relay mailboxes, retrieved OTP codes returned in-response | [docs](https://nirholas.github.io/x402-otp-relay/) |
| **[x402-account-link](https://github.com/nirholas/x402-account-link)** | One-time account linking vault for agent flows — encrypted credential links with scoped, expiring access tokens | [docs](https://nirholas.github.io/x402-account-link/) |
| **[x402-confirmations](https://github.com/nirholas/x402-confirmations)** | Normalize any booking confirmation into a portable record — ICS invite and status snapshots per query | [docs](https://nirholas.github.io/x402-confirmations/) |
| **[x402-agent-sandbox](https://github.com/nirholas/x402-agent-sandbox)** | A fake town on testnet — mock restaurant, hotel, and store implementing the suite's exact contracts, for end-to-end agent purchase testing | [docs](https://nirholas.github.io/x402-agent-sandbox/) |
| **[x402-mcp-commerce](https://github.com/nirholas/x402-mcp-commerce)** | MCP server that gives Claude/GPT agents commerce tools — each tool call pays an upstream x402 endpoint and returns its artifact | [docs](https://nirholas.github.io/x402-mcp-commerce/) |
| **[x402-approval-page](https://github.com/nirholas/x402-approval-page)** | Human-in-the-loop checkout: agent requests approval above its cap, human pays via the drop-in modal, agent fetches the signed outcome | [docs](https://nirholas.github.io/x402-approval-page/) |

### Frontier patterns

Things that only become possible once machines can pay: splitting a dinner bill across six wallets, agents negotiating with agents, gifting a task, reselling a held booking.

| Repo | What it does | Docs |
|---|---|---|
| **[x402-group-pay](https://github.com/nirholas/x402-group-pay)** | Split one booking across N wallets — the 6-person dinner problem: pooled x402 contributions with signed receipts and funded proofs | [docs](https://nirholas.github.io/x402-group-pay/) |
| **[x402-concierge](https://github.com/nirholas/x402-concierge)** | Meta-agent that composes paid skills — dinner + gift + transit in one request, with per-step receipts, powered by the suite | [docs](https://nirholas.github.io/x402-concierge/) |
| **[x402-rebooker](https://github.com/nirholas/x402-rebooker)** | The cancel-worse-book-better move, automated — scans real inventory (Amadeus/RIDB) against your current booking, returns an actionable improvement report | [docs](https://nirholas.github.io/x402-rebooker/) |
| **[x402-price-watch](https://github.com/nirholas/x402-price-watch)** | Pay-per-poll price watching — every check returns a fresh snapshot plus delta vs your cursor (flights via Amadeus, crypto via CoinGecko) | [docs](https://nirholas.github.io/x402-price-watch/) |
| **[x402-negotiator](https://github.com/nirholas/x402-negotiator)** | Agent-to-agent price negotiation instruments — signed offers, counters, and agreements, each returned in-response | [docs](https://nirholas.github.io/x402-negotiator/) |
| **[x402-recurring](https://github.com/nirholas/x402-recurring)** | Standing orders for agents — mandate documents plus a client-side scheduler that pays per run and collects run reports | [docs](https://nirholas.github.io/x402-recurring/) |
| **[x402-gift-agent](https://github.com/nirholas/x402-gift-agent)** | Fund someone else's agent task — buy a signed gift voucher, recipient's agent redeems it for execution with receipts | [docs](https://nirholas.github.io/x402-gift-agent/) |
| **[x402-transfer-market](https://github.com/nirholas/x402-transfer-market)** | Transfer or resell held bookings between wallets — signed listings and reassigned booking tokens, all in-response | [docs](https://nirholas.github.io/x402-transfer-market/) |
| **[x402-reputation](https://github.com/nirholas/x402-reputation)** | Did the merchant actually deliver? Reliability scores computed from signed fulfillment attestations | [docs](https://nirholas.github.io/x402-reputation/) |
| **[x402-disputes](https://github.com/nirholas/x402-disputes)** | Arbitration for failed real-world tasks — signed case records with evidence hashes, status snapshots, and signed rulings | [docs](https://nirholas.github.io/x402-disputes/) |

---

## For AI agents

Point your agent at any repo's `skill.md` — it describes the service the way an agent needs to
read it: what it does, what each call costs, what comes back, and how to pay. The
`/.well-known/x402` manifest is the machine-readable twin, in the format x402 discovery
directories index.

To give Claude or GPT the whole suite as tools, use
**[x402-mcp-commerce](https://github.com/nirholas/x402-mcp-commerce)** — an MCP server where every tool call pays an
upstream x402 endpoint and hands back the artifact plus the payment receipt. Pair it with
**[x402-agent-wallet](https://github.com/nirholas/x402-agent-wallet)** for budgets and spending caps, and
**[x402-approval-page](https://github.com/nirholas/x402-approval-page)** to put a human in the loop above a
threshold.

New to the suite? Start with **[x402-agent-sandbox](https://github.com/nirholas/x402-agent-sandbox)** — a fake town
of merchants implementing the same response contracts as the real servers, so you can build and
test an entire purchase flow on testnet before touching anything live.

## Start here

| If you want to… | Go to |
|---|---|
| Take agent bookings for a real business | [x402-tablebook](https://github.com/nirholas/x402-tablebook) · [x402-bookable](https://github.com/nirholas/x402-bookable) |
| Sell any API call for a fraction of a cent | [x402-skill-md](https://github.com/nirholas/x402-skill-md) · [x402-refund-hold](https://github.com/nirholas/x402-refund-hold) |
| Let Claude spend money safely | [x402-mcp-commerce](https://github.com/nirholas/x402-mcp-commerce) · [x402-agent-wallet](https://github.com/nirholas/x402-agent-wallet) |
| Just see it work end to end | [x402-agent-sandbox](https://github.com/nirholas/x402-agent-sandbox) · [x402-concierge](https://github.com/nirholas/x402-concierge) |

## Machine-readable index

[`catalog.json`](https://nirholas.github.io/x402-suite/catalog.json) — all fifty services, their
endpoints, prices, and manifest URLs, in one file.

## Discoverable by agents

Each service is built to the [x402scan discovery spec](https://x402scan.com/discovery/spec) and
audited with that project's own validator (`npx -y @agentcash/discovery@latest discover`), which
reports **zero errors** for all 50:

- **OpenAPI at `/openapi.json`** is the canonical contract x402scan reads — not the
  `.well-known` manifest. Every payable operation declares `x-payment-info` (a structured USD
  price plus `protocols: [{"x402": {}}]`) and a `402` response; public routes declare
  `security: []` so they classify as unprotected rather than unknown.
- **`info.x-guidance`** tells an agent, in prose, what the API is for and how to use it.
- **The runtime 402 carries input and output schemas** (`accepts[].outputSchema`), derived from
  the same OpenAPI document, so static metadata and live behaviour agree.
- **The challenge always comes first.** Every paid route answers an unpaid request with 402 and a
  populated `accepts` *before* any existence check, body validation, or upstream API call — the
  rule registration probes depend on. Each one is verified against a synthetic request.

## Verified

All 50 repos pass an automated sweep covering: manifest validity and both payTo addresses,
dual-rail verification in source, `skill.md` / `openapi.json` / `.env.example` / docs presence,
Apache-2.0 licensing, GitHub topics and homepage, a live Pages site, and no committed secrets.
Across the suite that is **126 paid resources**.

## License

Apache-2.0 for every repo in the suite. The payment modal referenced by the demo pages is a
separate, proprietary package consumed via CDN — it is never vendored into this code.
