"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function ProfileIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          // Redirect to the user's profile page
          router.push(`/profile/${data.session.user.id}`);
        } else {
          // If no session, redirect to login
          router.push("/auth/login?message=Please sign in to view your profile");
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
        router.push("/auth/login?message=An error occurred. Please sign in again.");
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      {loading && (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading your profile...</p>
        </div>
      )}
    </div>
  );
} 