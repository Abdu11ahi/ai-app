"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"];

export function RetroList() {
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRetrospectives = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session?.user) {
          setError("You must be logged in to view retrospectives");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("retrospectives")
          .select("*")
          .eq("user_id", session.session.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setRetrospectives(data || []);
      } catch (err) {
        console.error("Error fetching retrospectives:", err);
        setError("Failed to load retrospectives. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRetrospectives();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading your retrospectives...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (retrospectives.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <p className="mb-4">You don&apos;t have any retrospectives yet.</p>
          <Link href="/retrospectives/new">
            <Button>Create Your First Retrospective</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Retrospectives</h2>
        <Link href="/retrospectives/new">
          <Button>New Retrospective</Button>
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {retrospectives.map((retro) => (
          <Link key={retro.id} href={`/retrospectives/${retro.id}`}>
            <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Sprint {retro.sprint_number}</CardTitle>
                <CardDescription>{retro.team_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(retro.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Details</Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 