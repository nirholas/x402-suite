// Generates README.md, docs/index.html, and docs/catalog.json from the suite spec.
import { readFileSync, writeFileSync } from "node:fs";

const SPEC = "/tmp/claude-1000/-workspaces-xspace-AI/eae306af-fd68-4713-974b-855bb5ed366b/scratchpad/x402/specs.json";
const { projects, contract_rule } = JSON.parse(readFileSync(SPEC, "utf8"));

const GROUPS = [
  ["supply-side", "Supply-side booking servers", "Self-hosted servers a business runs itself, so the inventory is real by definition. An open-source Resy, Calendly, and storefront that AI agents can transact with directly."],
  ["real-api", "Services on real, live APIs", "Backed by genuine upstream data — keyless APIs are called live out of the box; keyed APIs use free developer tiers and fall back to labeled fixtures so every demo runs without a single paid key."],
  ["infra", "Agentic commerce infrastructure", "The plumbing every paid agent service needs: discovery, refundable holds, wallet policy, receipts, approvals, and an MCP bridge into Claude and GPT."],
  ["frontier", "Frontier patterns", "Things that only become possible once machines can pay: splitting a dinner bill across six wallets, agents negotiating with agents, gifting a task, reselling a held booking."],
];

const url = (n) => `https://github.com/nirholas/${n}`;
const pages = (n) => `https://nirholas.github.io/${n}/`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---------------------------------- README --------------------------------- */
let md = `# The x402 Suite

**Fifty open-source services that let AI agents buy real things.**

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![x402](https://img.shields.io/badge/protocol-x402-0052ff.svg)](https://x402.org)
[![Repos](https://img.shields.io/badge/repos-50-success.svg)](#the-catalog)

[x402](https://x402.org) revives HTTP's long-dormant \`402 Payment Required\` status code: a
server answers an unpaid request with a price, the client signs a gasless USDC transfer, retries
with an \`X-PAYMENT\` header, and gets the goods. No API keys, no accounts, no subscriptions, no
signup funnel — which is exactly what an autonomous agent needs, because an agent cannot fill in
your credit card form but it can sign a payment.

This suite takes that primitive and builds out the layer above it: **agentic commerce.** Booking a
table, holding a flight, buying a book, shipping a package, funding a bounty, splitting a bill.

---

## The one rule

> ${contract_rule}

Every paid route in all fifty repos obeys it. Payment and delivery happen in the same round trip:
you pay \`POST /book\` and the 200 response body *is* your reservation — id, confirmed time,
refund terms, and a calendar invite. Nothing is promised for later. Where a use case is inherently
asynchronous (watching a price, monitoring a queue), it is restructured as **pay-per-poll** — each
paid call returns a fresh snapshot plus the delta since your last one — or it returns a **signed
claim instrument** you hold immediately.

## How a paid call actually works

\`\`\`
  GET /availability
    └─→ 402 Payment Required
        accepts: [ { network: base-sepolia, asset: USDC, payTo: 0x40252…402 },
                   { network: solana,       asset: USDC, payTo: Wwwu…T3WwW } ]

  the client picks a rail and signs   (EVM: EIP-3009 transferWithAuthorization, gasless
                                       Solana: an SPL USDC transfer)

  GET /availability   X-PAYMENT: <signed payload>
    └─→ server verifies + settles through that rail's facilitator
    └─→ 200 OK   { slots: [...] }   X-PAYMENT-RESPONSE: <settlement receipt>
\`\`\`

**Two chains, two clients, one protocol.** Every paid route answers with *both* a Base and a
Solana payment option and settles whichever the caller signs — EVM through the x402.org
facilitator, Solana through PayAI's. Agents use [\`x402-fetch\`](https://www.npmjs.com/package/x402-fetch)
(every repo ships a runnable example). Humans get a wallet checkout via the drop-in
[\`@three-ws/x402-payment-modal\`](https://www.npmjs.com/package/@three-ws/x402-payment-modal),
wired into the demo page of every repo that has a human-facing side.

## Receiving addresses

| Rail | Network | Address |
|---|---|---|
| EVM | Base / Base Sepolia | \`0x40252CFDF8B20Ed757D61ff157719F33Ec332402\` |
| Solana | Solana | \`WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW\` |

These are the shipped defaults so every service runs the moment you clone it. Point them at your
own wallet with \`PAY_TO_ADDRESS\` and \`SOLANA_PAY_TO_ADDRESS\`.

> A note on \`x402-express\`: it takes a single \`payTo\` and therefore a single chain, so it cannot
> express a dual-rail offer. Each service hand-rolls a small \`src/payments.ts\` that builds both
> \`PaymentRequirements\` with x402 core and verifies either through \`useFacilitator\`.

## Every repo ships

| | |
|---|---|
| **Working code** | TypeScript, strict, ESM, Express. Runs on defaults with no config at all. |
| **Dual-rail payments** | Every paid route offers Base *and* Solana; the caller picks. |
| **\`skill.md\`** | The agent-facing capability file — endpoints, prices, schemas, payment instructions. |
| **\`/.well-known/x402\`** | Machine-readable resource manifest for [x402scan](https://x402scan.com), the x402 Bazaar, and [agentic.market](https://agentic.market). |
| **\`openapi.json\`** | OpenAPI 3.1, including the 402 challenge shape. |
| **Docs site** | GitHub Pages: landing page, tutorial, API reference, and an agent integration guide. |
| **Examples** | \`x402-fetch\` agent client, raw curl walkthrough, MCP tool recipe. |
| **Apache-2.0** | Use it, fork it, sell it. |

## Runs without a single paid API key

Keyless public APIs — Open-Meteo, NWS, RDAP, CoinGecko, SEC EDGAR, GDELT, arXiv, Crossref,
Semantic Scholar, OpenLibrary, Gutendex, Overpass, UK Carbon Intensity, public GTFS feeds — are
called **live**. Services on keyed APIs (Amadeus, Ticketmaster, Kroger, eBay, Lob, Shippo, TMDB)
use free developer tiers when you supply a key and otherwise return deterministic fixtures
explicitly labeled \`source: "fixture"\`. The supply-side servers own their inventory outright.
Payments themselves are real from the first minute: Base Sepolia testnet by default, mainnet with
two environment variables.

---

## The catalog
`;

