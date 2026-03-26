import { z } from "zod";
import { listBookings, getTrackingLink } from "../services/zeplan.js";

export const getBookingStatusSchema = {
  booking_id: z
    .string()
    .optional()
    .describe("Zeplan booking ID (e.g. 'xi003898') to get tracking link"),
  passenger_name: z
    .string()
    .optional()
    .describe("Passenger name to search for in recent bookings"),
  date_from: z
    .string()
    .optional()
    .describe("Start date in YYYY-MM-DD format (defaults to today)"),
  date_to: z
    .string()
    .optional()
    .describe("End date in YYYY-MM-DD format (defaults to 7 days from now)"),
};

export const getBookingStatusDescription =
  "Check the status of a booking. Search by booking_id for a specific booking, or by passenger_name to find recent bookings. Returns booking status, driver info, and tracking link when available.";

export async function getBookingStatusHandler(params: {
  booking_id?: string;
  passenger_name?: string;
  date_from?: string;
  date_to?: string;
}) {
  // If specific booking ID, get tracking link
  if (params.booking_id) {
    try {
      const tracking = await getTrackingLink({ booking_id: params.booking_id });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(tracking, null, 2),
          },
        ],
      };
    } catch {
      // Fall through to list-bookings search
    }
  }

  // Search in recent bookings
  const today = new Date();
  const defaultFrom = today.toISOString().split("T")[0];
  const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const defaultTo = weekLater.toISOString().split("T")[0];

  const dateFrom = params.date_from || defaultFrom;
  const dateTo = params.date_to || defaultTo;

  const result = (await listBookings({
    date_from: dateFrom,
    date_to: dateTo,
  })) as { bookings?: Array<Record<string, unknown>> };

  const bookings = result.bookings || [];

  // Filter by name or booking_id if provided
  let filtered = bookings;
  if (params.passenger_name) {
    const search = params.passenger_name.toLowerCase();
    filtered = bookings.filter((b) => {
      const name =
        `${b.firstname || ""} ${b.lastname || ""}`.toLowerCase();
      return name.includes(search);
    });
  }
  if (params.booking_id) {
    filtered = bookings.filter((b) => b.id === params.booking_id);
  }

  if (filtered.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No bookings found${params.passenger_name ? ` for "${params.passenger_name}"` : ""} between ${dateFrom} and ${dateTo}.`,
        },
      ],
    };
  }

  const summary = filtered.map((b) => ({
    id: b.id,
    date: b.date,
    time: b.time,
    passenger: `${b.firstname} ${b.lastname}`,
    pickup: b.pickup_address,
    dropoff: b.dropoff_address,
    vehicle: b.vehicle,
    amount: `${b.amount}€`,
    status: b.status,
    driver: b.driver_name || "Not assigned yet",
    driver_company: b.driver_company || null,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(summary, null, 2),
      },
    ],
  };
}
