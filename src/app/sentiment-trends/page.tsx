"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Smile, Frown, Meh, Filter } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from "@/lib/supabase";

// Define types for our data
type SentimentData = {
  sprintName: string;
  sprintNumber: number;
  positive: number;
  neutral: number;
  negative: number;
  date: string;
  teamName: string;
};

type FilterOptions = {
  team: string;
  timeRange: string;
};

type FeedbackItem = {
  id: string;
  type: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
};

export default function SentimentTrendsPage() {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    team: 'all',
    timeRange: '10'
  });
  const [overallSentiment, setOverallSentiment] = useState({
    positive: 35,
    neutral: 45,
    negative: 20
  });

  useEffect(() => {
    fetchSentimentData();
  }, [filters]);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);
      
      // Fetch all unique team names for the filter
      const { data: teamData, error: teamError } = await supabase
        .from('retrospectives')
        .select('team_name')
        .not('team_name', 'is', null)
        .order('team_name');
      
      if (teamError) throw teamError;
      
      // Extract unique team names
      const uniqueTeams = Array.from(new Set(teamData.map(item => item.team_name)));
      setTeams(uniqueTeams);
      
      // Build the base query to get retrospectives
      let query = supabase
        .from('retrospectives')
        .select(`
          id,
          sprint_number,
          sprint_name,
          team_name,
          created_at,
          feedback:feedback(id, type)
        `)
        .order('sprint_number', { ascending: false })
        .limit(parseInt(filters.timeRange));
      
      // Apply team filter if not "all"
      if (filters.team !== 'all') {
        query = query.eq('team_name', filters.team);
      }
      
      const { data, error: retroError } = await query;
      
      if (retroError) throw retroError;
      
      if (!data || data.length === 0) {
        setSentimentData([]);
        setLoading(false);
        return;
      }
      
      // Process and transform the data for the chart
      const processedData = data.map(retro => {
        // Assign sentiment based on feedback type
        // well = positive, didnt & blocker = negative, suggestion = neutral
        let positive = 0;
        let negative = 0;
        let neutral = 0;
        
        if (retro.feedback && Array.isArray(retro.feedback)) {
          retro.feedback.forEach((feedbackItem: FeedbackItem) => {
            if (feedbackItem.type === 'well') {
              positive++;
            } else if (feedbackItem.type === 'didnt' || feedbackItem.type === 'blocker') {
              negative++;
            } else if (feedbackItem.type === 'suggestion') {
              neutral++;
            }
          });
        }
        
        const totalFeedback = positive + negative + neutral;
        
        // Calculate percentages (avoid division by zero)
        const positivePercent = totalFeedback ? Math.round((positive / totalFeedback) * 100) : 0;
        const neutralPercent = totalFeedback ? Math.round((neutral / totalFeedback) * 100) : 0;
        const negativePercent = totalFeedback ? Math.round((negative / totalFeedback) * 100) : 0;
        
        return {
          sprintName: retro.sprint_name || `Sprint ${retro.sprint_number}`,
          sprintNumber: retro.sprint_number,
          positive: positivePercent,
          neutral: neutralPercent,
          negative: negativePercent,
          date: new Date(retro.created_at).toLocaleDateString(),
          teamName: retro.team_name
        };
      });
      
      // Sort by sprint number for the chart
      const sortedData = [...processedData].sort((a, b) => a.sprintNumber - b.sprintNumber);
      setSentimentData(sortedData);
      
      // Calculate overall sentiment percentages
      let totalPositive = 0;
      let totalNeutral = 0;
      let totalNegative = 0;
      let totalCount = 0;
      
      data.forEach(retro => {
        if (retro.feedback && Array.isArray(retro.feedback)) {
          retro.feedback.forEach((feedbackItem: FeedbackItem) => {
            totalCount++;
            if (feedbackItem.type === 'well') {
              totalPositive++;
            } else if (feedbackItem.type === 'didnt' || feedbackItem.type === 'blocker') {
              totalNegative++;
            } else if (feedbackItem.type === 'suggestion') {
              totalNeutral++;
            }
          });
        }
      });
      
      if (totalCount > 0) {
        setOverallSentiment({
          positive: Math.round((totalPositive / totalCount) * 100),
          neutral: Math.round((totalNeutral / totalCount) * 100),
          negative: Math.round((totalNegative / totalCount) * 100)
        });
      }
      
    } catch (err: any) {
      console.error("Error fetching sentiment data:", err);
      setError(err.message || "Failed to load sentiment data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Custom tooltip component for the chart to fix the label issue
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{`Sprint: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold">Sentiment Trends</h1>
      </div>
      
      <p className="text-gray-600 mb-8">
        Track the sentiment of feedback over time to identify patterns and improvements
      </p>
      
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="font-medium">Filters:</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full md:w-1/3">
              <label className="block text-sm text-gray-600 mb-1">Team</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={filters.team}
                onChange={(e) => handleFilterChange('team', e.target.value)}
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm text-gray-600 mb-1">Time Range</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              >
                <option value="5">Last 5 Sprints</option>
                <option value="10">Last 10 Sprints</option>
                <option value="20">Last 20 Sprints</option>
                <option value="50">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sentiment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Positive Sentiment</h2>
          <div className="flex items-center">
            <Smile className="h-6 w-6 text-green-500 mr-2" />
            <p className="text-3xl font-bold text-green-600">{overallSentiment.positive}%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Neutral Sentiment</h2>
          <div className="flex items-center">
            <Meh className="h-6 w-6 text-yellow-500 mr-2" />
            <p className="text-3xl font-bold text-yellow-600">{overallSentiment.neutral}%</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Negative Sentiment</h2>
          <div className="flex items-center">
            <Frown className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-3xl font-bold text-red-600">{overallSentiment.negative}%</p>
          </div>
        </div>
      </div>
      
      {/* Sentiment Chart */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Sentiment Over Time</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              {error}
            </div>
          ) : sentimentData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No sentiment data available. Try adjusting your filters.
            </p>
          ) : (
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sentimentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="sprintName" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      // Truncate long sprint names
                      return value.length > 15 ? value.substring(0, 12) + '...' : value;
                    }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="positive" 
                    stroke="#10b981" 
                    activeDot={{ r: 8 }} 
                    name="Positive"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="neutral" 
                    stroke="#f59e0b" 
                    name="Neutral"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="negative" 
                    stroke="#ef4444" 
                    name="Negative"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      
      {/* Top Sentiment Topics */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Top Sentiment Topics</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Common themes and topics will be displayed here (future feature)
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 