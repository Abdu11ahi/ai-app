"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database } from "@/lib/database.types";

type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"];

export function RetroDetails({ id }: { id: string }) {
  const router = useRouter();
  const [retro, setRetro] = useState<Retrospective | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRetro = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
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
        if (data.user_id !== session.user.id) {
          setError("You don't have permission to view this retrospective");
          return;
        }

        setRetro(data);
      } catch (err: any) {
        console.error("Error fetching retrospective:", err);
        setError(err.message || "Failed to load retrospective");
      } finally {
        setLoading(false);
      }
    };

    fetchRetro();
  }, [id, router]);

  if (loading) {
    return <div className="py-4 text-center">Loading retrospective...</div>;
  }

  if (error || !retro) {
    return (
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
    );
  }

  return (
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
  );
} 