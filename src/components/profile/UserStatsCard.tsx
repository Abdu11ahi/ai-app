"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  MessageSquare, 
  Award, 
  ThumbsUp, 
  Users,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { UserStats } from "@/lib/user-utils";
import { Progress } from "@/components/ui/progress";

type UserStatsCardProps = {
  stats: UserStats;
};

export function UserStatsCard({ stats }: UserStatsCardProps) {
  const { 
    totalRetros, 
    totalFeedback, 
    totalReactions, 
    sentimentBreakdown, 
    averageSentiment 
  } = stats;
  
  // Calculate the total sentiment for percentages
  const totalSentiment = 
    sentimentBreakdown.positive + 
    sentimentBreakdown.negative + 
    sentimentBreakdown.neutral || 1; // avoid division by zero
  
  const positivePercent = Math.round((sentimentBreakdown.positive / totalSentiment) * 100);
  const neutralPercent = Math.round((sentimentBreakdown.neutral / totalSentiment) * 100);
  const negativePercent = Math.round((sentimentBreakdown.negative / totalSentiment) * 100);
  
  // Get the sentiment icon based on average
  const getSentimentIcon = () => {
    switch (averageSentiment) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  // Get sentiment label and color
  const getSentimentLabel = () => {
    switch (averageSentiment) {
      case "positive":
        return { text: "Positive", color: "text-green-500" };
      case "negative":
        return { text: "Negative", color: "text-red-500" };
      default:
        return { text: "Neutral", color: "text-yellow-500" };
    }
  };
  
  const sentimentLabel = getSentimentLabel();
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Participation Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
            <Users className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />
            <div>
              <p className="text-sm text-muted-foreground">Retros Joined</p>
              <p className="text-2xl font-bold">{totalRetros}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
            <MessageSquare className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />
            <div>
              <p className="text-sm text-muted-foreground">Feedback Given</p>
              <p className="text-2xl font-bold">{totalFeedback}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
            <ThumbsUp className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />
            <div>
              <p className="text-sm text-muted-foreground">Reactions</p>
              <p className="text-2xl font-bold">{totalReactions}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center gap-1">
                <Award className="h-4 w-4 text-primary" />
                Average Sentiment
              </h3>
              <span className={`flex items-center gap-1 font-medium ${sentimentLabel.color}`}>
                {getSentimentIcon()}
                {sentimentLabel.text}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Sentiment Breakdown</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Positive</span>
                <span>{sentimentBreakdown.positive} ({positivePercent}%)</span>
              </div>
              <Progress value={positivePercent} className="h-2 bg-muted" indicatorColor="bg-green-500" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600">Neutral</span>
                <span>{sentimentBreakdown.neutral} ({neutralPercent}%)</span>
              </div>
              <Progress value={neutralPercent} className="h-2 bg-muted" indicatorColor="bg-yellow-500" />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-red-600">Negative</span>
                <span>{sentimentBreakdown.negative} ({negativePercent}%)</span>
              </div>
              <Progress value={negativePercent} className="h-2 bg-muted" indicatorColor="bg-red-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 