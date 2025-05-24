import CryptoJS from "crypto-js";

// MOCK MODE: Set this to true to use mock data instead of actual API
export const USE_MOCK_DATA = true;

// Import the mock service
import * as mockService from "./mockPtvService";

// Hardcoded API credentials so users don't need to register their own
// These credentials should be replaced with your actual PTV API credentials
const DEV_ID = "3002126"; // This is a placeholder - replace with actual PTV API DevID
const API_KEY = "76ff4ffa-4811-4817-b81b-8a42c9a19fcd"; // This is a placeholder - replace with actual PTV API key
const BASE_URL = "https://timetableapi.ptv.vic.gov.au";

// In production, you would want to store these in environment variables
// const DEV_ID = process.env.NEXT_PUBLIC_PTV_DEV_ID || "";
// const API_KEY = process.env.NEXT_PUBLIC_PTV_API_KEY || "";

// Helper function to generate the signature for PTV API authentication
const generateSignature = (path: string): string => {
  const url = path.includes("?")
    ? `${path}&devid=${DEV_ID}`
    : `${path}?devid=${DEV_ID}`;
  return CryptoJS.HmacSHA1(url, API_KEY).toString();
};

// Function to build authenticated URL for PTV API
const buildAuthenticatedUrl = (path: string): string => {
  const url = path.includes("?")
    ? `${path}&devid=${DEV_ID}`
    : `${path}?devid=${DEV_ID}`;
  const signature = generateSignature(path);
  return `${BASE_URL}${url}&signature=${signature}`;
};

export interface Stop {
  stop_id: number;
  stop_name: string;
  route_type: number;
  suburb: string;
  stop_suburb?: string;
  route_id?: number;
}

export interface Departure {
  stop_id: number;
  route_id: number;
  run_id: number;
  direction_id: number;
  scheduled_departure_utc: string;
  estimated_departure_utc: string | null;
  platform_number: string;
  disruption_ids?: number[];
  at_platform?: boolean;
  flags?: string;
  departure_sequence?: number;
}

export interface Run {
  run_id: number;
  destination_name: string;
  route_id?: number;
  route_type?: number;
  final_stop_id?: number;
}

export interface Direction {
  direction_id: number;
  direction_name: string;
  route_id?: number;
  route_type?: number;
}

export interface DeparturesResponse {
  departures: Departure[];
  stops: Record<string, Stop>;
  runs: Record<string, Run>;
  directions: Record<string, Direction>;
  routes?: Record<string, any>;
  status?: any;
}

export interface SearchResponse {
  stops: Stop[];
  routes?: any[];
  outlets?: any[];
  status?: any;
}

// Real PTV API Service
const realPtvService = {
  // Search for stops or routes
  search: async (
    term: string,
    routeTypes: number[] = [0]
  ): Promise<SearchResponse> => {
    try {
      let path = `/v3/search/${encodeURIComponent(term)}?`;
      if (routeTypes && routeTypes.length > 0) {
        path = `${path}route_types=${routeTypes.join(",")}&`;
      }
      path = `${path}include_addresses=false&include_outlets=false`;
      const url = buildAuthenticatedUrl(path);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching:", error);
      throw error;
    }
  },

  // Get departures for a stop
  getDepartures: async (
    stopId: number,
    routeType: number,
    maxResults = 5
  ): Promise<DeparturesResponse> => {
    try {
      const path = `/v3/departures/route_type/${routeType}/stop/${stopId}?max_results=${maxResults}&expand=run,stop,route,direction,disruption`;
      const url = buildAuthenticatedUrl(path);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching departures:", error);
      throw error;
    }
  },
};

// Export the real service or mock service based on configuration
export const ptvService = USE_MOCK_DATA
  ? mockService.ptvService
  : realPtvService;

// Format date and time utility
export const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return "N/A";

  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Calculate time until departure
export const calculateTimeUntil = (dateTimeString: string): string => {
  if (!dateTimeString) return "N/A";

  const departureTime = new Date(dateTimeString);
  const now = new Date();

  const diffInMinutes = Math.floor(
    (departureTime.getTime() - now.getTime()) / 60000
  );

  if (diffInMinutes < 0) {
    return "Departed";
  } else if (diffInMinutes === 0) {
    return "Now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  } else {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
};
