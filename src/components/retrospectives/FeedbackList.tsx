"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FeedbackType, ReactionType } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ArrowDown01, ArrowUp10, CalendarDays } from "lucide-react";
import { toggleReaction, type FeedbackWithReactions, type ReactionCount } from "@/lib/feedback-utils";

type FeedbackListProps = {
  retroId: string;
  refreshTrigger?: number;
};

type SortOption = "newest" | "oldest" | "popular";

export function FeedbackList({ retroId, refreshTrigger = 0 }: FeedbackListProps) {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackWithReactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FeedbackType>("well");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  
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
        
        // Get current user email for displaying non-anonymous feedback
        const { data: currentUser } = await supabase.auth.getUser();
        const currentUserEmail = currentUser?.user?.email || 'Unknown';
        
        // Get feedback items
        const { data, error } = await supabase
          .from("feedback")
          .select("*")
          .eq("retro_id", retroId)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        // Fetch all reactions for these feedback items
        const { data: allReactions, error: reactionsError } = await supabase
          .from("feedback_reactions")
          .select("*")
          .in("feedback_id", data?.map(item => item.id) || []);
          
        if (reactionsError) throw reactionsError;
        
        // Process the feedback items with reactions
        const enhancedFeedback: FeedbackWithReactions[] = data?.map(item => {
          // Count reactions for this item
          const itemReactions = allReactions?.filter(r => r.feedback_id === item.id) || [];
          
          const reactions: ReactionCount = {
            thumbsup: itemReactions.filter(r => r.reaction_type === "thumbsup").length,
            thumbsdown: itemReactions.filter(r => r.reaction_type === "thumbsdown").length
          };
          
          // Check if current user has reacted
          const userReaction = itemReactions.find(r => r.user_id === sessionData.session?.user.id)?.reaction_type as ReactionType | undefined;
          
          return {
            ...item,
            // If feedback is not anonymous and it's from the current user, show their email
            user_email: (!item.anonymous && item.user_id === sessionData.session.user.id) 
              ? currentUserEmail 
              : null,
            reactions,
            userReaction
          };
        }) || [];
        
        setFeedbackItems(enhancedFeedback);
      } catch (err: any) {
        console.error("Error fetching feedback:", err);
        setError(err.message || "Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [retroId, refreshTrigger]);
  
  const feedbackTypes = [
    { value: "well", label: "✅ What went well", emptyMessage: "No feedback on what went well yet." },
    { value: "didnt", label: "❌ What didn't", emptyMessage: "No feedback on what didn't go well yet." },
    { value: "suggestion", label: "💡 Suggestions", emptyMessage: "No suggestions yet." },
    { value: "blocker", label: "⚠️ Blockers", emptyMessage: "No blockers reported yet." },
  ];
  
  // Handle reactions
  const handleReaction = async (feedbackId: string, reactionType: ReactionType) => {
    const success = await toggleReaction(feedbackId, reactionType);
    
    if (success) {
      // Update the local state immediately for better UX
      setFeedbackItems(prev => {
        return prev.map(item => {
          if (item.id === feedbackId) {
            const isRemoval = item.userReaction === reactionType;
            const isSwitch = item.userReaction && item.userReaction !== reactionType;
            
            // Clone the reactions object
            const newReactions = { ...item.reactions };
            
            // Update counts based on action
            if (isRemoval) {
              // User is removing their reaction
              newReactions[reactionType]--;
              return { ...item, reactions: newReactions, userReaction: undefined };
            } else if (isSwitch) {
              // User is switching from one reaction to another
              const oldReaction = item.userReaction as ReactionType;
              newReactions[oldReaction]--;
              newReactions[reactionType]++;
              return { ...item, reactions: newReactions, userReaction: reactionType };
            } else {
              // User is adding a new reaction
              newReactions[reactionType]++;
              return { ...item, reactions: newReactions, userReaction: reactionType };
            }
          }
          return item;
        });
      });
    }
  };
  
  const filteredFeedback = (type: FeedbackType) => {
    const filtered = feedbackItems.filter(item => item.type === type);
    
    // Sort the filtered feedback
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "popular":
          // Sort by thumbsup count (descending), then by thumbsdown count (ascending)
          const aPopularity = a.reactions.thumbsup - (a.reactions.thumbsdown * 0.5);
          const bPopularity = b.reactions.thumbsup - (b.reactions.thumbsdown * 0.5);
          return bPopularity - aPopularity;
        default:
          return 0;
      }
    });
  };
  
  if (loading) {
    return <div className="py-4 text-center">Loading feedback...</div>;
  }
  
  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Team Feedback</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant={sortBy === "popular" ? "secondary" : "ghost"} 
            size="sm" 
            className="px-2" 
            onClick={() => setSortBy("popular")}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Popular
          </Button>
          <Button 
            variant={sortBy === "newest" ? "secondary" : "ghost"} 
            size="sm" 
            className="px-2" 
            onClick={() => setSortBy("newest")}
          >
            <ArrowUp10 className="h-4 w-4 mr-1" />
            Newest
          </Button>
          <Button 
            variant={sortBy === "oldest" ? "secondary" : "ghost"} 
            size="sm" 
            className="px-2" 
            onClick={() => setSortBy("oldest")}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Oldest
          </Button>
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
            
            return (
              <TabsContent key={type.value} value={type.value}>
                <div className="space-y-4">
                  {typedFeedback.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      {type.emptyMessage}
                    </p>
                  ) : (
                    typedFeedback.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-grow">
                            <p className="mb-2">{item.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.anonymous 
                                ? 'Anonymous'
                                : item.user_email 
                                  ? `From: ${item.user_email}` 
                                  : 'From: Team Member'}
                              {' • '}
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 mb-1">
                              <Button
                                variant={item.userReaction === "thumbsup" ? "secondary" : "outline"}
                                size="sm"
                                className="h-8 px-2 py-1"
                                onClick={() => handleReaction(item.id, "thumbsup")}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                <span>{item.reactions.thumbsup || 0}</span>
                              </Button>
                              <Button
                                variant={item.userReaction === "thumbsdown" ? "secondary" : "outline"}
                                size="sm"
                                className="h-8 px-2 py-1"
                                onClick={() => handleReaction(item.id, "thumbsdown")}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                <span>{item.reactions.thumbsdown || 0}</span>
                              </Button>
                            </div>
                            {(item.reactions.thumbsup > 0 || item.reactions.thumbsdown > 0) && (
                              <span className="text-xs text-muted-foreground">
                                {item.reactions.thumbsup + item.reactions.thumbsdown} reactions
                              </span>
                            )}
                          </div>
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