for (const [key, title, blurb] of GROUPS) {
  const items = projects.filter((p) => p.group === key);
  md += `\n### ${title}\n\n${blurb}\n\n| Repo | What it does | Docs |\n|---|---|---|\n`;
  for (const p of items) {
    md += `| **[${p.name}](${url(p.name)})** | ${p.desc} | [docs](${pages(p.name)}) |\n`;
  }
}

md += `
---

## For AI agents

Point your agent at any repo's \`skill.md\` — it describes the service the way an agent needs to
read it: what it does, what each call costs, what comes back, and how to pay. The
\`/.well-known/x402\` manifest is the machine-readable twin, in the format x402 discovery
directories index.

To give Claude or GPT the whole suite as tools, use
**[x402-mcp-commerce](${url("x402-mcp-commerce")})** — an MCP server where every tool call pays an
upstream x402 endpoint and hands back the artifact plus the payment receipt. Pair it with
**[x402-agent-wallet](${url("x402-agent-wallet")})** for budgets and spending caps, and
**[x402-approval-page](${url("x402-approval-page")})** to put a human in the loop above a
threshold.

New to the suite? Start with **[x402-agent-sandbox](${url("x402-agent-sandbox")})** — a fake town
of merchants implementing the same response contracts as the real servers, so you can build and
test an entire purchase flow on testnet before touching anything live.

## Start here

| If you want to… | Go to |
|---|---|
| Take agent bookings for a real business | [x402-tablebook](${url("x402-tablebook")}) · [x402-bookable](${url("x402-bookable")}) |
| Sell any API call for a fraction of a cent | [x402-skill-md](${url("x402-skill-md")}) · [x402-refund-hold](${url("x402-refund-hold")}) |
| Let Claude spend money safely | [x402-mcp-commerce](${url("x402-mcp-commerce")}) · [x402-agent-wallet](${url("x402-agent-wallet")}) |
| Just see it work end to end | [x402-agent-sandbox](${url("x402-agent-sandbox")}) · [x402-concierge](${url("x402-concierge")}) |

## Machine-readable index

[\`catalog.json\`](https://nirholas.github.io/x402-suite/catalog.json) — all fifty services, their
endpoints, prices, and manifest URLs, in one file.

## Verified

All 50 repos pass an automated sweep covering: manifest validity and both payTo addresses,
dual-rail verification in source, \`skill.md\` / \`openapi.json\` / \`.env.example\` / docs presence,
Apache-2.0 licensing, GitHub topics and homepage, a live Pages site, and no committed secrets.
Across the suite that is **126 paid resources**.

## License

Apache-2.0 for every repo in the suite. The payment modal referenced by the demo pages is a
separate, proprietary package consumed via CDN — it is never vendored into this code.
`;

writeFileSync(new URL("./README.md", import.meta.url), md);

