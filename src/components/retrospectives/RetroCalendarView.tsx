"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, List, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { calculateSentiment } from "@/lib/sentiment";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"] & {
  feedbackSummary?: {
    wellCount: number;
    didntCount: number;
    blockerCount: number;
    suggestionCount: number;
    totalCount: number;
  };
};

export function RetroCalendarView() {
  const router = useRouter();
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRetrospectives = async () => {
      try {
        setLoading(true);
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session?.user) {
          setError("You must be logged in to view retrospectives");
          setLoading(false);
          return;
        }

        // Fetch all retrospectives for the current user
        const { data: retroData, error: retroError } = await supabase
          .from("retrospectives")
          .select("*")
          .eq("user_id", session.session.user.id)
          .order("created_at", { ascending: false });

        if (retroError) throw retroError;

        // For each retrospective, fetch feedback statistics
        const retrosWithSentiment = await Promise.all((retroData || []).map(async (retro) => {
          // Get feedback counts by type
          const { data: feedbackData, error: feedbackError } = await supabase
            .from("feedback")
            .select("type")
            .eq("retro_id", retro.id);

          if (feedbackError) {
            console.error("Error fetching feedback:", feedbackError);
            return retro;
          }

          // Calculate counts for each feedback type
          const wellCount = feedbackData?.filter(f => f.type === "well").length || 0;
          const didntCount = feedbackData?.filter(f => f.type === "didnt").length || 0;
          const blockerCount = feedbackData?.filter(f => f.type === "blocker").length || 0;
          const suggestionCount = feedbackData?.filter(f => f.type === "suggestion").length || 0;
          
          return {
            ...retro,
            feedbackSummary: {
              wellCount,
              didntCount,
              blockerCount,
              suggestionCount,
              totalCount: feedbackData?.length || 0
            }
          };
        }));

        setRetrospectives(retrosWithSentiment);
      } catch (err) {
        console.error("Error fetching retrospectives:", err);
        setError("Failed to load retrospectives. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRetrospectives();
  }, []);

  // Convert retrospectives to FullCalendar events
  const events = retrospectives.map(retro => {
    const eventDate = new Date(retro.created_at);
    const sentiment = calculateSentiment(retro.feedbackSummary);
    const emoji = getSentimentEmoji(sentiment);
    
    return {
      id: retro.id,
      title: `${retro.sprint_name || `Sprint ${retro.sprint_number}`} ${emoji}`,
      date: eventDate.toISOString().split('T')[0],
      extendedProps: {
        team: retro.team_name,
        sprintName: retro.sprint_name,
        sprintNumber: retro.sprint_number,
        sentiment: sentiment,
        feedbackCount: retro.feedbackSummary?.totalCount || 0
      }
    };
  });

  const handleEventClick = (info: any) => {
    router.push(`/retrospectives/${info.event.id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your retrospectives...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-destructive/10 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="calendar" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" asChild>
              <Link href="/retrospectives" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </Link>
            </TabsTrigger>
            <TabsTrigger value="calendar" asChild>
              <Link href="/retrospectives/calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar View
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button asChild size="lg" className="gap-2 px-6 py-5 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90">
          <Link href="/retrospectives/new">
            <Plus className="h-5 w-5" />
            New Retrospective
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-lg border-border/30 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height="auto"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              dayMaxEvents={3}
              moreLinkClassNames="text-primary hover:text-primary/80"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-10 space-x-8 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">😃</span>
          <span className="text-sm text-muted-foreground">Very Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🙂</span>
          <span className="text-sm text-muted-foreground">Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">😐</span>
          <span className="text-sm text-muted-foreground">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🙁</span>
          <span className="text-sm text-muted-foreground">Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">😞</span>
          <span className="text-sm text-muted-foreground">Very Negative</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to render event content
function renderEventContent(eventInfo: any) {
  const { team, feedbackCount, sentiment } = eventInfo.event.extendedProps;
  
  // Determine background color based on sentiment
  const getBgColor = (sentiment: number) => {
    if (sentiment >= 0.6) return "bg-green-50 dark:bg-green-950/30";
    if (sentiment >= 0.3) return "bg-emerald-50 dark:bg-emerald-950/30";
    if (sentiment >= -0.3) return "bg-blue-50 dark:bg-blue-950/30";
    if (sentiment >= -0.6) return "bg-amber-50 dark:bg-amber-950/30";
    return "bg-red-50 dark:bg-red-950/30";
  };

  // Determine border color based on sentiment
  const getBorderColor = (sentiment: number) => {
    if (sentiment >= 0.6) return "border-green-200 dark:border-green-800";
    if (sentiment >= 0.3) return "border-emerald-200 dark:border-emerald-800";
    if (sentiment >= -0.3) return "border-blue-200 dark:border-blue-800";
    if (sentiment >= -0.6) return "border-amber-200 dark:border-amber-800";
    return "border-red-200 dark:border-red-800";
  };
  
  return (
    <div className={`w-full text-xs p-1.5 rounded-md border cursor-pointer 
      hover:shadow-md transition-all ${getBgColor(sentiment)} ${getBorderColor(sentiment)}`}>
      <div className="font-semibold truncate">{eventInfo.event.title}</div>
      <div className="truncate text-muted-foreground">{team}</div>
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-primary/60"></span>
        {feedbackCount} feedback
      </div>
    </div>
  );
}

// Helper function to determine sentiment emoji
function getSentimentEmoji(sentiment: number): string {
  if (sentiment >= 0.6) return "😃"; // Very positive
  if (sentiment >= 0.3) return "🙂"; // Positive
  if (sentiment >= -0.3) return "😐"; // Neutral
  if (sentiment >= -0.6) return "🙁"; // Negative
  return "😞"; // Very negative
} 