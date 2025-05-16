"use client";

import { Suspense, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RetroDetails } from "@/components/retrospectives/RetroDetails";
import { FeedbackForm } from "@/components/retrospectives/FeedbackForm";
import { FeedbackList } from "@/components/retrospectives/FeedbackList";
import { ThemesSection } from "@/components/retrospectives/ThemesSection";

export default function RetroPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger feedback list refresh
  const handleFeedbackAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Link href="/retrospectives">
          <Button variant="outline">← Back to All Retrospectives</Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading retrospective...</div>}>
        <RetroDetails id={id} />
      </Suspense>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="space-y-6">
          <Suspense fallback={<div>Loading form...</div>}>
            <FeedbackForm retroId={id} onFeedbackAdded={handleFeedbackAdded} />
          </Suspense>
        </div>
        
        <div>
          <Suspense fallback={<div>Loading feedback...</div>}>
            <FeedbackList retroId={id} refreshTrigger={refreshTrigger} />
          </Suspense>
        </div>
      </div>
      
      <div className="mt-8">
        <Suspense fallback={<div>Loading themes...</div>}>
          <ThemesSection retroId={id} refreshTrigger={refreshTrigger} />
        </Suspense>
      </div>
    </div>
  );
} 