"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/ui/time-picker";
import StationSelect from "@/components/station-select";
import { DepartureList } from "@/components/departure-list";
import { ptvService, Stop, DeparturesResponse } from "@/lib/ptvService";
import { filterDeparturesByTime, estimateJourneyTime } from "@/lib/utils";

interface RouteSelectorProps {
  title: string;
  mirrorWith?: "morning" | "evening";
  mirrorFromStation?: Stop | null;
  mirrorToStation?: Stop | null;
  onFromStationChange?: (station: Stop | null) => void;
  onToStationChange?: (station: Stop | null) => void;
}

export function RouteSelector({
  title,
  mirrorWith,
  mirrorFromStation,
  mirrorToStation,
  onFromStationChange,
  onToStationChange,
}: RouteSelectorProps) {
  const [fromStation, setFromStation] = useState<Stop | null>(null);
  const [toStation, setToStation] = useState<Stop | null>(null);
  const [departureTime, setDepartureTime] = useState(
    title.includes("Morning") ? "08:00" : "17:30"
  );
  const [departures, setDepartures] = useState<DeparturesResponse | null>(null);
  const [filteredDepartures, setFilteredDepartures] =
    useState<DeparturesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [journeyTime, setJourneyTime] = useState<number | null>(null);

  // Handle mirroring effect
  useEffect(() => {
    if (mirrorWith === "morning" && mirrorFromStation && mirrorToStation) {
      setFromStation(mirrorFromStation);
      setToStation(mirrorToStation);
    }
  }, [mirrorWith, mirrorFromStation, mirrorToStation]);

  // Update parent component with station changes
  useEffect(() => {
    if (onFromStationChange) {
      onFromStationChange(fromStation);
    }
  }, [fromStation, onFromStationChange]);

  useEffect(() => {
    if (onToStationChange) {
      onToStationChange(toStation);
    }
  }, [toStation, onToStationChange]);

  const handleSearchDepartures = async () => {
    if (!fromStation) {
      setError("Please select a departure station");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Route type 0 is for trains
      const result = await ptvService.getDepartures(fromStation.stop_id, 0, 10);
      setDepartures(result);

      // Filter departures based on the selected time
      const filtered = { ...result };
      filtered.departures = filterDeparturesByTime(
        result.departures,
        departureTime
      );
      setFilteredDepartures(filtered);

      if (filtered.departures.length === 0) {
        setError("No departures found for this station at the selected time.");
      }
    } catch (err) {
      console.error("Error fetching departures:", err);
      setError("Failed to load departures. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate journey time when both stations are selected
  useEffect(() => {
    if (fromStation && toStation) {
      const estimatedTime = estimateJourneyTime(
        fromStation.stop_id,
        toStation.stop_id
      );
      setJourneyTime(estimatedTime);
    }
  }, [fromStation, toStation]);

  // Reset to station when from station changes
  useEffect(() => {
    setToStation(null);
    setDepartures(null);
    setFilteredDepartures(null);
    setJourneyTime(null);
  }, [fromStation]);

  // Update filtered departures when departure time changes
  useEffect(() => {
    if (departures) {
      const filtered = { ...departures };
      filtered.departures = filterDeparturesByTime(
        departures.departures,
        departureTime
      );
      setFilteredDepartures(filtered);

      if (filtered.departures.length === 0) {
        setError("No departures found for this station at the selected time.");
      } else {
        setError(null);
      }
    }
  }, [departureTime, departures]);
  // Determine if component is in mirrored read-only mode
  const isReadOnly = mirrorWith === "morning";
  return (
    <Card className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
      {/* From Station Selection */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">From</h3>
        {isReadOnly ? (
          <div className="p-2 border rounded bg-muted/30">
            {fromStation ? (
              <p className="font-medium">{fromStation.stop_name}</p>
            ) : (
              <p className="text-muted-foreground italic">
                Mirrored station will appear here
              </p>
            )}
          </div>
        ) : (
          <StationSelect
            onSelect={setFromStation}
            selectedStation={fromStation}
          />
        )}
      </div>{" "}
      {/* To Station Selection */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">To</h3>
        {isReadOnly ? (
          <div className="p-2 border rounded bg-muted/30">
            {toStation ? (
              <p className="text-sm font-medium">{toStation.stop_name}</p>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground italic">
                Mirrored station will appear here
              </p>
            )}
          </div>
        ) : (
          <StationSelect onSelect={setToStation} selectedStation={toStation} />
        )}
      </div>{" "}
      {/* Journey Info */}
      {fromStation && toStation && (
        <div className="bg-muted/30 p-2 rounded text-xs sm:text-sm">
          <p className="font-medium truncate">
            Journey:{" "}
            <span className="truncate">
              {fromStation.stop_name} → {toStation.stop_name}
            </span>
          </p>
          {journeyTime && (
            <p className="text-muted-foreground text-xs sm:text-sm">
              Est. time: ~{journeyTime} min
            </p>
          )}
        </div>
      )}{" "}
      {/* Time Selection & Departure Button */}{" "}
      <div className="space-y-2">
        <TimePicker
          label="Departure Time"
          value={departureTime}
          onChange={setDepartureTime}
          disabled={isReadOnly}
        />

        <Button
          onClick={handleSearchDepartures}
          className="w-full text-sm h-9"
          disabled={isLoading || !fromStation}
        >
          {isLoading ? "Loading..." : "View Departures"}
        </Button>
      </div>
      {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
      {filteredDepartures && (
        <DepartureList
          departures={filteredDepartures.departures}
          runs={filteredDepartures.runs}
          directions={filteredDepartures.directions}
          title="Upcoming Departures"
          toStation={toStation}
          journeyTimeMinutes={journeyTime}
        />
      )}
    </Card>
  );
}
