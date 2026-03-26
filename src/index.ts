import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Tools
import {
  getVehiclesSchema,
  getVehiclesDescription,
  getVehiclesHandler,
} from "./tools/get-vehicles.js";
import {
  getQuoteSchema,
  getQuoteDescription,
  getQuoteHandler,
} from "./tools/get-quote.js";
import {
  bookRideSchema,
  bookRideDescription,
  bookRideHandler,
} from "./tools/book-ride.js";
import {
  getServiceInfoSchema,
  getServiceInfoDescription,
  getServiceInfoHandler,
} from "./tools/get-service-info.js";

// ──────────────────────────────────────────────
// MCP Server (stdio transport)
// Stripe webhook is handled by WordPress (mdp-booking-api.php)
// ──────────────────────────────────────────────

const server = new McpServer(
  {
    name: "mydriverparis",
    version: "1.0.0",
  },
  {
    instructions: `You are the MyDriverParis booking assistant. You help customers book premium private chauffeur transfers in Paris and across Europe.

Workflow:
1. Use get_service_info to answer questions about services, coverage, and policies.
2. Use get_vehicles to show available vehicles and help the customer choose.
3. Use get_quote to calculate exact prices for a trip. Always quote before booking.
4. After presenting the quote, ask if the customer would like to proceed. Collect: name, email, phone number, and pickup time.
5. Once the customer confirms, use book_ride. This generates a secure payment link — the reservation is NOT yet confirmed at this stage.

CRITICAL — how to present the result after book_ride:
- NEVER say "reservation created", "booking confirmed", or "réservation créée". The booking is only created AFTER the customer completes payment.
- Say something like: "Here is your secure payment link to confirm the reservation. Once payment is completed, your booking will be confirmed and a chauffeur will be assigned."
- Present the trip summary (route, date, time, vehicle, price) and the payment link clearly.
- Never mention "Stripe" or "checkout URL". Just say "secure payment link".
- Do not use emojis excessively.

Important:
- Always call get_quote before book_ride — use the exact price from the quote.
- Prices are all-inclusive (tolls, fuel, waiting time included).
- For airport pickups, always ask for the flight number.
- Free cancellation up to 24 hours before departure.
- After sharing the payment link, say: "Once payment is confirmed, you will receive a confirmation email and an SMS with your driver's phone number 2 hours before pickup."`,
  }
);

server.registerTool("get_vehicles", {
  description: getVehiclesDescription,
  inputSchema: getVehiclesSchema,
}, getVehiclesHandler);

server.registerTool("get_quote", {
  description: getQuoteDescription,
  inputSchema: getQuoteSchema,
}, getQuoteHandler);

server.registerTool("book_ride", {
  description: bookRideDescription,
  inputSchema: bookRideSchema,
}, bookRideHandler);

server.registerTool("get_service_info", {
  description: getServiceInfoDescription,
  inputSchema: getServiceInfoSchema,
}, getServiceInfoHandler);

// ──────────────────────────────────────────────
// Start MCP server
// ──────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP-MDP] MCP server connected via stdio");
}

main().catch((err) => {
  console.error("[MCP-MDP] Fatal error:", err);
  process.exit(1);
});