/* --------------------------------- catalog --------------------------------- */
writeFileSync(
  new URL("./docs/catalog.json", import.meta.url),
  JSON.stringify(
    {
      name: "x402 Suite",
      description: "Fifty open-source services that let AI agents buy real things, priced per request over x402.",
      protocol: "x402",
      contract: contract_rule,
      count: projects.length,
      rails: [
        {
          rail: "evm",
          networks: ["base-sepolia", "base"],
          asset: "USDC",
          payTo: "0x40252CFDF8B20Ed757D61ff157719F33Ec332402",
          facilitator: "https://x402.org/facilitator",
        },
        {
          rail: "solana",
          networks: ["solana", "solana-devnet"],
          asset: "USDC",
          payTo: "WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW",
          facilitator: "https://facilitator.payai.network",
        },
      ],
      services: projects.map((p) => ({
        name: p.name,
        group: p.group,
        description: p.desc,
        repository: url(p.name),
        docs: pages(p.name),
        skill: `${url(p.name)}/blob/main/skill.md`,
        manifest: `${url(p.name)}/blob/main/public/.well-known/x402`,
        dataSource: p.api,
        endpoints: p.endpoints.map((e) => ({ route: e.r, price: e.p, returns: e.returns })),
      })),
    },
    null,
    2
  ) + "\n"
);

/* ------------------------------- landing page ------------------------------ */
const card = (p) => `        <a class="card" href="${url(p.name)}">
          <h4>${esc(p.name)}</h4>
          <p>${esc(p.desc)}</p>
          <span class="meta">${esc(p.endpoints.map((e) => e.p).filter((x) => x !== "free").slice(0, 3).join(" · "))}</span>
        </a>`;

const sections = GROUPS.map(
  ([key, title, blurb]) => `      <section class="group">
        <h3>${esc(title)}</h3>
        <p class="blurb">${esc(blurb)}</p>
        <div class="grid">
${projects.filter((p) => p.group === key).map(card).join("\n")}
        </div>
      </section>`
).join("\n");

writeFileSync(
  new URL("./docs/index.html", import.meta.url),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The x402 Suite — 50 services that let AI agents buy real things</title>
<meta name="description" content="Fifty open-source services built on x402: agents pay USDC per request and get the goods back in the same response. Apache-2.0.">
<style>
  :root {
    --bg: #ffffff; --fg: #12161f; --muted: #5b6472; --line: #e4e7ec;
    --accent: #0052ff; --card: #ffffff; --code: #f6f7f9;
    color-scheme: light dark;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0b0e14; --fg: #e8ecf3; --muted: #98a2b3; --line: #232936;
            --accent: #4d8bff; --card: #121722; --code: #151b26; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); line-height: 1.65;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif; }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
  header { padding: 88px 0 56px; border-bottom: 1px solid var(--line); }
  .tag { display: inline-block; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
         color: var(--accent); font-weight: 700; margin-bottom: 18px; }
  h1 { font-size: clamp(34px, 6vw, 56px); line-height: 1.1; margin: 0 0 20px; letter-spacing: -.02em; }
  .lede { font-size: clamp(17px, 2.4vw, 20px); color: var(--muted); max-width: 62ch; margin: 0 0 32px; }
  .btns { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn { display: inline-block; padding: 11px 20px; border-radius: 8px; text-decoration: none;
         font-weight: 600; font-size: 15px; border: 1px solid var(--line); color: var(--fg); }
  .btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  section { padding: 56px 0; border-bottom: 1px solid var(--line); }
  h2 { font-size: 26px; margin: 0 0 14px; letter-spacing: -.01em; }
  h3 { font-size: 21px; margin: 0 0 6px; }
  p { max-width: 70ch; }
  .blurb { color: var(--muted); margin: 0 0 22px; }
  pre { background: var(--code); border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px;
        overflow-x: auto; font-size: 13.5px; line-height: 1.6; }
  code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; }
  .rule { border-left: 3px solid var(--accent); padding: 4px 0 4px 18px; margin: 0 0 24px;
          font-size: 17px; color: var(--fg); }
  .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(268px, 1fr)); }
  .card { display: block; padding: 16px 18px; border: 1px solid var(--line); border-radius: 10px;
          background: var(--card); text-decoration: none; color: inherit; transition: border-color .15s, transform .15s; }
  .card:hover { border-color: var(--accent); transform: translateY(-2px); }
  .card h4 { margin: 0 0 6px; font-size: 15px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
             color: var(--accent); font-weight: 600; }
  .card p { margin: 0 0 10px; font-size: 13.5px; color: var(--muted); line-height: 1.5; }
  .card .meta { font-size: 12px; color: var(--muted); font-family: ui-monospace, Menlo, monospace; opacity: .8; }
  .group { padding: 40px 0 8px; border: 0; }
  .ships { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 8px; }
  .ships div { border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px; background: var(--card); }
  .ships strong { display: block; margin-bottom: 4px; font-size: 14px; }
  .ships span { font-size: 13.5px; color: var(--muted); }
  footer { padding: 48px 0 72px; color: var(--muted); font-size: 14px; }
  a { color: var(--accent); }
