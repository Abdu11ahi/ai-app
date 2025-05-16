"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { JiraIntegration } from "@/components/jira/JiraIntegration";
import { Separator } from "@/components/ui/separator";

// Form validation schema
const newRetroSchema = z.object({
  sprintNumber: z.coerce.number().positive().int().optional(),
  sprintName: z.string().min(1, "Sprint name is required"),
  teamName: z.string().min(1, "Team name is required"),
});

type NewRetroFormData = z.infer<typeof newRetroSchema>;

export function NewRetroForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewRetroFormData>({
    sprintNumber: 1,
    sprintName: "",
    teamName: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NewRetroFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Force refresh the schema when component mounts
  useEffect(() => {
    const refreshSchema = async () => {
      try {
        // This query forces Supabase to refresh its schema cache
        await supabase.from('retrospectives').select('id').limit(1);
      } catch (err) {
        console.error("Error refreshing schema:", err);
      }
    };
    
    refreshSchema();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof NewRetroFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };

  const handleJiraSprintSelect = (data: { sprintName: string; sprintNumber?: number; teamName: string }) => {
    setFormData({
      sprintName: data.sprintName,
      sprintNumber: data.sprintNumber,
      teamName: data.teamName,
    });
    
    // Clear any errors
    setErrors({});
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setServerError(null);

    try {
      // Validate form data
      const validatedData = newRetroSchema.parse(formData);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/auth/login");
        return;
      }

      console.log("Creating retrospective with data:", {
        sprint_number: validatedData.sprintNumber || 0,
        sprint_name: validatedData.sprintName,
        team_name: validatedData.teamName,
        user_id: session.user.id,
      });

      // Insert retrospective into Supabase
      const { data, error } = await supabase
        .from("retrospectives")
        .insert([{
          sprint_number: validatedData.sprintNumber || 0,
          sprint_name: validatedData.sprintName,
          team_name: validatedData.teamName,
          user_id: session.user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Created retrospective:", data);
      
      // Redirect to the retrospective page
      router.push(`/retrospectives/${data.id}`);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const formattedErrors: Partial<Record<keyof NewRetroFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof NewRetroFormData;
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      } else {
        // Handle Supabase errors
        console.error("Error creating retrospective:", error);
        const errorMessage = error.message || "Failed to create retrospective";
        setServerError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">New Retrospective</CardTitle>
        <CardDescription className="text-center">
          Create a new retrospective session for your team
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
              {serverError}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="sprintName">Sprint Name</Label>
            <Input
              id="sprintName"
              name="sprintName"
              type="text"
              placeholder="e.g., Q2 Release, Project Alpha, March Sprint"
              value={formData.sprintName}
              onChange={handleChange}
              required
            />
            {errors.sprintName && (
              <p className="text-sm text-red-500">{errors.sprintName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sprintNumber" className="flex items-center gap-2">
              Sprint Number <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="sprintNumber"
              name="sprintNumber"
              type="number"
              min="1"
              placeholder="e.g., 1, 2, 3"
              value={formData.sprintNumber || ""}
              onChange={handleChange}
            />
            {errors.sprintNumber && (
              <p className="text-sm text-red-500">{errors.sprintNumber}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              name="teamName"
              type="text"
              placeholder="e.g., Frontend Team, Product Team"
              value={formData.teamName}
              onChange={handleChange}
              required
            />
            {errors.teamName && (
              <p className="text-sm text-red-500">{errors.teamName}</p>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Or import from Jira</p>
            <JiraIntegration onSprintSelect={handleJiraSprintSelect} />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Start Retro"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 