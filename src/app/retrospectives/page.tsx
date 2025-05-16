import { RetroList } from "@/components/retrospectives/RetroList";
import { UsersRound } from "lucide-react";

export const metadata = {
  title: "Retrospectives | Team Feedback",
  description: "Manage your team's retrospective sessions and track feedback over time",
};

export default function RetrospecivesPage() {
  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <UsersRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Retrospectives</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your team's retrospective sessions and track feedback over time
        </p>
      </div>
      <RetroList />
    </div>
  );
} 