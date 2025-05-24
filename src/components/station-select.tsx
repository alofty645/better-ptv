"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ptvService, Stop } from "@/lib/ptvService";

interface StationSelectProps {
  label?: string;
  onSelect: (station: Stop | null) => void;
  selectedStation: Stop | null;
  disabled?: boolean;
}

function StationSelect({
  label,
  onSelect,
  selectedStation,
  disabled = false,
}: StationSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the component to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Debounced search function
  const handleAutocomplete = (value: string) => {
    setSearchTerm(value);
    setError(null);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Don't search if input is too short
    if (value.length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    // Set a new timeout for the search
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);

      try {
        const result = await ptvService.search(value, [0]); // 0 is for trains
        setSearchResults(result.stops || []);
        setIsOpen(true);

        if (result.stops.length === 0) {
          setError("No stations found. Try a different search term.");
        }
      } catch (err) {
        console.error("Error searching for stations:", err);
        setError("Failed to search for stations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce time
  };

  // Update search term when selected station changes externally
  useEffect(() => {
    if (selectedStation && selectedStation.stop_name !== searchTerm) {
      setSearchTerm(selectedStation.stop_name);
    }
  }, [selectedStation, searchTerm]);
  return (
    <div className="space-y-1 sm:space-y-2 relative" ref={wrapperRef}>
      {label && (
        <label className="text-xs sm:text-sm font-medium">{label}</label>
      )}

      {selectedStation ? (
        <div className="flex items-center justify-between border p-1.5 sm:p-2 rounded-md bg-muted/50">
          <span className="text-xs sm:text-sm truncate pr-2">
            {selectedStation.stop_name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onSelect(null)}
            disabled={disabled}
          >
            Change
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Input
              placeholder="Search for a station..."
              value={searchTerm}
              onChange={(e) => handleAutocomplete(e.target.value)}
              className="w-full h-9 text-xs sm:text-sm"
              disabled={disabled}
              autoComplete="off"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>
          {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}{" "}
          {isOpen && searchResults.length > 0 && (
            <Card className="absolute w-full z-20 mt-1 p-1 max-h-48 sm:max-h-60 overflow-y-auto shadow-lg">
              <ul className="divide-y">
                {searchResults.map((station) => (
                  <li
                    key={station.stop_id}
                    className="p-1.5 sm:p-2 hover:bg-muted cursor-pointer"
                    onClick={() => {
                      onSelect(station);
                      setSearchResults([]);
                      setSearchTerm("");
                      setIsOpen(false);
                    }}
                  >
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {station.stop_name}
                    </p>
                    {station.suburb && (
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
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

export default StationSelect;
