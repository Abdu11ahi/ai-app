import { LogoutButton } from "@/components/auth/LogoutButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings, ArrowRight, MessageSquare, BarChart3, Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-3 gradient-text">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome to your protected dashboard
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden glassmorphism">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 rounded-lg z-0" />
            <CardHeader className="relative z-10">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Create New Retrospective</CardTitle>
              <CardDescription>
                Set up a new sprint retrospective session for your team
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground mb-6">
                Gather feedback from your team about what went well, what didn't, and what could be improved.
              </p>
              <Link href="/retrospectives/new">
                <Button className="w-full group">
                  Create Retrospective
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden glassmorphism">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/5 rounded-lg z-0" />
            <CardHeader className="relative z-10">
              <div className="bg-accent/15 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">Feedback Dashboard</CardTitle>
              <CardDescription>
                Analyze feedback across all your retrospectives
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-muted-foreground mb-6">
                View trends, filter by type, and gain insights from your team's feedback over time.
              </p>
              <Link href="/dashboard/feedback">
                <Button variant="outline" className="w-full group gradient-border">
                  View Feedback Analytics
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 