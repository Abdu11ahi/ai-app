import { Loading } from "@/components/ui/loading";

export default function SignupLoading() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Loading size="large" className="border-primary" />
    </div>
  );
} 