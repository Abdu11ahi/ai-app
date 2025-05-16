"use client";

import { useState } from "react";
import { JiraCredentialsForm } from "./JiraCredentialsForm";
import { JiraSprintSelector } from "./JiraSprintSelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Link2 } from "lucide-react";

type JiraSprintData = {
  id: string;
  name: string;
  state: string;
  sprintNumber?: string;
  boardName: string;
};

interface JiraIntegrationProps {
  onSprintSelect: (data: { sprintName: string; sprintNumber?: number; teamName: string }) => void;
}

export function JiraIntegration({ onSprintSelect }: JiraIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sprints, setSprints] = useState<JiraSprintData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/jira/sprints');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sprints: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSprints(data.sprints || []);
    } catch (err) {
      console.error('Error fetching sprints:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sprints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSprintSelect = (sprint: JiraSprintData) => {
    onSprintSelect({
      sprintName: sprint.name,
      sprintNumber: sprint.sprintNumber ? parseInt(sprint.sprintNumber, 10) : undefined,
      teamName: sprint.boardName,
    });
    
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="w-full flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Import Sprint from Jira
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAuthenticated ? "Select Sprint from Jira" : "Connect to Jira"}
          </DialogTitle>
        </DialogHeader>
        
        {!isAuthenticated ? (
          <JiraCredentialsForm onSuccess={handleAuthSuccess} />
        ) : isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading sprints...</span>
          </div>
        ) : error ? (
          <div className="text-destructive py-4">
            <p>Error: {error}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => setIsAuthenticated(false)}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <JiraSprintSelector sprints={sprints} onSelect={handleSprintSelect} />
        )}
      </DialogContent>
    </Dialog>
  );
} 