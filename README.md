# MyDriverParis MCP Server

Book premium private chauffeur transfers in Paris and across Europe — directly from AI agents.

**Remote endpoint:** `https://mcp-mydriverparis.mydriverparis.workers.dev/mcp`

## Tools

| Tool | Description |
|------|-------------|
| `get_vehicles` | List available Mercedes vehicles with capacity and rates |
| `get_quote` | Calculate exact transfer prices (pickup, dropoff, date, time) |
| `book_ride` | Generate a secure payment link to book a transfer |
| `get_service_info` | Service coverage, airports, policies, and what's included |

## What's included in every ride

- Fixed all-inclusive price (no hidden extras)
- Motorway tolls & fuel included
- Meet & Greet with nameboard
- Flight & train monitoring
- Water, Wi-Fi & USB charging
- Free cancellation up to 24h before departure

## Setup

### Remote (recommended)

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

### Local (stdio)

```json
{
  "mcpServers": {
    "mydriverparis": {
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "env": {
        "WP_API_URL": "https://www.mydriverparis.com/wp-json",
        "WP_API_KEY": "your-key",
        "ZEPLAN_API_URL": "https://app.zeplan.ai/api/v1/public",
        "ZEPLAN_API_KEY": "your-key",
        "STRIPE_SECRET_KEY": "your-key"
      }
    }
  }
}
```

## Example conversation

> **User:** I need a transfer from CDG airport to Hotel Le Bristol tomorrow at 2pm
>
> **Agent:** *(calls get_quote)* Here are the prices for your CDG → Le Bristol transfer:
> - Mercedes E-Class: 140€ (2 passengers, 3 bags)
> - Mercedes V-Class: 150€ (7 passengers, 6 bags)
> - Mercedes S-Class: 200€ (2 passengers, 2 bags)
>
> All prices are all-inclusive. Would you like to book?
>
> **User:** Yes, the E-Class please
>
> **Agent:** *(calls book_ride)* Here is your secure payment link to confirm the reservation. Once payment is completed, your chauffeur will be assigned and you'll receive a confirmation email + SMS with the driver's phone number 2 hours before pickup.

## Architecture

```
AI Agent → MCP Server → WordPress API (pricing)
                      → Stripe Checkout (payment)
                      → Zeplan (booking creation via webhook)
```

## Coverage

- **Paris & Ile-de-France** — all arrondissements
- **Airports** — CDG, Orly, Le Bourget
- **Train stations** — Gare du Nord, Gare de Lyon, Gare de l'Est, Gare Montparnasse
- **Long distance** — all European destinations (Brussels, Amsterdam, London, Geneva, etc.)

## Links

- [MyDriverParis website](https://www.mydriverparis.com)
- [Contact](mailto:contact@mydriverparis.com) | +33 1 86 95 16 16

## License

MIT
