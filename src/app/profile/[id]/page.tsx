"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getUserProfile, UserProfile } from "@/lib/user-utils";
import { supabase } from "@/lib/supabase";
import { checkDatabaseSetup, createTestProfile, testDatabaseConnection } from "@/lib/database-setup";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserStatsCard } from "@/components/profile/UserStatsCard";
import { Leaderboard } from "@/components/profile/Leaderboard";
import { RecentActivity } from "@/components/profile/RecentActivity";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupAndFetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, test direct database connection
        const isConnected = await testDatabaseConnection();
        if (!isConnected) {
          setError("Database connection failed. Check your Supabase configuration and RLS policies.");
          setLoading(false);
          return;
        }
        
        // Check if database is set up
        const isDbSetup = await checkDatabaseSetup();
        console.log("Database setup check result:", isDbSetup);
        
        if (!isDbSetup) {
          // Create test profile
          const testUserId = await createTestProfile();
          console.log("Created test profile with ID:", testUserId);
          
          if (!testUserId) {
            setError("Failed to create test profile. Check Supabase RLS policies and permissions.");
            setLoading(false);
            return;
          }
        }
        
        // Get the current user for comparison
        const { data: session } = await supabase.auth.getSession();
        const isCurrentUserProfile = session?.session?.user?.id === userId;
        setIsCurrentUser(isCurrentUserProfile);
        
        // Fetch the profile info
        const profileData = await getUserProfile(userId);
        if (!profileData) {
          setError("User profile not found. Make sure you're using a valid user ID.");
          
          // If using the test ID but profile not found, there might be a deeper issue
          if (userId === "4251d1b4-08d3-424f-ac20-11d416f68b43") {
            setError("Test user profile could not be retrieved. This might be due to RLS policies or permissions.");
          }
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data. Check the console for details.");
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      setupAndFetchProfile();
    }
  }, [userId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="bg-red-50 text-red-700 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error || "Failed to load user profile"}</p>
          <div className="mt-4 text-sm text-gray-700">
            <p>Try using one of these test profile IDs:</p>
            <ul className="list-disc list-inside mt-2">
              <li className="mt-1">4251d1b4-08d3-424f-ac20-11d416f68b43 (Test User 1)</li>
              <li className="mt-1">e9a7d5c6-7b3a-42f8-91d0-3d678e97f03e (Test User 2)</li>
              <li className="mt-1">a2b8c9d0-1e2f-4a5b-91d0-7c8d9e0f1a2b (Test User 3)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-8">
      {/* Profile header */}
      <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <UserStatsCard stats={profile.stats} />
          <RecentActivity userId={profile.id} />
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
} 