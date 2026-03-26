import Stripe from "stripe";
import { config } from "../config.js";

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(config.stripe.secretKey);
  }
  return stripeInstance;
}

export interface CheckoutParams {
  pickup_address: string;
  dropoff_address: string;
  pickup_date: string;
  pickup_time: string;
  vehicle_id: number;
  vehicle_name: string;
  price: number; // in EUR (integer)
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passengers: number;
  bags: number;
  flight_number?: string;
}

export async function createCheckoutSession(
  params: CheckoutParams
): Promise<{ checkout_url: string; session_id: string }> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.passenger_email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: params.price * 100, // Stripe expects cents
          product_data: {
            name: `Private Transfer — ${params.vehicle_name}`,
            description: `${params.pickup_address} → ${params.dropoff_address} | ${params.pickup_date} ${params.pickup_time}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      source: "mcp-mydriverparis",
      pickup_address: params.pickup_address,
      dropoff_address: params.dropoff_address,
      pickup_date: params.pickup_date,
      pickup_time: params.pickup_time,
      vehicle_id: String(params.vehicle_id),
      vehicle_name: params.vehicle_name,
      price: String(params.price),
      passenger_name: params.passenger_name,
      passenger_email: params.passenger_email,
      passenger_phone: params.passenger_phone,
      passengers: String(params.passengers),
      bags: String(params.bags),
      flight_number: params.flight_number || "",
    },
    success_url: "https://www.mydriverparis.com/mcp-booking-confirmation/?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://www.mydriverparis.com/",
  });

  return {
    checkout_url: session.url!,
    session_id: session.id,
  };
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhookSecret
  );
}
