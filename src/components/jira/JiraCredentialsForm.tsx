"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { InfoCircledIcon } from "@radix-ui/react-icons";

interface JiraCredentialsFormProps {
  onSuccess: () => void;
}

type JiraError = {
  message: string;
  details?: string;
};

export function JiraCredentialsForm({ onSuccess }: JiraCredentialsFormProps) {
  const [credentials, setCredentials] = useState({
    username: "",
    apiToken: "",
    domain: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<JiraError | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/jira/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to authenticate with Jira';
        throw new Error(errorMessage, { cause: data });
      }

      // If successful, call the onSuccess callback
      onSuccess();
    } catch (err: any) {
      console.error('Jira auth error:', err);
      
      let errorDetails = '';
      if (err.cause?.details) {
        try {
          // Try to parse the details if it's JSON
          const parsedDetails = JSON.parse(err.cause.details);
          errorDetails = parsedDetails.message || parsedDetails.errorMessages?.join(', ') || err.cause.details;
        } catch {
          // If not JSON, use as is
          errorDetails = err.cause.details;
        }
      }
      
      setError({
        message: err instanceof Error ? err.message : 'Failed to authenticate with Jira',
        details: errorDetails
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {error && (
        <div className="bg-destructive/10 p-3 rounded-md text-sm text-destructive">
          <p className="font-medium">{error.message}</p>
          {error.details && (
            <p className="mt-1 text-xs opacity-90 whitespace-pre-wrap">{error.details}</p>
          )}
          <p className="mt-2 text-xs">
            Make sure your API token is correct and has sufficient permissions.
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="username">Email Address</Label>
        <Input
          id="username"
          name="username"
          type="email"
          placeholder="your.email@company.com"
          value={credentials.username}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="apiToken">API Token</Label>
          <a 
            href="https://id.atlassian.com/manage-profile/security/api-tokens" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Create token
          </a>
        </div>
        <Input
          id="apiToken"
          name="apiToken"
          type="password"
          placeholder="Your Jira API token"
          value={credentials.apiToken}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <InfoCircledIcon className="h-3 w-3" />
          Never stored permanently; used only for this session
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="domain">Jira Domain</Label>
        <div className="flex items-center gap-1">
          <Input
            id="domain"
            name="domain"
            type="text"
            placeholder="your-company"
            value={credentials.domain}
            onChange={handleChange}
            required
          />
          <span className="text-muted-foreground whitespace-nowrap">.atlassian.net</span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <InfoCircledIcon className="h-3 w-3" />
          This is the subdomain from your Jira URL (e.g., "your-company" from "your-company.atlassian.net")
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-4" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect to Jira"
        )}
      </Button>
    </form>
  );
} 