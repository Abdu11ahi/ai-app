import { RetroList } from "@/components/retrospectives/RetroList";

export default function RetrospecivesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Retrospectives</h1>
      <RetroList />
    </div>
  );
} 