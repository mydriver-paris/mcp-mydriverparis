import { config } from "../config.js";

interface Vehicle {
  id: number;
  name: string;
  description: string;
  passengers: number;
  bags: number;
  price_per_km: number;
  price_per_hour: number;
  price_from: number;
  image_url: string | null;
}

interface QuoteVehicle {
  id: number;
  name: string;
  price: number;
  currency: string;
  passengers: number;
  bags: number;
}

interface QuoteResponse {
  success: boolean;
  form_type: string;
  distance_km: number | null;
  duration: string | null;
  night_blocked: boolean;
  vehicles: QuoteVehicle[];
}

async function wpFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.wp.apiUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": config.wp.apiKey,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WordPress API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function getFleet(): Promise<Vehicle[]> {
  const data = await wpFetch<{ vehicles: Vehicle[] }>("/mydriverparis/v1/fleet");
  return data.vehicles;
}

export async function getQuote(params: {
  pickup_address: string;
  dropoff_address: string;
  pickup_date: string;
  pickup_time: string;
  form_type?: string;
  num_hours?: number;
  step_address?: string;
  flat_location?: number;
  return_journey?: boolean;
}): Promise<QuoteResponse> {
  return wpFetch<QuoteResponse>("/mydriverparis/v1/quote", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
