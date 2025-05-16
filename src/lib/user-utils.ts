import { supabase } from "./supabase";
import { SentimentScore } from "./database.types";

export type UserStats = {
  totalRetros: number;
  totalFeedback: number;
  totalReactions: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  averageSentiment: string; // 'positive', 'negative', or 'neutral'
};

export type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  stats: UserStats;
};

export type TopContributor = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  score: number; // A calculated score based on participation
  feedbackCount: number;
  retroCount: number;
  reactionCount: number;
};

/**
 * Get a user's profile and stats
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching profile for user ID:", userId);
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (profileError) {
      console.error("Profile query error:", JSON.stringify(profileError));
      throw profileError;
    }
    
    if (!profile) {
      console.error("No profile found for user ID:", userId);
      return null;
    }
    
    console.log("Profile found:", profile);

    // Get retro count
    const { count: retroCount, error: retroError } = await supabase
      .from("retrospectives")
      .select("id", { count: 'exact', head: true })
      .eq("user_id", userId);

    if (retroError) {
      console.error("Retro count error:", JSON.stringify(retroError));
      throw retroError;
    }

    // Get feedback count and sentiment breakdown
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback")
      .select("id")
      .eq("user_id", userId);
    
    if (feedbackError) {
      console.error("Feedback query error:", JSON.stringify(feedbackError));
      throw feedbackError;
    }

    // Get reaction count
    const { count: reactionCount, error: reactionError } = await supabase
      .from("feedback_reactions")
      .select("id", { count: 'exact', head: true })
      .eq("user_id", userId);
    
    if (reactionError) {
      console.error("Reaction count error:", JSON.stringify(reactionError));
      throw reactionError;
    }

    // Set default sentiment values since we're not querying for sentiment
    const sentimentBreakdown = {
      positive: 0,
      negative: 0,
      neutral: feedbackData.length // Consider all feedback neutral if no sentiment data
    };

    // Default to neutral sentiment
    const averageSentiment = "neutral";

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      stats: {
        totalRetros: retroCount || 0,
        totalFeedback: feedbackData.length,
        totalReactions: reactionCount || 0,
        sentimentBreakdown,
        averageSentiment
      }
    };
  } catch (error) {
    console.error("Error getting user profile:", JSON.stringify(error));
    return null;
  }
};

/**
 * Get top contributors based on a calculated engagement score
 */
export const getTopContributors = async (limit: number = 5): Promise<TopContributor[]> => {
  try {
    // Get users and their feedback counts
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select(`
        id, 
        email, 
        full_name, 
        avatar_url
      `)
      .limit(20); // Pre-filter to improve performance
    
    if (usersError) throw usersError;
    if (!users || users.length === 0) return [];

    // For each user, get stats
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get feedback count
        const { count: feedbackCount } = await supabase
          .from("feedback")
          .select("id", { count: 'exact', head: true })
          .eq("user_id", user.id);
        
        // Get retro count
        const { count: retroCount } = await supabase
          .from("retrospectives")
          .select("id", { count: 'exact', head: true })
          .eq("user_id", user.id);
        
        // Get reaction count
        const { count: reactionCount } = await supabase
          .from("feedback_reactions")
          .select("id", { count: 'exact', head: true })
          .eq("user_id", user.id);
        
        // Calculate engagement score
        // Weights: feedback = 3, retros = 2, reactions = 1
        const score = 
          (feedbackCount || 0) * 3 + 
          (retroCount || 0) * 2 + 
          (reactionCount || 0);
        
        return {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
          score,
          feedbackCount: feedbackCount || 0,
          retroCount: retroCount || 0,
          reactionCount: reactionCount || 0
        };
      })
    );
    
    // Sort by score and return top N
    return usersWithStats
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting top contributors:", error);
    return [];
  }
}; 