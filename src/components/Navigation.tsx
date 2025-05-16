"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, User as UserIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };
  
  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path === "/retrospectives" && pathname === "/retrospectives") return true;
    if (path === "/dashboard/feedback" && pathname === "/dashboard/feedback") return true;
    if (path === "/retrospectives/new" && pathname === "/retrospectives/new") return true;
    if (path === "/retrospectives/calendar" && pathname === "/retrospectives/calendar") return true;
    if (path === "/dashboard/sentiment-trends" && pathname === "/dashboard/sentiment-trends") return true;
    if (path === "/profile" && pathname?.startsWith("/profile")) return true;
    
    // Handle sub-paths
    if (path !== "/dashboard" && pathname?.startsWith(path)) return true;
    
    return false;
  };
  
  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
      {children}
    </Link>
  );

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold gradient-text">AI App</span>
        </Link>
        <div>
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <NavLink href="/dashboard">
                    Dashboard
                  </NavLink>
                  <NavLink href="/retrospectives">
                    Retrospectives
                  </NavLink>
                  <NavLink href="/dashboard/feedback">
                    Feedback Dashboard
                  </NavLink>
                  <NavLink href="/dashboard/sentiment-trends">
                    Sentiment Trends
                  </NavLink>
                  <NavLink href="/retrospectives/new">
                    New Retro
                  </NavLink>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={user.email || "User"} />
                          <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button className="gradient-border" variant="outline">Login</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
} 