import { SentimentTrendsDashboard } from "@/components/dashboard/SentimentTrendsDashboard";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Sentiment Trends | Team Feedback",
  description: "Track team sentiment trends across retrospectives over time",
};

export default function SentimentTrendsPage() {
  return (
    <div className="container py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Sentiment Trends</h1>
        </div>
        <p className="text-muted-foreground">
          Track how team sentiment has evolved across retrospectives over time
        </p>
      </div>
      <SentimentTrendsDashboard />
    </div>
  );
} 