"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Loader2, 
  MessageSquare, 
  Users, 
  ThumbsUp 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

type RecentActivityProps = {
  userId: string;
};

type ActivityTab = "all" | "retros" | "feedback" | "reactions";

type ActivityItem = {
  id: string;
  type: "retro" | "feedback" | "reaction";
  title: string;
  description: string;
  date: string;
  meta?: {
    feedbackType?: string;
    reactionType?: string;
    teamName?: string;
    sprintName?: string;
  };
};

export function RecentActivity({ userId }: RecentActivityProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      
      try {
        // Get retros created by user
        const { data: retros, error: retroError } = await supabase
          .from("retrospectives")
          .select("id, created_at, sprint_name, sprint_number, team_name")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5);
        
        if (retroError) throw retroError;
        
        // Get feedback submitted by user
        const { data: feedback, error: feedbackError } = await supabase
          .from("feedback")
          .select(`
            id, 
            created_at, 
            type, 
            message, 
            retro_id, 
            retrospectives(sprint_name, sprint_number, team_name)
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (feedbackError) throw feedbackError;
        
        // Get reactions by user
        const { data: reactions, error: reactionsError } = await supabase
          .from("feedback_reactions")
          .select(`
            id, 
            created_at, 
            reaction_type, 
            feedback_id, 
            feedback(message, retro_id, retrospectives(sprint_name, sprint_number, team_name))
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (reactionsError) throw reactionsError;
        
        // Process all activity items
        const activityItems: ActivityItem[] = [
          // Process retros
          ...(retros || []).map(retro => ({
            id: `retro-${retro.id}`,
            type: "retro",
            title: `Created a retrospective`,
            description: retro.sprint_name ? 
              `Created "${retro.sprint_name}"` : 
              `Created Sprint ${retro.sprint_number} retrospective`,
            date: retro.created_at,
            meta: {
              teamName: retro.team_name,
              sprintName: retro.sprint_name || `Sprint ${retro.sprint_number}`
            }
          })),
          
          // Process feedback
          ...(feedback || []).map(item => ({
            id: `feedback-${item.id}`,
            type: "feedback",
            title: `Added ${item.type} feedback`,
            description: item.message.length > 60 ? 
              `${item.message.substring(0, 60)}...` : 
              item.message,
            date: item.created_at,
            meta: {
              feedbackType: item.type,
              teamName: item.retrospectives?.team_name,
              sprintName: item.retrospectives?.sprint_name || 
                (item.retrospectives?.sprint_number ? 
                  `Sprint ${item.retrospectives.sprint_number}` : undefined)
            }
          })),
          
          // Process reactions
          ...(reactions || []).map(item => ({
            id: `reaction-${item.id}`,
            type: "reaction",
            title: `Reacted to feedback`,
            description: item.feedback?.message ? 
              (item.feedback.message.length > 60 ? 
                `${item.feedback.message.substring(0, 60)}...` : 
                item.feedback.message) : 
              "Feedback item",
            date: item.created_at,
            meta: {
              reactionType: item.reaction_type,
              teamName: item.feedback?.retrospectives?.team_name,
              sprintName: item.feedback?.retrospectives?.sprint_name || 
                (item.feedback?.retrospectives?.sprint_number ? 
                  `Sprint ${item.feedback.retrospectives.sprint_number}` : undefined)
            }
          }))
        ];
        
        // Sort by date
        activityItems.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setActivities(activityItems);
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivity();
  }, [userId]);
  
  // Filter activities based on active tab
  const filteredActivities = () => {
    if (activeTab === "all") return activities;
    
    return activities.filter(item => {
      switch (activeTab) {
        case "retros": return item.type === "retro";
        case "feedback": return item.type === "feedback";
        case "reactions": return item.type === "reaction";
        default: return true;
      }
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "retro":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "feedback":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "reaction":
        return <ThumbsUp className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  // Get badge for feedback or reaction type
  const getTypeBadge = (item: ActivityItem) => {
    if (item.type === "feedback") {
      switch (item.meta?.feedbackType) {
        case "well":
          return <Badge className="bg-green-500">What went well</Badge>;
        case "didnt":
          return <Badge className="bg-red-500">What didn't go well</Badge>;
        case "blocker":
          return <Badge className="bg-amber-500">Blocker</Badge>;
        case "suggestion":
          return <Badge className="bg-blue-500">Suggestion</Badge>;
        default:
          return null;
      }
    }
    
    if (item.type === "reaction") {
      switch (item.meta?.reactionType) {
        case "thumbsup":
          return <Badge className="bg-green-500">👍 Thumbs Up</Badge>;
        case "thumbsdown":
          return <Badge className="bg-red-500">👎 Thumbs Down</Badge>;
        default:
          return null;
      }
    }
    
    return null;
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActivityTab)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="retros">Retros</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="reactions">Reactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Loading activity...</p>
              </div>
            ) : filteredActivities().length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No activities to display.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities().map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted p-2 rounded-full">
                        {getActivityIcon(item.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium">{item.title}</h3>
                          {getTypeBadge(item)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {item.meta?.sprintName && (
                            <span className="flex items-center">
                              {item.meta.sprintName}
                            </span>
                          )}
                          
                          {item.meta?.teamName && (
                            <span className="flex items-center">
                              Team: {item.meta.teamName}
                            </span>
                          )}
                          
                          <span className="flex items-center ml-auto">
                            {formatDate(item.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 