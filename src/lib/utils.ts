import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate estimated arrival time at destination
export function calculateEstimatedArrival(
  departureTime: string,
  journeyDurationMinutes: number
): string {
  if (!departureTime) return "N/A";

  const departure = new Date(departureTime);
  const arrival = new Date(
    departure.getTime() + journeyDurationMinutes * 60000
  );

  return arrival.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Filter departures by time (only show departures after the selected time)
export function filterDeparturesByTime(
  departures: any[],
  selectedTime: string
): any[] {
  if (!departures || !selectedTime) return departures || [];

  // Convert selected time string (HH:MM) to today's date with that time
  const [hours, minutes] = selectedTime.split(":").map(Number);
  const selectedDate = new Date();
  selectedDate.setHours(hours, minutes, 0, 0);

  return departures.filter((departure) => {
    const departureTime = new Date(
      departure.estimated_departure_utc || departure.scheduled_departure_utc
    );
    return departureTime >= selectedDate;
  });
}

// Estimate journey time between two stations (simple implementation)
// In a real app, you would get this from the API or a more sophisticated calculation
export function estimateJourneyTime(
  fromStopId: number,
  toStopId: number
): number {
  // This is a very simplistic placeholder - in real app you would:
  // 1. Get actual journey time from the API if available
  // 2. Calculate based on distance and average speeds
  // 3. Use historical data or static timetable data

  // For demo purposes, return a random time between 15-45 minutes
  return Math.floor(Math.random() * 30) + 15;
}
