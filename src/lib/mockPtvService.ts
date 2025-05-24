// Mock version of ptvService.ts for testing UI without API key

export interface Stop {
  stop_id: number;
  stop_name: string;
  route_type: number;
  suburb: string;
}

export interface Direction {
  direction_id: number;
  direction_name: string;
  route_id: number;
  route_type: number;
}

export interface Run {
  run_id: number;
  route_id: number;
  route_type: number;
  final_stop_id: number;
  destination_name: string;
}

export interface Departure {
  stop_id: number;
  route_id: number;
  run_id: number;
  direction_id: number;
  disruption_ids: number[];
  scheduled_departure_utc: string;
  estimated_departure_utc: string | null;
  at_platform: boolean;
  platform_number: string;
  flags: string;
  departure_sequence: number;
}

export interface DeparturesResponse {
  departures: Departure[];
  stops: Record<string, Stop>;
  routes: Record<string, any>;
  runs: Record<string, Run>;
  directions: Record<string, Direction>;
  status: any;
}

export interface SearchResponse {
  stops: Stop[];
  routes: any[];
  outlets: any[];
  status: any;
}

// Mock data for stations
const mockStations: Stop[] = [
  { stop_id: 1071, stop_name: "Flinders Street", route_type: 0, suburb: "Melbourne" },
  { stop_id: 1181, stop_name: "Southern Cross", route_type: 0, suburb: "Melbourne" },
  { stop_id: 1162, stop_name: "Richmond", route_type: 0, suburb: "Richmond" },
  { stop_id: 1068, stop_name: "South Yarra", route_type: 0, suburb: "South Yarra" },
  { stop_id: 1154, stop_name: "Caulfield", route_type: 0, suburb: "Caulfield" },
  { stop_id: 1151, stop_name: "Clayton", route_type: 0, suburb: "Clayton" },
  { stop_id: 1001, stop_name: "Dandenong", route_type: 0, suburb: "Dandenong" },
  { stop_id: 1121, stop_name: "Pakenham", route_type: 0, suburb: "Pakenham" },
  { stop_id: 1091, stop_name: "Lilydale", route_type: 0, suburb: "Lilydale" },
  { stop_id: 1030, stop_name: "Belgrave", route_type: 0, suburb: "Belgrave" },
  { stop_id: 1220, stop_name: "Williamstown", route_type: 0, suburb: "Williamstown" },
  { stop_id: 1101, stop_name: "Werribee", route_type: 0, suburb: "Werribee" }
];

// Mock data for directions
const mockDirections: Record<string, Direction> = {
  "1": { direction_id: 1, direction_name: "City (Flinders Street)", route_id: 1, route_type: 0 },
  "2": { direction_id: 2, direction_name: "Pakenham", route_id: 2, route_type: 0 },
  "3": { direction_id: 3, direction_name: "Lilydale", route_id: 3, route_type: 0 },
  "4": { direction_id: 4, direction_name: "Belgrave", route_id: 4, route_type: 0 },
  "5": { direction_id: 5, direction_name: "Werribee", route_id: 5, route_type: 0 }
};

// Mock data for runs
const mockRuns: Record<string, Run> = {
  "100": { run_id: 100, route_id: 1, route_type: 0, final_stop_id: 1071, destination_name: "Flinders Street" },
  "101": { run_id: 101, route_id: 2, route_type: 0, final_stop_id: 1121, destination_name: "Pakenham" },
  "102": { run_id: 102, route_id: 3, route_type: 0, final_stop_id: 1091, destination_name: "Lilydale" },
  "103": { run_id: 103, route_id: 4, route_type: 0, final_stop_id: 1030, destination_name: "Belgrave" },
  "104": { run_id: 104, route_id: 5, route_type: 0, final_stop_id: 1101, destination_name: "Werribee" }
};

// Helper function to generate mock departures
const generateMockDepartures = (stopId: number, count: number): Departure[] => {
  const now = new Date();
  const departures: Departure[] = [];
  
  for (let i = 0; i < count; i++) {
    const departureTime = new Date(now.getTime() + (i * 10 + 5) * 60000);
    const runId = 100 + (i % 5);
    
    departures.push({
      stop_id: stopId,
      route_id: (i % 5) + 1,
      run_id: runId,
      direction_id: (i % 5) + 1,
      disruption_ids: [],
      scheduled_departure_utc: departureTime.toISOString(),
      estimated_departure_utc: null,
      at_platform: false,
      platform_number: `${(i % 10) + 1}`,
      flags: "",
      departure_sequence: i
    });
  }
  
  return departures;
};

class MockPtvService {
  // Search for stops
  async search(term: string, routeTypes: number[]): Promise<SearchResponse> {
    console.log(`[MOCK] Searching for "${term}" with route types:`, routeTypes);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter stations based on search term
    const stops = mockStations.filter(station => 
      station.stop_name.toLowerCase().includes(term.toLowerCase()) && 
      (routeTypes.length === 0 || routeTypes.includes(station.route_type))
    );
    
    return {
      stops,
      routes: [],
      outlets: [],
      status: { version: "3.0", health: 1 }
    };
  }
  
  // Get departures for a stop
  async getDepartures(stopId: number, routeType: number, limit: number): Promise<DeparturesResponse> {
    console.log(`[MOCK] Getting departures for stop ${stopId}, route type ${routeType}, limit ${limit}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the station
    const station = mockStations.find(s => s.stop_id === stopId);
    if (!station) {
      throw new Error(`Station with ID ${stopId} not found`);
    }
    
    // Generate mock departures
    const departures = generateMockDepartures(stopId, limit);
    
    // Build response
    const response: DeparturesResponse = {
      departures,
      stops: { [stopId]: station },
      routes: {},
      runs: mockRuns,
      directions: mockDirections,
      status: { version: "3.0", health: 1 }
    };
    
    return response;
  }
}

export const ptvService = new MockPtvService();
