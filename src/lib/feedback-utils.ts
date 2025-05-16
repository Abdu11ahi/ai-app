import { supabase } from "./supabase";
import { ReactionType } from "./database.types";

// Type definitions
export type ReactionCount = {
  thumbsup: number;
  thumbsdown: number;
};

export type FeedbackWithReactions = {
  id: string;
  message: string;
  type: string;
  anonymous: boolean;
  created_at: string;
  user_id: string;
  user_email?: string | null;
  reactions: ReactionCount;
  userReaction?: ReactionType | null;
};

/**
 * Toggle a reaction on a feedback item
 */
export const toggleReaction = async (
  feedbackId: string,
  reactionType: ReactionType
): Promise<boolean> => {
  try {
    // First check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      throw new Error("You must be logged in to react to feedback");
    }
    
    const userId = sessionData.session.user.id;
    
    // Check if user already reacted this way
    const { data: existingReactions } = await supabase
      .from("feedback_reactions")
      .select("*")
      .eq("feedback_id", feedbackId)
      .eq("user_id", userId)
      .eq("reaction_type", reactionType);
    
    // If already reacted, remove the reaction
    if (existingReactions && existingReactions.length > 0) {
      const { error } = await supabase
        .from("feedback_reactions")
        .delete()
        .eq("id", existingReactions[0].id);
      
      if (error) throw error;
      return true;
    }
    
    // Check if user reacted with the opposite type
    const oppositeType: ReactionType = reactionType === "thumbsup" ? "thumbsdown" : "thumbsup";
    const { data: oppositeReactions } = await supabase
      .from("feedback_reactions")
      .select("*")
      .eq("feedback_id", feedbackId)
      .eq("user_id", userId)
      .eq("reaction_type", oppositeType);
    
    // If had opposite reaction, remove it
    if (oppositeReactions && oppositeReactions.length > 0) {
      await supabase
        .from("feedback_reactions")
        .delete()
        .eq("id", oppositeReactions[0].id);
    }
    
    // Add the new reaction
    const { error } = await supabase
      .from("feedback_reactions")
      .insert({
        feedback_id: feedbackId,
        user_id: userId,
        reaction_type: reactionType
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return false;
  }
};

/**
 * Get all reactions for a feedback item
 */
export const getReactionsForFeedback = async (
  feedbackId: string
): Promise<ReactionCount> => {
  try {
    const { data: reactions, error } = await supabase
      .from("feedback_reactions")
      .select("reaction_type")
      .eq("feedback_id", feedbackId);
    
    if (error) throw error;
    
    const counts: ReactionCount = {
      thumbsup: 0,
      thumbsdown: 0
    };
    
    reactions?.forEach(reaction => {
      counts[reaction.reaction_type]++;
    });
    
    return counts;
  } catch (error) {
    console.error("Error getting reactions:", error);
    return { thumbsup: 0, thumbsdown: 0 };
  }
};

/**
 * Get user's reaction for a feedback item
 */
export const getUserReaction = async (
  feedbackId: string
): Promise<ReactionType | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return null;
    }
    
    const { data: reactions } = await supabase
      .from("feedback_reactions")
      .select("reaction_type")
      .eq("feedback_id", feedbackId)
      .eq("user_id", sessionData.session.user.id);
    
    if (reactions && reactions.length > 0) {
      return reactions[0].reaction_type as ReactionType;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user reaction:", error);
    return null;
  }
}; 