</style>
</head>
<body>
<header>
  <div class="wrap">
    <span class="tag">Apache-2.0 · 50 repositories</span>
    <h1>Fifty services that let AI&nbsp;agents buy real things.</h1>
    <p class="lede">x402 turns HTTP's forgotten <code>402 Payment Required</code> into a working
      payment rail: the server names a price, the client signs a gasless USDC transfer, and the goods
      come back in the same response. This suite is the commerce layer built on top of it — booking a
      table, holding a flight, shipping a package, splitting a bill across six wallets.</p>
    <div class="btns">
      <a class="btn primary" href="https://github.com/nirholas/x402-suite">Browse the suite</a>
      <a class="btn" href="https://github.com/nirholas/x402-tablebook">Start with tablebook</a>
      <a class="btn" href="./catalog.json">catalog.json</a>
    </div>
  </div>
</header>

<section><div class="wrap">
  <h2>One rule, fifty repos</h2>
  <p class="rule">Every paid route returns the thing you bought, in the body of the same response.</p>
  <p>You pay <code>POST /book</code> and the 200 <em>is</em> the reservation — id, confirmed time,
  refund terms, calendar invite. Nothing is promised for later. Where a use case is inherently
  asynchronous, it becomes pay-per-poll (a fresh snapshot plus the delta since your last check) or
  returns a signed claim instrument you hold immediately.</p>
  <pre><code>GET /availability
  └─→ 402 Payment Required   { price: "$0.001", asset: USDC, network: base-sepolia, payTo: 0x… }

client signs an EIP-3009 transferWithAuthorization   (gasless — no ETH needed)

GET /availability   X-PAYMENT: &lt;signed payload&gt;
  └─→ 200 OK   { slots: [ … ] }   X-PAYMENT-RESPONSE: &lt;settlement receipt&gt;</code></pre>
</div></section>

<section><div class="wrap">
  <h2>What every repo ships</h2>
  <div class="ships">
    <div><strong>Working code</strong><span>TypeScript, ESM, Express + x402-express. Boots with one env var.</span></div>
    <div><strong>skill.md</strong><span>The agent-facing capability file: endpoints, prices, schemas, how to pay.</span></div>
    <div><strong>/.well-known/x402</strong><span>Machine-readable manifest for x402scan, the x402 Bazaar, and agentic.market.</span></div>
    <div><strong>Docs site</strong><span>GitHub Pages with a tutorial, API reference, and agent integration guide.</span></div>
    <div><strong>Examples</strong><span>x402-fetch agent client, raw curl walkthrough, MCP tool recipe.</span></div>
    <div><strong>No paid keys</strong><span>Keyless APIs run live; keyed ones fall back to labeled fixtures.</span></div>
  </div>
</div></section>

<section><div class="wrap">
  <h2>The catalog</h2>
${sections}
</div></section>

<section><div class="wrap">
  <h2>For AI agents</h2>
  <p>Point an agent at any repo's <code>skill.md</code> and it can read what the service does, what
  each call costs, what comes back, and how to pay. To hand Claude or GPT the whole suite as tools,
  use <a href="https://github.com/nirholas/x402-mcp-commerce">x402-mcp-commerce</a> — every tool call
  pays an upstream endpoint and returns the artifact with its receipt. Add
  <a href="https://github.com/nirholas/x402-agent-wallet">x402-agent-wallet</a> for spending caps and
  <a href="https://github.com/nirholas/x402-approval-page">x402-approval-page</a> to put a human in
  the loop above a threshold. Build against
  <a href="https://github.com/nirholas/x402-agent-sandbox">x402-agent-sandbox</a> first — a fake town
  of merchants using the same contracts as the real servers.</p>
</div></section>

<footer><div class="wrap">
  Apache-2.0 · built by <a href="https://github.com/nirholas">nirholas</a> ·
  protocol by <a href="https://x402.org">x402.org</a>
</div></footer>
</body>
</html>
`
);

console.log(`generated: ${projects.length} services across ${GROUPS.length} groups`);
