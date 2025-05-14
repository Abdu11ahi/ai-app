"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

// Form validation schema
const newRetroSchema = z.object({
  sprintNumber: z.coerce.number().positive().int(),
  teamName: z.string().min(1, "Team name is required"),
});

type NewRetroFormData = z.infer<typeof newRetroSchema>;

export function NewRetroForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewRetroFormData>({
    sprintNumber: 1,
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
        sprint_number: validatedData.sprintNumber,
        team_name: validatedData.teamName,
        user_id: session.user.id,
      });

      // Insert retrospective into Supabase
      const { data, error } = await supabase
        .from("retrospectives")
        .insert([{
          sprint_number: validatedData.sprintNumber,
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
            <Label htmlFor="sprintNumber">Sprint Number</Label>
            <Input
              id="sprintNumber"
              name="sprintNumber"
              type="number"
              min="1"
              value={formData.sprintNumber}
              onChange={handleChange}
              required
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
              value={formData.teamName}
              onChange={handleChange}
              required
            />
            {errors.teamName && (
              <p className="text-sm text-red-500">{errors.teamName}</p>
            )}
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