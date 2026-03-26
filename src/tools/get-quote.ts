import { z } from "zod";
import { getQuote } from "../services/wordpress.js";

export const getQuoteSchema = {
  pickup_address: z
    .string()
    .describe("Pickup address (e.g. 'CDG Terminal 2E' or full address)"),
  dropoff_address: z
    .string()
    .describe("Drop-off address (e.g. 'Hotel Le Bristol, Paris')"),
  pickup_date: z
    .string()
    .describe("Pickup date in dd/mm/yyyy format (e.g. '27/03/2026')"),
  pickup_time: z.string().describe("Pickup time in HH:MM format (e.g. '14:00')"),
  form_type: z
    .enum(["one_way", "hourly", "flat"])
    .default("one_way")
    .describe("Booking type: one_way (point-to-point), hourly, or flat (fixed route)"),
  num_hours: z
    .number()
    .optional()
    .describe("Number of hours (required if form_type is hourly)"),
  step_address: z
    .string()
    .optional()
    .describe("Intermediate stop address (optional, for hourly bookings)"),
};

export const getQuoteDescription =
  "Calculate the exact price for a private chauffeur transfer. Returns prices for all available vehicles. Always call this before book_ride to get an accurate quote.";

export async function getQuoteHandler(params: {
  pickup_address: string;
  dropoff_address: string;
  pickup_date: string;
  pickup_time: string;
  form_type?: string;
  num_hours?: number;
  step_address?: string;
}) {
  const quote = await getQuote(params);

  if (!quote.success) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Failed to calculate quote. Please verify the addresses are valid.",
        },
      ],
      isError: true,
    };
  }

  if (quote.night_blocked) {
    return {
      content: [
        {
          type: "text" as const,
          text: "This pickup time falls within our night hours restriction. Please choose a different time or contact us for special arrangements.",
        },
      ],
    };
  }

  const summary = {
    trip: {
      pickup: params.pickup_address,
      dropoff: params.dropoff_address,
      date: params.pickup_date,
      time: params.pickup_time,
      distance: quote.distance_km ? `${quote.distance_km} km` : null,
      duration: quote.duration,
    },
    vehicles: quote.vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      price: `${v.price}€`,
      max_passengers: v.passengers,
      max_bags: v.bags,
    })),
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(summary, null, 2),
      },
    ],
  };
}
