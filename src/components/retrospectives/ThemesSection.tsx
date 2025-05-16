"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FeedbackType } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, BrainCircuit, CalendarClock, Sparkles, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ThemesProps = {
  retroId: string;
  feedbackType?: FeedbackType;
  refreshTrigger?: number;
};

type Theme = {
  id: string;
  name: string;
  feedback_ids: string[];
  type: string;
  created_at: string;
};

export function ThemesSection({ retroId, feedbackType, refreshTrigger = 0 }: ThemesProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch existing themes from the database
  const fetchThemes = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from("feedback_themes")
        .select("*")
        .eq("retro_id", retroId);

      if (feedbackType) {
        query = query.eq("type", feedbackType);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      setThemes(data || []);
    } catch (err: any) {
      console.error("Error fetching themes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load themes on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchThemes();
  }, [retroId, feedbackType, refreshTrigger]);

  // Display themes or coming soon UI
  return (
    <Card className="glassmorphism overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-secondary/0 rounded-lg z-0" />
      <CardHeader className="flex flex-row items-center justify-between relative z-10">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Identified Themes
          </CardTitle>
          <CardDescription>
            AI-powered themes extracted from feedback
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="relative gradient-border"
        >
          <BrainCircuit className="h-4 w-4 mr-2" />
          Analyze Themes
        </Button>
      </CardHeader>
      <CardContent className="relative z-10">
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Loading themes...</p>
          </div>
        ) : themes.length === 0 ? (
          <div className="py-10 text-center">
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 rounded-xl p-8 max-w-md mx-auto shadow-sm border border-primary/10">
              <div className="bg-white dark:bg-black/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">AI Theme Analysis</h3>
              <p className="text-primary/80 mb-6">
                Our AI-powered theme clustering feature is coming soon!
              </p>
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <CalendarClock className="h-4 w-4" />
                <span>Launching soon</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className="p-4 border border-border/50 rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-medium text-sm">{theme.name}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {theme.feedback_ids.length} items
                  </Badge>
                  {theme.type !== "all" && (
                    <Badge 
                      variant="secondary"
                      className={`
                        ${theme.type === 'well' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : ''}
                        ${theme.type === 'didnt' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : ''}
                        ${theme.type === 'suggestion' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : ''}
                        ${theme.type === 'blocker' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : ''}
                      `}
                    >
                      {theme.type}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Created on {new Date(theme.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" onClick={fetchThemes} className="flex items-center gap-1 hover:text-primary">
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 