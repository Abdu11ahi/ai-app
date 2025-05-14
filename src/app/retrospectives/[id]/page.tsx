import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RetroDetails } from "@/components/retrospectives/RetroDetails";
import { FeedbackForm } from "@/components/retrospectives/FeedbackForm";
import { FeedbackList } from "@/components/retrospectives/FeedbackList";
import { use } from "react";

export default function RetroPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use to unwrap the params Promise
  const { id } = use(params);

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
            <FeedbackForm retroId={id} />
          </Suspense>
        </div>
        
        <div>
          <Suspense fallback={<div>Loading feedback...</div>}>
            <FeedbackList retroId={id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 