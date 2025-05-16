"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function OpenAIConfigCheck() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConfig = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get the user's token for auth
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        setError("Authentication required to check OpenAI configuration");
        setLoading(false);
        return;
      }
      
      // Make the API request with auth header
      const token = sessionData.session.access_token;
      
      const response = await fetch("/api/debug-openai", {
        headers: {
          "Authorization": `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (response.status === 401) {
        setError("Authentication required to check OpenAI configuration");
      } else {
        try {
          const data = await response.json();
          setResult(data);
        } catch (parseError) {
          throw new Error("Failed to parse response from server");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to check OpenAI configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenAI Configuration Check</CardTitle>
        <CardDescription>
          Verify OpenAI API configuration for feedback theme clustering
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={checkConfig} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Configuration...
              </>
            ) : (
              "Check OpenAI Configuration"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-3 pt-2">
              {result.success ? (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">OpenAI API Ready</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Your OpenAI API key is configured and working correctly.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                  <XCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-700">OpenAI API Issues Detected</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    {result.error || "Unknown issue with OpenAI configuration"}
                    {result.details && (
                      <div className="mt-2 text-xs bg-amber-100 p-2 rounded">
                        <code>{result.details}</code>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm space-y-2">
                <h4 className="font-medium">Configuration Details:</h4>
                <ul className="space-y-1 list-disc pl-5">
                  <li>API Key Configured: {result.keyConfigured ? "Yes" : "No"}</li>
                  {result.keyConfigured && (
                    <>
                      <li>API Key Format: {result.keyFirstChars} ({result.keyLength} characters)</li>
                      {!result.success && (
                        <li className="text-red-600">
                          API Key may be invalid or improperly formatted
                        </li>
                      )}
                    </>
                  )}
                  <li>User Authentication: {result.authenticated ? "Authenticated" : "Not authenticated"}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 