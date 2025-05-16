"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, MessageSquare, Users, ThumbsUp } from "lucide-react";
import { getTopContributors, TopContributor } from "@/lib/user-utils";
import { Skeleton } from "@/components/ui/skeleton";

export function Leaderboard() {
  const [contributors, setContributors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const topUsers = await getTopContributors(5);
        setContributors(topUsers);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);
  
  // Generate initials from name or email
  const getInitials = (user: TopContributor) => {
    if (user.fullName) {
      const nameParts = user.fullName.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    // Fallback to email
    return user.email.substring(0, 2).toUpperCase();
  };
  
  // Get rank badge
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Trophy className="h-3 w-3 mr-1" />
            #1
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-gray-400 hover:bg-gray-500">
            <Medal className="h-3 w-3 mr-1" />
            #2
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-amber-700 hover:bg-amber-800">
            <Medal className="h-3 w-3 mr-1" />
            #3
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            #{index + 1}
          </Badge>
        );
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : contributors.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No contributors data available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {contributors.map((user, index) => (
              <div 
                key={user.id} 
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 
                  'border border-muted/40'
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatarUrl || ''} alt={user.fullName || user.email} />
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">
                      {user.fullName || user.email.split('@')[0]}
                    </h3>
                    {getRankBadge(index)}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1 text-primary" />
                      {user.feedbackCount} feedback
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1 text-primary" />
                      {user.retroCount} retros
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1 text-primary" />
                      {user.reactionCount} reactions
                    </div>
                  </div>
                </div>
                
                <div className="text-lg font-bold text-primary">
                  {user.score}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 