import { LogoutButton } from "@/components/auth/LogoutButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Dashboard</CardTitle>
          <CardDescription className="text-center">
            Welcome to your protected dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            You&apos;re logged in and can see this protected content.
          </p>
          
          <div className="flex flex-col items-center gap-4 mt-6">
            <Link href="/retrospectives/new">
              <Button className="w-full">Create New Retrospective</Button>
            </Link>
            <Link href="/dashboard/feedback">
              <Button className="w-full" variant="outline">View Feedback Dashboard</Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <LogoutButton />
        </CardFooter>
      </Card>
    </div>
  );
} 