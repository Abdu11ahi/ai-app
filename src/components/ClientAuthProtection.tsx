"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loading } from "./ui/loading";

interface ClientAuthProtectionProps {
  children: React.ReactNode;
}

export function ClientAuthProtection({ children }: ClientAuthProtectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        const isAuth = !!data.session;
        setIsAuthenticated(isAuth);

        // Redirect logic
        if (isAuth && (pathname === '/auth/login' || pathname === '/auth/signup')) {
          router.push('/dashboard');
        } else if (!isAuth && pathname === '/dashboard') {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuth = !!session;
      setIsAuthenticated(isAuth);
      
      // Redirect logic on auth change
      if (isAuth && (pathname === '/auth/login' || pathname === '/auth/signup')) {
        router.push('/dashboard');
      } else if (!isAuth && pathname === '/dashboard') {
        router.push('/auth/login');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" className="border-primary" />
      </div>
    );
  }

  return <>{children}</>;
} 