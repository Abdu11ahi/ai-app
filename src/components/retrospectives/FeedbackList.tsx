"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FeedbackType } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Feedback = {
  id: string;
  message: string;
  type: FeedbackType;
  anonymous: boolean;
  created_at: string;
  user_id: string;
  user_email?: string | null;
  profiles?: {
    email?: string;
    full_name?: string;
  } | null;
};

type FeedbackListProps = {
  retroId: string;
  refreshTrigger?: number;
};

export function FeedbackList({ retroId, refreshTrigger = 0 }: FeedbackListProps) {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FeedbackType>("well");
  
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
        
        // Add user email to each feedback item
        const enhancedFeedback = data?.map(item => ({
          ...item,
          // If feedback is not anonymous and it's from the current user, show their email
          user_email: (!item.anonymous && item.user_id === sessionData.session.user.id) 
            ? currentUserEmail 
            : null
        })) || [];
        
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
  
  const filteredFeedback = (type: FeedbackType) => {
    return feedbackItems.filter(item => item.type === type);
  };
  
  if (loading) {
    return <div className="py-4 text-center">Loading feedback...</div>;
  }
  
  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Team Feedback</CardTitle>
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