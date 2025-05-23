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
    <main className="container max-w-4xl mx-auto p-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">PTV Train Commute Planner</h1>
        <p className="text-muted-foreground">
          Plan your daily train commute with real-time information
        </p>
      </div>{" "}
      <div className="flex items-center space-x-2 mb-4 justify-center">
        <Checkbox
          id="mirror"
          checked={mirrorCommutes}
          onCheckedChange={(checked: boolean | "indeterminate") =>
            setMirrorCommutes(checked === true)
          }
        />
        <Label htmlFor="mirror" className="text-sm cursor-pointer">
          Automatically mirror morning commute in reverse for evening commute
        </Label>
      </div>{" "}
      <div className="grid gap-6 md:grid-cols-2">
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
      </div>
      <footer className="text-center text-sm text-muted-foreground pt-8">
        <p>Powered by PTV Timetable API</p>
      </footer>
    </main>
  );
}
