"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";

type JiraSprintData = {
  id: string;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
  sprintNumber?: string;
  boardName: string;
};

interface JiraSprintSelectorProps {
  sprints: JiraSprintData[];
  onSelect: (sprint: JiraSprintData) => void;
}

export function JiraSprintSelector({ sprints, onSelect }: JiraSprintSelectorProps) {
  if (sprints.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No sprints found in your Jira account.
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2 py-2">
        {sprints.map((sprint) => (
          <Card 
            key={sprint.id}
            className="cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={() => onSelect(sprint)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{sprint.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Board: {sprint.boardName}
                  </p>
                </div>
                <Badge variant={sprint.state === "active" ? "default" : "secondary"}>
                  {sprint.state === "active" ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Closed
                    </span>
                  )}
                </Badge>
              </div>
              {(sprint.startDate || sprint.endDate) && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {sprint.startDate && (
                    <span>
                      Start: {formatDate(sprint.startDate)}
                      {sprint.endDate && " | "}
                    </span>
                  )}
                  {sprint.endDate && (
                    <span>End: {formatDate(sprint.endDate)}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 