import { z } from "zod";
import { getFleet } from "../services/wordpress.js";

export const getVehiclesSchema = {};

export const getVehiclesDescription =
  "List all available vehicles with capacity and base rates. Use this to help the customer choose the right vehicle for their trip.";

export async function getVehiclesHandler() {
  const vehicles = await getFleet();

  const formatted = vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description,
    max_passengers: v.passengers,
    max_bags: v.bags,
    base_price_from: `${v.price_from}€`,
    rate_per_km: `${v.price_per_km}€`,
    image: v.image_url,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(formatted, null, 2),
      },
    ],
  };
}
