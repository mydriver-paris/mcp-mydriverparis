# MyDriverParis MCP Server

Book premium private chauffeur transfers in Paris and across Europe — directly from AI agents.

**Remote endpoint (streamable HTTP, no auth, no API key):**
`https://mcp-mydriverparis.mydriverparis.workers.dev/mcp`

Published on the [Official MCP Registry](https://registry.modelcontextprotocol.io) as `com.mydriverparis/booking` · [Smithery](https://smithery.ai/servers/mydriverparis/booking) · [ClawHub skill](https://clawhub.ai/skills/mydriverparis-booking) for OpenClaw.

## Tools (9 public)

| Tool | Description |
|------|-------------|
| `get_quote` | Exact all-inclusive prices for any transfer, hourly hire or day trip. Returns a `quote_id` valid 15 minutes that locks the price server-side |
| `book_ride` | Secure Stripe payment link from a `quote_id` + `vehicle_id` (no price parameter — the price comes from the stored quote). Booking is created automatically after payment. Supports `idempotency_key` for safe retries |
| `book_meetgreet` | VIP airport/station Meet & Greet at fixed prices (CDG, Orly, Gare de Lyon, Gare du Nord), optional transfer combo |
| `resolve_location` | Fuzzy location ("Le Bristol", "CDG") → canonical address candidates |
| `resolve_flight` | Flight number + date → terminals, scheduled/revised times, status |
| `resolve_train` | Train number + date → route and times via the official SNCF API (TGV, TER, Intercités, Lyria, Eurostar) |
| `get_vehicles` | Mercedes fleet with passenger/luggage capacities |
| `get_service_info` | Coverage, airports, stations, policies |
| `get_cancellation_policy` | Full cancellation/refund/modification policy |

All tools return structured errors `{code, message, retriable, suggested_action}` and carry MCP annotations (`title`, `readOnlyHint`, `destructiveHint`).

An authenticated endpoint (`/mcp/private`, OAuth 2.1 per-booking tokens) lets agents track, reschedule or cancel an existing booking — see [auth.md](https://www.mydriverparis.com/auth.md).

## What's included in every ride

- Fixed all-inclusive price (no hidden extras)
- Motorway tolls & fuel included
- Meet & Greet with nameboard
- Flight & train monitoring
- Water, Wi-Fi & USB charging
- Free cancellation up to 24h before departure

## Setup

Use the hosted endpoint — no installation required:

```json
{
  "mcpServers": {
    "mydriverparis": {
      "type": "url",
      "url": "https://mcp-mydriverparis.mydriverparis.workers.dev/mcp"
    }
  }
}
```

Per-platform instructions (Claude, Perplexity, OpenClaw, Claude Code): https://www.mydriverparis.com/book-with-your-ai-agent/

> The `src/` in this repository is the original stdio implementation, kept for reference. It requires private API keys and is superseded by the hosted endpoint above — production runs on a Cloudflare Worker.

## Example flow

1. `resolve_flight` with `flight_number="AF1234"` → arrival time + terminal (pickup = arrival + 45 min international / +25 min Schengen)
2. `get_quote` with pickup/dropoff, `pickup_date` (**dd/mm/yyyy**), `pickup_time` → per-vehicle prices + `quote_id`
3. `book_ride` with `quote_id`, `vehicle_id`, passenger details, fresh UUID `idempotency_key`
4. Share the returned `payment_url` — the booking is confirmed only after the customer pays

Full agent documentation: [llms-full.txt](https://www.mydriverparis.com/llms-full.txt)

## Safety design

- **Agents can never invent a price** — quotes are computed live and locked server-side
- **Agents can never pay** — they receive a Stripe payment link; a human completes it
- Geocoding sanity gate rejects implausible routes (`GEOCODING_SUSPECT`)

## Links

- Website: https://www.mydriverparis.com
- Contact: contact@mydriverparis.com · +33 1 88 33 64 43 (24/7)

## License

MIT — see [LICENSE](./LICENSE).
