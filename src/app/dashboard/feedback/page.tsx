import { FeedbackDashboard } from "@/components/dashboard/FeedbackDashboard";

export default function FeedbackDashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Feedback Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        View and analyze feedback across all retrospectives. Filter by sprint, sort by date, and group by user.
      </p>
      <FeedbackDashboard />
    </div>
  );
} 