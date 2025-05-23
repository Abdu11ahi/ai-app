"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";

type Provider = "google" | "github" | "apple";

export function OAuthButtons() {
  const [isLoading, setIsLoading] = useState<Provider | null>(null);

  const handleOAuthLogin = async (provider: Provider) => {
    try {
      setIsLoading(provider);
      
      // Determine if we're in production or development
      const isProd = window.location.origin.includes('vercel.app');
      
      // Set the redirect URL based on environment
      const callbackUrl = isProd 
        ? `https://ai-app-wine.vercel.app/api/auth/callback`
        : `${window.location.origin}/api/auth/callback`;
      
      console.log(`Environment: ${isProd ? 'Production' : 'Development'}`);
      console.log(`OAuth redirect URL: ${callbackUrl}`);
      
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        }
      });
      
      // No need to handle redirect here, as Supabase will redirect to the URL specified
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => handleOAuthLogin("google")}
        disabled={isLoading !== null}
        className="flex items-center justify-center gap-2"
      >
        <FaGoogle className="h-4 w-4" />
        {isLoading === "google" ? "Signing in..." : "Continue with Google"}
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => handleOAuthLogin("apple")}
        disabled={isLoading !== null}
        className="flex items-center justify-center gap-2"
      >
        <FaApple className="h-4 w-4" />
        {isLoading === "apple" ? "Signing in..." : "Continue with Apple"}
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => handleOAuthLogin("github")}
        disabled={isLoading !== null}
        className="flex items-center justify-center gap-2"
      >
        <FaGithub className="h-4 w-4" />
        {isLoading === "github" ? "Signing in..." : "Continue with GitHub"}
      </Button>
    </div>
  );
} 