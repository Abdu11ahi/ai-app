"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { calculateSentiment } from "@/lib/sentiment";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Retrospective = Database["public"]["Tables"]["retrospectives"]["Row"] & {
  feedbackSummary?: {
    wellCount: number;
    didntCount: number;
    blockerCount: number;
    suggestionCount: number;
    totalCount: number;
  };
  sentiment?: number;
};

type Team = {
  name: string;
  retrospectives: number;
};

type ChartData = {
  name: string;
  date: string;
  sentiment: number;
  totalFeedback: number;
  wellCount: number;
  didntCount: number;
  blockerCount: number;
  suggestionCount: number;
  sprintName: string;
  teamName: string;
  sprintNumber?: number;
};

export function SentimentTrendsDashboard() {
  const [retrospectives, setRetrospectives] = useState<Retrospective[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("10");
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchRetrospectives();
  }, []);

  useEffect(() => {
    if (retrospectives.length > 0) {
      prepareChartData();
    }
  }, [retrospectives, selectedTeam, timeRange]);

  const fetchRetrospectives = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.user) {
        setError("You must be logged in to view sentiment trends");
        setLoading(false);
        return;
      }

      // Fetch all retrospectives for the current user
      const { data: retroData, error: retroError } = await supabase
        .from("retrospectives")
        .select("*")
        .eq("user_id", session.session.user.id)
        .order("created_at", { ascending: false });

      if (retroError) throw retroError;

      // Extract unique teams
      const teamMap = new Map<string, Team>();
      retroData?.forEach(retro => {
        if (!teamMap.has(retro.team_name)) {
          teamMap.set(retro.team_name, { name: retro.team_name, retrospectives: 0 });
        }
        teamMap.get(retro.team_name)!.retrospectives++;
      });
      
      setTeams(Array.from(teamMap.values()));

      // For each retrospective, fetch feedback statistics
      const retrosWithSentiment = await Promise.all((retroData || []).map(async (retro) => {
        // Get feedback counts by type
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select("type")
          .eq("retro_id", retro.id);

        if (feedbackError) {
          console.error("Error fetching feedback:", feedbackError);
          return retro;
        }

        // Calculate counts for each feedback type
        const wellCount = feedbackData?.filter(f => f.type === "well").length || 0;
        const didntCount = feedbackData?.filter(f => f.type === "didnt").length || 0;
        const blockerCount = feedbackData?.filter(f => f.type === "blocker").length || 0;
        const suggestionCount = feedbackData?.filter(f => f.type === "suggestion").length || 0;
        const feedbackSummary = {
          wellCount,
          didntCount,
          blockerCount,
          suggestionCount,
          totalCount: feedbackData?.length || 0
        };
        
        // Calculate sentiment score
        const sentiment = calculateSentiment(feedbackSummary);
        
        return {
          ...retro,
          feedbackSummary,
          sentiment
        };
      }));

      setRetrospectives(retrosWithSentiment);
    } catch (err) {
      console.error("Error fetching retrospectives:", err);
      setError("Failed to load retrospectives. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    // Filter by selected team if applicable
    let filteredRetros = [...retrospectives];
    if (selectedTeam !== "all") {
      filteredRetros = filteredRetros.filter(retro => retro.team_name === selectedTeam);
    }
    
    // Sort by creation date (ascending)
    filteredRetros.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Limit to the most recent N sprints based on timeRange
    const limit = parseInt(timeRange, 10);
    if (filteredRetros.length > limit) {
      filteredRetros = filteredRetros.slice(-limit);
    }
    
    // Transform for chart data
    const data: ChartData[] = filteredRetros.map((retro, index) => {
      const formattedDate = new Date(retro.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      return {
        name: retro.sprint_name || `Sprint ${retro.sprint_number}`,
        date: formattedDate,
        sentiment: retro.sentiment || 0,
        totalFeedback: retro.feedbackSummary?.totalCount || 0,
        wellCount: retro.feedbackSummary?.wellCount || 0,
        didntCount: retro.feedbackSummary?.didntCount || 0,
        blockerCount: retro.feedbackSummary?.blockerCount || 0,
        suggestionCount: retro.feedbackSummary?.suggestionCount || 0,
        sprintName: retro.sprint_name || "",
        sprintNumber: retro.sprint_number,
        teamName: retro.team_name
      };
    });
    
    setChartData(data);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const sentimentValue = data.sentiment;
      const emoji = getSentimentEmoji(sentimentValue);
      
      return (
        <div className="bg-background border border-border/50 p-4 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-1">{data.name}</p>
          <p className="text-xs text-muted-foreground mb-3">{data.date} • {data.teamName}</p>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{emoji}</span>
            <span className="font-medium">
              {sentimentValue.toFixed(2)} sentiment score
            </span>
          </div>
          
          <div className="space-y-1 mt-2 text-xs border-t pt-2">
            <div className="flex justify-between">
              <span>Went well:</span>
              <span className="font-medium text-green-500">{data.wellCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Didn't go well:</span>
              <span className="font-medium text-amber-500">{data.didntCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Blockers:</span>
              <span className="font-medium text-red-500">{data.blockerCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Suggestions:</span>
              <span className="font-medium text-blue-500">{data.suggestionCount}</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t">
              <span>Total Feedback:</span>
              <span>{data.totalFeedback}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getSentimentEmoji = (sentiment: number): string => {
    if (sentiment >= 0.6) return "😃"; // Very positive
    if (sentiment >= 0.3) return "🙂"; // Positive
    if (sentiment >= -0.3) return "😐"; // Neutral
    if (sentiment >= -0.6) return "🙁"; // Negative
    return "😞"; // Very negative
  };

  // Get sentiment color for the line
  const getSentimentColor = (sentiment: number): string => {
    if (sentiment >= 0.6) return "#22c55e"; // Green
    if (sentiment >= 0.3) return "#60a5fa"; // Blue
    if (sentiment >= -0.3) return "#a3a3a3"; // Gray
    if (sentiment >= -0.6) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading sentiment trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-destructive/10 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  if (retrospectives.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">No retrospectives found. Create a retrospective to start tracking sentiment trends.</p>
        <Button asChild>
          <a href="/retrospectives/new">Create Your First Retrospective</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-lg border-border/30 hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Sentiment Trends
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80" side="right">
                      <p>Sentiment scores range from -1 (very negative) to 1 (very positive), based on feedback types.</p>
                      <ul className="mt-2 text-xs space-y-1">
                        <li>• "What went well" contributes positive sentiment (+1.0)</li>
                        <li>• "What didn't go well" contributes negative sentiment (-0.7)</li>
                        <li>• "Blockers" contribute strong negative sentiment (-1.0)</li>
                        <li>• "Suggestions" contribute slight positive sentiment (+0.1)</li>
                      </ul>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>
                Track how team sentiment has evolved across retrospectives
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="team-filter" className="text-xs">Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger id="team-filter" className="min-w-[180px]">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.name} value={team.name}>
                        {team.name} ({team.retrospectives})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="time-range" className="text-xs">Time Range</Label>
                <Tabs defaultValue="10" value={timeRange} onValueChange={setTimeRange} className="w-[300px]">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="5">Last 5</TabsTrigger>
                    <TabsTrigger value="10">Last 10</TabsTrigger>
                    <TabsTrigger value="999">All Time</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-8">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartData.length > 0 ? getSentimentColor(chartData[chartData.length - 1].sentiment) : "#a3a3a3"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartData.length > 0 ? getSentimentColor(chartData[chartData.length - 1].sentiment) : "#a3a3a3"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickMargin={10}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  domain={[-1, 1]} 
                  ticks={[-1, -0.5, 0, 0.5, 1]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  name="Sentiment Score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 6, strokeWidth: 2, fill: "hsl(var(--background))" }}
                  activeDot={{ r: 8, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1000}
                  fillOpacity={1}
                  fill="url(#sentimentGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-4 space-x-8 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">😃</span>
          <span className="text-sm text-muted-foreground">Very Positive (0.6 to 1.0)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🙂</span>
          <span className="text-sm text-muted-foreground">Positive (0.3 to 0.6)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">😐</span>
          <span className="text-sm text-muted-foreground">Neutral (-0.3 to 0.3)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🙁</span>
          <span className="text-sm text-muted-foreground">Negative (-0.6 to -0.3)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">😞</span>
          <span className="text-sm text-muted-foreground">Very Negative (-1.0 to -0.6)</span>
        </div>
      </div>
    </div>
  );
} 