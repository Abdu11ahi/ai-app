"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FeedbackType } from "@/lib/database.types";
import Link from "next/link";

type FeedbackItem = {
  id: string;
  message: string;
  type: FeedbackType;
  created_at: string;
  user_email?: string | null;
  retro_id?: string;
  retro?: {
    sprint_number: number;
    sprint_name: string | null;
    team_name: string;
  } | null;
};

export default function FeedbackDashboardPage() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      
      // Check user authentication
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("You must be logged in to view feedback");
      }
      
      // Fetch all feedback with retro info
      const { data, error } = await supabase
        .from("feedback")
        .select(`
          id,
          message,
          type,
          created_at,
          retro_id,
          retro:retrospectives(
            sprint_number,
            sprint_name,
            team_name
          )
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      // Process the data to handle the retro array properly
      const processedData = (data || []).map(item => ({
        id: item.id,
        message: item.message,
        type: item.type,
        created_at: item.created_at,
        retro_id: item.retro_id,
        // Extract the first item from the retro array if it exists
        retro: item.retro && item.retro.length > 0 ? item.retro[0] : null
      }));
      
      // If any retro information is missing, try to fetch it directly
      for (let i = 0; i < processedData.length; i++) {
        if (processedData[i].retro_id && !processedData[i].retro) {
          try {
            const { data: retroData, error: retroError } = await supabase
              .from("retrospectives")
              .select("sprint_number, sprint_name, team_name")
              .eq("id", processedData[i].retro_id)
              .single();
              
            if (!retroError && retroData) {
              processedData[i].retro = retroData;
            }
          } catch (err) {
            console.warn("Error fetching retro info:", err);
          }
        }
      }
      
      setFeedbackItems(processedData);
    } catch (err: any) {
      console.error("Error fetching feedback:", err);
      setError(err.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  // Count feedback by type
  const totalFeedback = feedbackItems.length;
  const positiveCount = feedbackItems.filter(item => item.type === "well").length;
  const negativeCount = feedbackItems.filter(item => item.type === "didnt" || item.type === "blocker").length;
  
  // Get recent feedback (last 5 items)
  const recentFeedback = feedbackItems.slice(0, 5);

  // Helper function to format sprint info
  const formatSprintInfo = (item: FeedbackItem) => {
    if (item.retro?.sprint_name) {
      return item.retro.sprint_name;
    } else if (item.retro?.sprint_number) {
      return `Sprint ${item.retro.sprint_number}`;
    } else {
      return "Unknown Sprint";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <Link href="/auth/login" className="mt-2 text-blue-600 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold">Feedback Dashboard</h1>
      </div>
      
      <p className="text-gray-600 mb-8">
        View and analyze feedback from all your retrospectives
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Total Feedback</h2>
          <p className="text-3xl font-bold text-blue-600">{totalFeedback}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Positive Reactions</h2>
          <div className="flex items-center">
            <ThumbsUp className="h-6 w-6 text-green-500 mr-2" />
            <p className="text-3xl font-bold text-green-600">{positiveCount}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Negative Reactions</h2>
          <div className="flex items-center">
            <ThumbsDown className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-3xl font-bold text-red-600">{negativeCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Feedback</h2>
        </div>
        
        <div className="p-6">
          {recentFeedback.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No feedback items available
            </p>
          ) : (
            <div className="space-y-4">
              {recentFeedback.map(item => (
                <div key={item.id} className="border-b pb-4 last:border-none">
                  <p className="mb-2 font-medium">
                    {item.type === "well" && "✅ "}
                    {item.type === "didnt" && "❌ "}
                    {item.type === "blocker" && "⚠️ "}
                    {item.type === "suggestion" && "💡 "}
                    {item.message}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatSprintInfo(item)}
                    {' • '}
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 