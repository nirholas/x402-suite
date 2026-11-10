---
name: find-x402-service
description: Pick the right service from the x402 Suite catalog (fifty open-source agent commerce services) and read its skill.md and payment terms before calling it. Use when an agent needs to book, search, ship, notify or otherwise buy something through a per-request x402 API.
---

# Find a service in the x402 Suite

The suite is fifty separate repos under `github.com/nirholas`, each a small Express service whose paid
routes return the purchased artifact in the 200 body. This repo holds the catalog, not the services.
Nothing here runs: pick a service, then follow that service's own `skill.md`.

## Read the catalog

```bash
curl -s https://nirholas.github.io/x402-suite/catalog.json
```

The same file is `docs/catalog.json` in the repo. Top-level fields: `name`, `description`, `protocol`,
`contract`, `count`, `rails`, `services`. Each entry in `services` has `name`, `group`
(`supply-side`, `real-api`, `infra`, `frontier`), `description`, `repository`, `docs`, `skill`,
`manifest`, `dataSource` and `endpoints` (each with `route`, `price`, `returns`).

Filter it with `jq`, for example:

```bash
curl -s https://nirholas.github.io/x402-suite/catalog.json \
  | jq -r '.services[] | select(.description|test("flight";"i")) | "\(.name)\t\(.skill)"'
```

## Choose

1. Match the user's task to a `description` and `endpoints[].returns`.
2. Check `dataSource`. Entries on keyed APIs return fixtures labeled `source: "fixture"` when no key is
   configured. Tell the user when a result is fixture data, not live.
3. Open the entry's `skill.md` (the `skill` URL) and follow it for routes, parameters and env vars.
   Services are self-hosted from a clone (`npm install`, `npm run dev`), so an operator must run the
   one you pick, or you run it locally.

## Payment terms

Every service answers an unpaid paid-route request with 402 and an `accepts` array listing both rails,
from `rails` in the catalog: USDC on `base-sepolia` or `base` (facilitator `https://x402.org/facilitator`)
and USDC on `solana` or `solana-devnet` (facilitator `https://facilitator.payai.network`). The client
signs the entry its wallet supports and retries with the base64 `X-PAYMENT` header. The receipt is in
`X-PAYMENT-RESPONSE`. Clients use `x402-fetch`; each service repo ships `examples/agent-client.ts`.

Paying is irreversible. Before any paid call, show the user the service, route, price, network and
payTo address from the 402 response, and wait for an explicit yes. The catalog's `payTo` addresses are
the suite's public default receive addresses, so confirm the address the live 402 returns.
