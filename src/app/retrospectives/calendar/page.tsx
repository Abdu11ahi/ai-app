import { RetroCalendarView } from "@/components/retrospectives/RetroCalendarView";
import { CalendarIcon, Users } from "lucide-react";

export const metadata = {
  title: "Retrospectives Calendar | Team Feedback",
  description: "View all your retrospectives in a calendar format",
};

export default function RetroCalendarPage() {
  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Retrospectives Calendar</h1>
        </div>
        <p className="text-muted-foreground">
          View your team's retrospective sessions organized by date
        </p>
      </div>
      <RetroCalendarView />
    </div>
  );
} 