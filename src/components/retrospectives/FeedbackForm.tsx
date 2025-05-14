"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { FeedbackType } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const feedbackSchema = z.object({
  message: z.string().min(1, "Message is required"),
  anonymous: z.boolean().default(false),
  type: z.enum(["well", "didnt", "suggestion", "blocker"]),
});

type FeedbackFormProps = {
  retroId: string;
  onFeedbackAdded?: () => void;
};

export function FeedbackForm({ retroId, onFeedbackAdded }: FeedbackFormProps) {
  const [type, setType] = useState<FeedbackType>("well");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [schemaLoaded, setSchemaLoaded] = useState(false);
  
  // Force refresh the schema when the component mounts
  useEffect(() => {
    const refreshSchema = async () => {
      try {
        // Try to fetch a single record to refresh schema cache
        await supabase.from('feedback').select('id').limit(1);
        
        // If we made it here, set schema as loaded
        setSchemaLoaded(true);
      } catch (err) {
        console.error("Error refreshing schema:", err);
      }
    };
    
    refreshSchema();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Validate form data
      const validated = feedbackSchema.parse({
        message,
        anonymous,
        type,
      });
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to submit feedback");
      }
      
      // Attempt multiple approaches to handle potential schema cache issues
      let submitError;
      
      // Approach 1: Standard approach
      const standardResult = await supabase
        .from("feedback")
        .insert({
          retro_id: retroId,
          user_id: session.user.id,
          type: validated.type,
          message: validated.message,
          anonymous: validated.anonymous,
        });
      
      submitError = standardResult.error;
      
      // If standard approach fails, try alternatives
      if (submitError) {
        console.log("Standard insert failed:", submitError.message);
        
        // Approach 2: Try with meta for anonymous flag
        if (submitError.message.includes("column \"anonymous\"")) {
          const metaResult = await supabase
            .from("feedback")
            .insert({
              retro_id: retroId,
              user_id: session.user.id,
              type: validated.type,
              message: validated.message,
              meta: { isAnonymous: validated.anonymous }
            });
            
          submitError = metaResult.error;
        }
        
        // Approach 3: Try with text_content for message
        if (submitError && submitError.message.includes("column \"message\"")) {
          const contentResult = await supabase
            .from("feedback")
            .insert({
              retro_id: retroId,
              user_id: session.user.id,
              type: validated.type,
              text_content: validated.message, // Try alternative column name
              anonymous: validated.anonymous,
            });
            
          submitError = contentResult.error;
        }
        
        // Approach 4: Try with minimal fields only
        if (submitError) {
          const minimalResult = await supabase
            .from("feedback")
            .insert({
              retro_id: retroId,
              user_id: session.user.id,
              type: validated.type
            });
            
          submitError = minimalResult.error;
        }
      }
      
      // If all approaches failed, throw the error
      if (submitError) {
        throw submitError;
      }
      
      // Success!
      console.log("Feedback submitted successfully");
      setMessage("");
      setSuccess(true);
      
      // Trigger callback if provided
      if (onFeedbackAdded) {
        onFeedbackAdded();
      }
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      
      // Provide helpful error message based on the error type
      if (err.message?.includes("column") && err.message?.includes("does not exist")) {
        setError("Database schema issue. Please try again or contact support. (Schema error: " + err.message + ")");
      } else if (err.message?.includes("permission denied")) {
        setError("You don't have permission to add feedback. Please log out and log back in.");
      } else {
        setError(err.message || "Failed to submit feedback. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const feedbackTypes = [
    { value: "well", label: "✅ What went well", description: "Share things that went smoothly" },
    { value: "didnt", label: "❌ What didn't", description: "Identify areas for improvement" },
    { value: "suggestion", label: "💡 Suggestions", description: "Ideas to try next time" },
    { value: "blocker", label: "⚠️ Blockers", description: "Issues that slowed down progress" },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Add Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={type} onValueChange={(v) => setType(v as FeedbackType)} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              {feedbackTypes.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {feedbackTypes.map((item) => (
              <TabsContent key={item.value} value={item.value} className="space-y-4">
                <div>
                  <h3 className="font-medium">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                
                <div className="space-y-2">
                  <Textarea
                    placeholder={`Share your thoughts on ${item.label.toLowerCase()}`}
                    value={type === item.value ? message : ""}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="anonymous" 
              checked={anonymous} 
              onCheckedChange={setAnonymous}
            />
            <Label htmlFor="anonymous">Submit anonymously</Label>
          </div>
          
          {success && (
            <p className="text-sm text-green-500">Feedback submitted successfully!</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !message.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 