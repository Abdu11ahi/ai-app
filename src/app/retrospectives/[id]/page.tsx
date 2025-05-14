"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { FeedbackForm } from "@/components/retrospectives/FeedbackForm";
import { FeedbackList } from "@/components/retrospectives/FeedbackList";

type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"];

// Properly type the params according to Next.js 15.x typings
export default function RetroPage({ params }: { params: { id: string } }) {
  // Get the ID directly without trying to handle it as a Promise
  const { id } = params;
  
  const router = useRouter();
  const [retro, setRetro] = useState<Retrospective | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackRefresh, setFeedbackRefresh] = useState(0);

  useEffect(() => {
    const fetchRetro = async () => {
      try {
        // Check if user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          router.push("/auth/login");
          return;
        }

        const { data, error } = await supabase
          .from("retrospectives")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        // Check if the retrospective belongs to the current user
        if (data.user_id !== sessionData.session.user.id) {
          setError("You don't have permission to view this retrospective");
          return;
        }

        setRetro(data);
      } catch (err) {
        console.error("Error fetching retrospective:", err);
        setError("Failed to load retrospective. It may not exist or you don't have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    fetchRetro();
  }, [id, router]);

  const handleFeedbackAdded = () => {
    // Increment the refresh trigger to reload feedback list
    setFeedbackRefresh(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <p>Loading retrospective...</p>
      </div>
    );
  }

  if (error || !retro) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="text-red-500 mb-4">{error || "Retrospective not found"}</p>
              <Link href="/retrospectives">
                <Button>Back to Retrospectives</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href="/retrospectives">
          <Button variant="outline">← Back to All Retrospectives</Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Sprint {retro.sprint_number} Retrospective</CardTitle>
          <CardDescription>Team: {retro.team_name}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Created on {new Date(retro.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FeedbackForm 
            retroId={id} 
            onFeedbackAdded={handleFeedbackAdded} 
          />
        </div>
        
        <div>
          <FeedbackList 
            retroId={id} 
            refreshTrigger={feedbackRefresh} 
          />
        </div>
      </div>
    </div>
  );
} 