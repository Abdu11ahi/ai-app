"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { 
  Activity, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  User,
  X,
  MessageSquare,
  TrendingUp,
  Plus
} from "lucide-react";

// Nav links to show in the header
const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/retrospectives", label: "Retrospectives", icon: Activity },
  { href: "/feedback-dashboard", label: "Feedback Dashboard", icon: MessageSquare },
  { href: "/sentiment-trends", label: "Sentiment Trends", icon: TrendingUp },
  { href: "/retro/new", label: "New Retro", icon: Plus },
  { href: "/profile", label: "Profile", icon: User },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Check for user session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Function to determine if a link is active
  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">RetroApp</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center text-sm font-medium ${
                    isActiveLink(link.href)
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href={`/profile/${session.user.id}`}
                  className="text-sm text-gray-600 hover:text-blue-500"
                >
                  {session.user.email}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-sm font-medium bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </>
            ) : loading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-500"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-500 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white p-4 border-t">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center text-sm font-medium ${
                    isActiveLink(link.href)
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t">
              {session ? (
                <>
                  <Link
                    href={`/profile/${session.user.id}`}
                    className="block text-sm text-gray-600 hover:text-blue-500 mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {session.user.email}
                  </Link>
                  <button
                    onClick={async () => {
                      await handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-sm font-medium bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : loading ? (
                <div className="h-8 w-full bg-gray-200 animate-pulse rounded" />
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block text-sm font-medium text-gray-600 hover:text-blue-500 mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block text-sm font-medium bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
} 