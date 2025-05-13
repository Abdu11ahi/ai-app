"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Choose a social provider to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
              {message}
            </div>
          )}

          <OAuthButtons />
          
          <div className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-center">
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 