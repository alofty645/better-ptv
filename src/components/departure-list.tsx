"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import {
  calculateTimeUntil,
  formatDateTime,
  Departure,
  Run,
  Direction,
  Stop,
} from "@/lib/ptvService";
import { calculateEstimatedArrival } from "@/lib/utils";

interface DepartureListProps {
  departures: Departure[];
  runs: Record<string, Run>;
  directions: Record<string, Direction>;
  title: string;
  toStation?: Stop | null;
  journeyTimeMinutes?: number | null;
}

export function DepartureList({
  departures,
  runs,
  directions,
  title,
  toStation,
  journeyTimeMinutes,
}: DepartureListProps) {
  if (!departures || departures.length === 0) {
    return (
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-base sm:text-lg font-medium">{title}</h3>
        <Card className="p-3 sm:p-4">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            No departures available
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-1 sm:space-y-2">
      <h3 className="text-base sm:text-lg font-medium">{title}</h3>
      <Card className="divide-y">
        {departures.map((departure, index) => {
          const run = runs[departure.run_id.toString()];
          const direction = directions[departure.direction_id.toString()];
          const scheduledTime = formatDateTime(
            departure.scheduled_departure_utc
          );
          const estimatedTime = departure.estimated_departure_utc
            ? formatDateTime(departure.estimated_departure_utc)
            : null;
          const timeUntil = calculateTimeUntil(
            departure.estimated_departure_utc ||
              departure.scheduled_departure_utc
          );
          return (
            <div key={`${departure.run_id}-${index}`} className="p-3 sm:p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <h4 className="font-semibold text-sm sm:text-base truncate max-w-[180px] sm:max-w-none">
                      {run?.destination_name || "Unknown"}
                    </h4>
                    <Badge
                      variant={
                        timeUntil === "Now" ? "destructive" : "secondary"
                      }
                      className="text-xs h-5"
                    >
                      {timeUntil}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {direction?.direction_name} Line
                  </p>
                </div>

                {departure.platform_number && (
                  <Badge variant="outline" className="text-xs h-5">
                    Platform {departure.platform_number}
                  </Badge>
                )}
              </div>{" "}
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm">
                {estimatedTime ? (
                  <p>
                    <span className="font-medium">Est: {estimatedTime}</span>
                    <span className="ml-1 sm:ml-2 text-muted-foreground text-xs">
                      (Scheduled: {scheduledTime})
                    </span>
                  </p>
                ) : (
                  <p>Scheduled: {scheduledTime}</p>
                )}
                {toStation && journeyTimeMinutes && (
                  <Tooltip
                    content={`Estimated arrival at ${toStation.stop_name} after ~${journeyTimeMinutes} min journey. Calculated from departure time.`}
                  >
                    <p className="mt-1 border-t pt-1 border-gray-100 dark:border-gray-800">
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        Arrives at {toStation.stop_name.split(" ")[0]}:
                      </span>{" "}
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {calculateEstimatedArrival(
                          departure.estimated_departure_utc ||
                            departure.scheduled_departure_utc,
                          journeyTimeMinutes
                        )}
                      </span>
                      <span className="text-[10px] sm:text-xs ml-1 sm:ml-2 text-muted-foreground">
                        (~{journeyTimeMinutes} min)
                      </span>
                    </p>
                  </Tooltip>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
