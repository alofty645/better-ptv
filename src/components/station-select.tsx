"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ptvService, Stop } from "@/lib/ptvService";

interface StationSelectProps {
  onStationSelect: (station: Stop | null) => void;
  placeholder?: string;
  selectedStation?: Stop | null;
}

export function StationSelect({
  onStationSelect,
  placeholder = "Search for a station",
  selectedStation,
}: StationSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (searchTerm.length < 3) {
      setError("Please enter at least 3 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await ptvService.search(searchTerm, [0]); // 0 is for trains
      setSearchResults(result.stops || []);

      if (result.stops.length === 0) {
        setError("No stations found. Try a different search term.");
      }
    } catch (err) {
      console.error("Error searching for stations:", err);
      setError("Failed to search for stations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-3">
      {selectedStation ? (
        <div className="flex items-center justify-between border p-2 rounded-md bg-muted/50">
          <span>{selectedStation.stop_name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStationSelect(null)}
          >
            Change
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {searchResults.length > 0 && (
            <Card className="p-1 max-h-60 overflow-y-auto">
              <ul className="divide-y">
                {searchResults.map((station) => (
                  <li
                    key={station.stop_id}
                    className="p-2 hover:bg-muted cursor-pointer"
                    onClick={() => {
                      onStationSelect(station);
                      setSearchResults([]);
                      setSearchTerm("");
                    }}
                  >
                    <p className="font-medium">{station.stop_name}</p>
                    {station.suburb && (
                      <p className="text-sm text-muted-foreground">
                        {station.suburb}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// No need for both named export and export default
export default StationSelect;
