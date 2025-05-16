/**
 * Calculate sentiment score based on feedback summary
 * Returns a value between -1 (very negative) and 1 (very positive)
 */
export function calculateSentiment(
  feedbackSummary?: {
    wellCount: number;
    didntCount: number;
    blockerCount: number;
    suggestionCount: number;
    totalCount: number;
  }
): number {
  if (!feedbackSummary || feedbackSummary.totalCount === 0) {
    return 0; // Neutral if no feedback
  }

  // Assign weights to different feedback types
  const positiveScore = feedbackSummary.wellCount * 1.0;
  const negativeScore = feedbackSummary.didntCount * -0.7 + feedbackSummary.blockerCount * -1.0;
  const suggestionScore = feedbackSummary.suggestionCount * 0.1; // Slightly positive

  // Calculate overall sentiment score normalized to [-1, 1]
  const totalScore = positiveScore + negativeScore + suggestionScore;
  const maxPossibleScore = feedbackSummary.totalCount * 1.0; // Maximum if all feedback was positive
  
  return Math.max(-1, Math.min(1, totalScore / maxPossibleScore));
} 