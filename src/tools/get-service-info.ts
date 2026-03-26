export const getServiceInfoSchema = {};

export const getServiceInfoDescription =
  "Get information about MyDriverParis services, coverage areas, airports served, and policies. Use this to answer customer questions about what is included.";

export async function getServiceInfoHandler() {
  const info = {
    company: "MyDriverParis",
    description:
      "Premium private chauffeur service in Paris and across Europe. All vehicles are Mercedes-Benz, driven by professional English-speaking chauffeurs.",
    coverage: {
      primary: "Paris and Ile-de-France",
      airports: [
        "Charles de Gaulle (CDG) — all terminals",
        "Orly (ORY) — all terminals",
        "Le Bourget (LBG) — private aviation",
      ],
      train_stations: [
        "Gare du Nord (Eurostar)",
        "Gare de Lyon",
        "Gare de l'Est",
        "Gare Montparnasse",
        "Gare Saint-Lazare",
      ],
      long_distance:
        "All European destinations — Brussels, Amsterdam, London, Geneva, Lyon, Nice, etc.",
    },
    included_in_every_ride: [
      "Fixed all-inclusive price — no hidden extras",
      "Motorway tolls & fuel included",
      "15 min waiting time included (1 hour at airports)",
      "Real-time flight & train monitoring",
      "Water, Wi-Fi & USB charging on board",
      "Meet & Greet with name board",
      "Child seats at no extra charge (on request)",
      "Free cancellation up to 24 hours before departure",
      "Pet-friendly on request",
    ],
    booking_types: {
      one_way: "Point-to-point transfer (most common)",
      hourly: "Chauffeur at disposal for a set number of hours",
      flat_rate: "Fixed price for popular routes",
    },
    cancellation_policy:
      "Free cancellation up to 24 hours before departure. Within 24 hours, the full amount is charged.",
    payment: "Secure payment via Stripe (Visa, Mastercard, Amex). Payment is required at booking.",
    contact: {
      email: "contact@mydriverparis.com",
      phone: "+33 1 86 95 16 16",
      website: "https://www.mydriverparis.com",
    },
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(info, null, 2),
      },
    ],
  };
}
