"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FeedbackType } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Feedback = {
  id: string;
  message: string;
  type: FeedbackType;
  anonymous: boolean;
  created_at: string;
  user_id: string;
  user_email?: string | null;
  retro_id: string;
  retro?: {
    sprint_number: number;
    sprint_name: string | null;
    team_name: string;
  } | null;
};

type Sprint = {
  id: string;
  sprint_number: number;
  sprint_name: string | null;
};

type GroupedFeedback = {
  [key: string]: Feedback[];
};

export function FeedbackDashboard() {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FeedbackType>("well");
  const [selectedSprint, setSelectedSprint] = useState<string>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [groupByUser, setGroupByUser] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session?.user) {
          setError("You must be logged in to view feedback");
          setLoading(false);
          return;
        }
        
        // Get current user
        const { data: currentUser } = await supabase.auth.getUser();
        const currentUserEmail = currentUser?.user?.email || 'Unknown';
        
        // Get feedback items with retro info
        const { data, error } = await supabase
          .from("feedback")
          .select(`
            *,
            retro:retrospectives(
              sprint_number,
              sprint_name,
              team_name
            )
          `)
          .order("created_at", { ascending: sortDirection === "asc" });
          
        if (error) throw error;
        
        // Create a map of user IDs to emails for non-anonymous feedback
        const userIds = data
          ?.filter(item => !item.anonymous)
          .map(item => item.user_id) || [];
          
        const uniqueUserIds = [...new Set(userIds)];
        const userEmailMap: Record<string, string> = {};
        
        // If we have users to look up, use the current user's email if it matches
        if (uniqueUserIds.length > 0) {
          // Set current user's email
          if (sessionData.session?.user.id) {
            userEmailMap[sessionData.session.user.id] = currentUserEmail;
          }
          
          // Try to fetch profile info if it exists
          try {
            const { data: profilesData, error: profilesError } = await supabase
              .from("profiles")
              .select("id, email, full_name")
              .in("id", uniqueUserIds);
              
            if (!profilesError && profilesData?.length) {
              profilesData.forEach(profile => {
                if (profile.id && (profile.email || profile.full_name)) {
                  userEmailMap[profile.id] = profile.email || profile.full_name || "Team Member";
                }
              });
            }
          } catch (err) {
            console.warn("Could not fetch user profiles:", err);
          }
        }
        
        // Enhance feedback with user emails
        const enhancedFeedback = (data || []).map(item => {
          if (!item.anonymous && userEmailMap[item.user_id]) {
            return {
              ...item,
              user_email: userEmailMap[item.user_id]
            };
          }
          return {
            ...item,
            user_email: item.anonymous ? null : "Team Member"
          };
        });
        
        setFeedbackItems(enhancedFeedback);
        
        // Get unique sprints for the filter
        const { data: retroData, error: retroError } = await supabase
          .from("retrospectives")
          .select("id, sprint_number, sprint_name")
          .order("created_at", { ascending: false });
          
        if (retroError) throw retroError;
        
        setSprints(retroData || []);
      } catch (err: any) {
        console.error("Error fetching feedback:", err);
        setError(err.message || "Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [sortDirection, selectedSprint]);
  
  const feedbackTypes = [
    { value: "well", label: "✅ What went well", emptyMessage: "No feedback on what went well yet." },
    { value: "didnt", label: "❌ What didn't", emptyMessage: "No feedback on what didn't go well yet." },
    { value: "suggestion", label: "💡 Suggestions", emptyMessage: "No suggestions yet." },
    { value: "blocker", label: "⚠️ Blockers", emptyMessage: "No blockers reported yet." },
  ];
  
  // Filter feedback by type and sprint
  const filteredFeedback = (type: FeedbackType) => {
    return feedbackItems.filter(item => {
      const matchesType = item.type === type;
      const matchesSprint = selectedSprint === "all" || item.retro_id === selectedSprint;
      return matchesType && matchesSprint;
    });
  };
  
  // Group feedback by user
  const groupFeedbackByUser = (feedback: Feedback[]): GroupedFeedback => {
    if (!groupByUser) {
      return { "all": feedback };
    }
    
    return feedback.reduce((groups: GroupedFeedback, item) => {
      const key = item.anonymous ? "Anonymous" : (item.user_email || "Unknown User");
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  };
  
  const handleSortToggle = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };
  
  if (loading) {
    return <div className="py-4 text-center">Loading feedback dashboard...</div>;
  }
  
  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Feedback Dashboard</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sprint-filter">Filter by Sprint:</Label>
            <Select value={selectedSprint} onValueChange={setSelectedSprint}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sprints</SelectItem>
                {sprints.map(sprint => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.sprint_name || `Sprint ${sprint.sprint_number}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="sort-direction">Sort:</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSortToggle}
              className="flex items-center gap-1"
            >
              {sortDirection === "desc" ? "Newest First" : "Oldest First"}
              <ArrowUpDown size={16} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="group-by-user"
              checked={groupByUser}
              onCheckedChange={setGroupByUser}
            />
            <Label htmlFor="group-by-user">Group by User</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedbackType)}>
          <TabsList className="grid grid-cols-4 mb-4">
            {feedbackTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value}>
                {type.label.split(' ')[0]}
                {filteredFeedback(type.value as FeedbackType).length > 0 && (
                  <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2">
                    {filteredFeedback(type.value as FeedbackType).length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {feedbackTypes.map((type) => {
            const typedFeedback = filteredFeedback(type.value as FeedbackType);
            const groupedFeedback = groupFeedbackByUser(typedFeedback);
            
            return (
              <TabsContent key={type.value} value={type.value}>
                <div className="space-y-6">
                  {typedFeedback.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      {type.emptyMessage}
                    </p>
                  ) : (
                    Object.entries(groupedFeedback).map(([user, items]) => (
                      <div key={user} className="space-y-3">
                        {groupByUser && (
                          <h3 className="font-medium text-sm border-b pb-1">{user}</h3>
                        )}
                        
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4">
                              <p className="mb-2">{item.message}</p>
                              <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground">
                                <div>
                                  {item.anonymous ? 'Anonymous' : item.user_email}
                                  {' • '}
                                  {new Date(item.created_at).toLocaleString()}
                                </div>
                                <div className="mt-1 sm:mt-0">
                                  {item.retro && (item.retro.sprint_name || `Sprint ${item.retro.sprint_number}`) + ` • ${item.retro.team_name}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
} 