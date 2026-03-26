import { z } from "zod";
import { createCheckoutSession } from "../services/stripe.js";

export const bookRideSchema = {
  pickup_address: z.string().describe("Pickup address"),
  dropoff_address: z.string().describe("Drop-off address"),
  pickup_date: z
    .string()
    .describe("Pickup date in dd/mm/yyyy format"),
  pickup_time: z.string().describe("Pickup time in HH:MM format"),
  vehicle_id: z.number().describe("Vehicle ID from get_quote results"),
  vehicle_name: z.string().describe("Vehicle name from get_quote results"),
  price: z.number().describe("Price in EUR from get_quote results (integer)"),
  passenger_name: z.string().describe("Full name of the passenger"),
  passenger_email: z
    .string()
    .email()
    .describe("Passenger email for booking confirmation"),
  passenger_phone: z
    .string()
    .describe("Passenger phone number with country code (e.g. +33612345678)"),
  passengers: z.number().int().min(1).default(1).describe("Number of passengers"),
  bags: z.number().int().min(0).default(1).describe("Number of bags"),
  flight_number: z
    .string()
    .optional()
    .describe("Flight number for airport pickups (e.g. AF123)"),
};

export const bookRideDescription =
  "Create a payment link to book a private chauffeur transfer. The customer will receive a Stripe Checkout URL to complete payment. Once paid, the booking is automatically created and a chauffeur is assigned. Always call get_quote first to get the correct price and vehicle_id.";

export async function bookRideHandler(params: {
  pickup_address: string;
  dropoff_address: string;
  pickup_date: string;
  pickup_time: string;
  vehicle_id: number;
  vehicle_name: string;
  price: number;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passengers: number;
  bags: number;
  flight_number?: string;
}) {
  const result = await createCheckoutSession(params);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            status: "awaiting_payment",
            payment_url: result.checkout_url,
            session_id: result.session_id,
            message: `Share this secure payment link with the customer. IMPORTANT: The booking is NOT yet confirmed — it will be created automatically once payment is completed. Do NOT say the reservation is created or confirmed.`,
            booking_summary: {
              route: `${params.pickup_address} → ${params.dropoff_address}`,
              date: `${params.pickup_date} at ${params.pickup_time}`,
              vehicle: params.vehicle_name,
              price: `${params.price}€`,
              passenger: params.passenger_name,
            },
          },
          null,
          2
        ),
      },
    ],
  };
}
