"use client";

import { useState, useEffect } from "react";
import { RouteSelector } from "@/components/route-selector";
import { Stop } from "@/lib/ptvService";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [mirrorCommutes, setMirrorCommutes] = useState(false);
  const [morningFrom, setMorningFrom] = useState<Stop | null>(null);
  const [morningTo, setMorningTo] = useState<Stop | null>(null);

  // Auto-mirror effect
  useEffect(() => {
    if (mirrorCommutes && morningFrom && morningTo) {
      // No need to do anything here, the mirroring will happen in the RouteSelector
    }
  }, [mirrorCommutes, morningFrom, morningTo]);
  return (
    <main className="container max-w-4xl mx-auto p-3 py-4 sm:p-4 sm:py-8 space-y-4 sm:space-y-8">
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          PTV Train Commute Planner
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Plan your daily train commute with real-time information
        </p>
      </div>
      <div className="flex items-center flex-wrap space-x-2 mb-2 sm:mb-4 justify-center px-2">
        <Checkbox
          id="mirror"
          checked={mirrorCommutes}
          onCheckedChange={(checked: boolean | "indeterminate") =>
            setMirrorCommutes(checked === true)
          }
        />
        <Label htmlFor="mirror" className="text-xs sm:text-sm cursor-pointer">
          Mirror morning commute for evening
        </Label>
      </div>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <RouteSelector
          title="Morning Commute"
          mirrorWith={mirrorCommutes ? "evening" : undefined}
          onFromStationChange={setMorningFrom}
          onToStationChange={setMorningTo}
        />
        <RouteSelector
          title="Evening Commute"
          mirrorWith={mirrorCommutes ? "morning" : undefined}
          mirrorFromStation={mirrorCommutes ? morningTo : null}
          mirrorToStation={mirrorCommutes ? morningFrom : null}
        />
      </div>{" "}
      <footer className="text-center text-xs sm:text-sm text-muted-foreground pt-4 sm:pt-8">
        <p>Powered by PTV Timetable API</p>
      </footer>
    </main>
  );
}
