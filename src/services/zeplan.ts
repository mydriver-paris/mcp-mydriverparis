import { config } from "../config.js";

async function zeplanFetch<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `${config.zeplan.apiUrl}/${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: config.zeplan.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zeplan API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Compute the timezone offset for Paris (CET/CEST).
 * Returns -1 in winter (CET, UTC+1) or -2 in summer (CEST, UTC+2).
 */
function getParisTimezoneOffset(date: Date): number {
  // Create a formatter that tells us the UTC offset for Europe/Paris
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(date);
  const tzPart = parts.find((p) => p.type === "timeZoneName");
  // tzPart.value is like "GMT+1" or "GMT+2"
  const match = tzPart?.value?.match(/GMT\+(\d+)/);
  return match ? -parseInt(match[1], 10) : -1;
}

/**
 * Adjust a datetime string for Zeplan's UTC interpretation.
 * Zeplan interprets the datetime as UTC but displays it in CET/CEST.
 * So we subtract the Paris offset to get the correct display time.
 */
function adjustDatetimeForZeplan(dateStr: string, timeStr: string): string {
  const [day, month, year] = dateStr.split("/");
  const [hours, minutes] = timeStr.split(":");
  const date = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  );
  const offset = getParisTimezoneOffset(date);
  date.setHours(date.getHours() + offset);
  return date.toISOString().replace(/\.\d{3}Z$/, "");
}

/** Map WP vehicle name to Zeplan vehicle type */
function mapVehicleType(vehicleName: string): string {
  const name = vehicleName.toLowerCase();
  if (name.includes("e-class") || name.includes("e class")) return "berline";
  if (name.includes("s-class") || name.includes("s class"))
    return "berline_vip";
  if (name.includes("v-class") || name.includes("v class")) return "van";
  if (name.includes("sprinter")) return "van_vip";
  if (name.includes("meet") && name.includes("greet")) return "meetngreet";
  return "berline";
}

export interface CreateBookingParams {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_date: string; // dd/mm/yyyy
  pickup_time: string; // HH:MM
  vehicle_name: string;
  price: number;
  driver_price?: number;
  passengers?: number;
  bags?: number;
  flight_number?: string;
  additional_info?: string;
}

export async function createBooking(
  params: CreateBookingParams
): Promise<unknown> {
  const datetime = adjustDatetimeForZeplan(
    params.pickup_date,
    params.pickup_time
  );

  return zeplanFetch("create-booking", {
    booking: {
      firstname: params.firstname,
      lastname: params.lastname,
      email: params.email,
      phone: params.phone,
      datetime,
      pickup: {
        address: params.pickup_address,
        full_address: params.pickup_address,
        geocoding_address: params.pickup_address,
      },
      dropoff: {
        address: params.dropoff_address,
        full_address: params.dropoff_address,
        geocoding_address: params.dropoff_address,
      },
      vehicle: mapVehicleType(params.vehicle_name),
      amount: params.price,
      driver_price: params.driver_price ?? Math.round(params.price * 0.65),
      passengers: params.passengers ?? 1,
      bags: params.bags ?? 1,
      flight_number: params.flight_number ?? "",
      additional_info: params.additional_info ?? "Booked via MCP Agent",
      type: "one_way",
      disableAllNotifications: false,
      dontSendUpdateMailToCustomer: false,
    },
  });
}

export async function listBookings(params: {
  date_from: string;
  date_to: string;
}): Promise<unknown> {
  return zeplanFetch("list-bookings", params);
}

export async function getTrackingLink(params: {
  booking_id: string;
}): Promise<unknown> {
  return zeplanFetch("get-tracking-link", params);
}
